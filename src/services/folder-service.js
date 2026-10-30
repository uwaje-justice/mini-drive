import prisma from "../lib/prisma.js";
import storage from "../lib/storage.js";
import ConflictError from "../errors/conflict-error.js";
import NotFoundError from "../errors/not-found-error.js";

const rootParentKey = "root";

const folderNameKey = (name) => name.trim().toLowerCase();

const isUniqueViolation = (error) => error.code === "P2002";

const getFolder = async (ownerId, id) => {
  const folder = await prisma.folder.findFirst({
    where: { id, ownerId },
  });

  if (!folder) throw new NotFoundError("Folder not found.");

  return folder;
};

const assertParent = (ownerId, parentId) =>
  parentId ? getFolder(ownerId, parentId) : null;

const assertUniqueName = async (ownerId, parentKey, nameKey, excludeId) => {
  const sibling = await prisma.folder.findFirst({
    where: {
      ownerId,
      parentKey,
      nameKey,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (sibling) {
    throw new ConflictError("A folder with this name already exists here.");
  }
};

const listRoot = async (ownerId) => {
  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId, parentId: null },
      orderBy: { name: "asc" },
    }),
    prisma.file.findMany({
      where: { ownerId, folderId: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { folders, files };
};

const getContents = async (ownerId, id) => {
  const folder = await getFolder(ownerId, id);

  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId, parentId: id },
      orderBy: { name: "asc" },
    }),
    prisma.file.findMany({
      where: { ownerId, folderId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { folder, folders, files };
};

const createFolder = async (ownerId, { name, parentId }) => {
  const parent = await assertParent(ownerId, parentId);
  const trimmedName = name.trim();
  const nameKey = folderNameKey(trimmedName);
  const parentKey = parent?.id ?? rootParentKey;

  await assertUniqueName(ownerId, parentKey, nameKey);

  try {
    return await prisma.folder.create({
      data: {
        name: trimmedName,
        nameKey,
        ownerId,
        parentId: parent?.id ?? null,
        parentKey,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("A folder with this name already exists here.");
    }

    throw error;
  }
};

const renameFolder = async (ownerId, id, { name }) => {
  const folder = await getFolder(ownerId, id);
  const trimmedName = name.trim();
  const nameKey = folderNameKey(trimmedName);

  await assertUniqueName(ownerId, folder.parentKey, nameKey, folder.id);

  try {
    return await prisma.folder.update({
      where: { id: folder.id },
      data: { name: trimmedName, nameKey },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("A folder with this name already exists here.");
    }

    throw error;
  }
};

const collectFolderIds = async (ownerId, rootId) => {
  const folders = await prisma.folder.findMany({
    where: { ownerId },
    select: { id: true, parentId: true },
  });

  const ids = new Set([rootId]);
  let added = true;

  while (added) {
    added = false;

    for (const folder of folders) {
      if (folder.parentId && ids.has(folder.parentId) && !ids.has(folder.id)) {
        ids.add(folder.id);
        added = true;
      }
    }
  }

  return [...ids];
};

const getSubtreeFolderIds = async (ownerId, rootId) => {
  const folder = await getFolder(ownerId, rootId);

  return collectFolderIds(ownerId, folder.id);
};

const deleteFolder = async (ownerId, id) => {
  const folder = await getFolder(ownerId, id);
  const folderIds = await collectFolderIds(ownerId, id);

  const files = await prisma.file.findMany({
    where: { ownerId, folderId: { in: folderIds } },
    select: {
      storageProvider: true,
      storageKey: true,
      storageFormat: true,
      storageResourceType: true,
      mimeType: true,
    },
  });

  await prisma.$transaction([
    prisma.file.deleteMany({
      where: { ownerId, folderId: { in: folderIds } },
    }),
    prisma.folder.deleteMany({ where: { id: { in: folderIds } } }),
  ]);

  const removals = await Promise.allSettled(
    files.map((file) => storage.remove(file)),
  );

  for (const removal of removals) {
    if (removal.status === "rejected") console.error(removal.reason);
  }

  return folder;
};

export default {
  listRoot,
  getContents,
  getFolder,
  getSubtreeFolderIds,
  createFolder,
  renameFolder,
  deleteFolder,
};
