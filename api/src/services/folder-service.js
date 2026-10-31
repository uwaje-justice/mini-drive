import BadRequestError from "../errors/bad-request-error.js";
import ConflictError from "../errors/conflict-error.js";
import NotFoundError from "../errors/not-found-error.js";
import { buildPagination } from "../lib/pagination.js";
import prisma from "../lib/prisma.js";
import storage from "../lib/storage.js";

const rootParentKey = "root";
const rootCrumb = { id: null, name: "My drive" };
const fileFolderInclude = { folder: { select: { id: true, name: true } } };

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

const folderRecords = (ownerId) =>
  prisma.folder.findMany({
    where: { ownerId },
    select: { id: true, name: true, parentId: true },
  });

const buildFolderContext = (folders) => {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const paths = new Map();
  const depths = new Map();

  const resolve = (folderId, seen = new Set()) => {
    if (paths.has(folderId)) return;

    const folder = byId.get(folderId);

    if (!folder || seen.has(folderId)) {
      paths.set(folderId, "My drive");
      depths.set(folderId, 0);
      return;
    }

    seen.add(folderId);

    if (folder.parentId) resolve(folder.parentId, seen);

    const parentPath = folder.parentId
      ? paths.get(folder.parentId) ?? "My drive"
      : "My drive";
    const parentDepth = folder.parentId ? depths.get(folder.parentId) ?? 0 : 0;

    paths.set(
      folderId,
      folder.parentId ? `${parentPath} / ${folder.name}` : folder.name,
    );
    depths.set(folderId, parentDepth + 1);
  };

  for (const folder of folders) resolve(folder.id);

  return { byId, paths, depths };
};

const collectIds = (folders, rootId) => {
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

  return ids;
};

const collectFolderIds = async (ownerId, rootId) => {
  const folders = await folderRecords(ownerId);

  return [...collectIds(folders, rootId)];
};

const getSubtreeFolderIds = async (ownerId, rootId) => {
  const folder = await getFolder(ownerId, rootId);

  return collectFolderIds(ownerId, folder.id);
};

const getBreadcrumbs = async (
  ownerId,
  folder = null,
  { stopAtId = null } = {},
) => {
  if (!folder) return [rootCrumb];

  const folders = await folderRecords(ownerId);
  const { byId } = buildFolderContext(folders);
  const crumbs = [];
  const seen = new Set();
  let current = byId.get(folder.id) ?? folder;

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    crumbs.unshift({ id: current.id, name: current.name });
    if (current.id === stopAtId) break;
    current = current.parentId ? byId.get(current.parentId) : null;
  }

  return stopAtId ? crumbs : [rootCrumb, ...crumbs];
};

const getFolderPathMap = async (ownerId) => {
  const folders = await folderRecords(ownerId);

  return buildFolderContext(folders).paths;
};

const listMoveTargets = async (ownerId, { excludeFolderId = null } = {}) => {
  const folders = await folderRecords(ownerId);
  const { paths, depths } = buildFolderContext(folders);
  const excluded = excludeFolderId
    ? collectIds(folders, excludeFolderId)
    : new Set();

  return [
    { id: null, name: "My drive", path: "My drive", depth: 0 },
    ...folders
      .filter((folder) => !excluded.has(folder.id))
      .sort((left, right) =>
        (paths.get(left.id) ?? "").localeCompare(paths.get(right.id) ?? ""),
      )
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        path: paths.get(folder.id) ?? folder.name,
        depth: depths.get(folder.id) ?? 0,
      })),
  ];
};

const listRoot = async (ownerId, { page, folderPage } = {}) => {
  const [folderTotal, fileTotal] = await Promise.all([
    prisma.folder.count({ where: { ownerId, parentId: null } }),
    prisma.file.count({ where: { ownerId, folderId: null } }),
  ]);
  const folderPagination = buildPagination({ page: folderPage, total: folderTotal });
  const filePagination = buildPagination({ page, total: fileTotal });

  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId, parentId: null },
      orderBy: { name: "asc" },
      skip: folderPagination.offset,
      take: folderPagination.pageSize,
    }),
    prisma.file.findMany({
      where: { ownerId, folderId: null },
      orderBy: { createdAt: "desc" },
      skip: filePagination.offset,
      take: filePagination.pageSize,
      include: fileFolderInclude,
    }),
  ]);

  return {
    folders,
    files,
    folderPagination,
    filePagination,
    breadcrumbs: [rootCrumb],
  };
};

const getContents = async (
  ownerId,
  id,
  { page, folderPage, breadcrumbRootId = null } = {},
) => {
  const folder = await getFolder(ownerId, id);
  const [folderTotal, fileTotal, breadcrumbs] = await Promise.all([
    prisma.folder.count({ where: { ownerId, parentId: id } }),
    prisma.file.count({ where: { ownerId, folderId: id } }),
    getBreadcrumbs(ownerId, folder, { stopAtId: breadcrumbRootId }),
  ]);
  const folderPagination = buildPagination({ page: folderPage, total: folderTotal });
  const filePagination = buildPagination({ page, total: fileTotal });

  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId, parentId: id },
      orderBy: { name: "asc" },
      skip: folderPagination.offset,
      take: folderPagination.pageSize,
    }),
    prisma.file.findMany({
      where: { ownerId, folderId: id },
      orderBy: { createdAt: "desc" },
      skip: filePagination.offset,
      take: filePagination.pageSize,
      include: fileFolderInclude,
    }),
  ]);

  return { folder, folders, files, folderPagination, filePagination, breadcrumbs };
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

const moveFolder = async (ownerId, id, { parentId }) => {
  const folder = await getFolder(ownerId, id);
  const parent = await assertParent(ownerId, parentId);

  if (parent) {
    const folderIds = await collectFolderIds(ownerId, folder.id);

    if (folderIds.includes(parent.id)) {
      throw new BadRequestError(
        "A folder cannot move into itself or its subfolder.",
      );
    }
  }

  const parentKey = parent?.id ?? rootParentKey;

  await assertUniqueName(ownerId, parentKey, folder.nameKey, folder.id);

  try {
    return await prisma.folder.update({
      where: { id: folder.id },
      data: {
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
  getBreadcrumbs,
  getFolderPathMap,
  listMoveTargets,
  createFolder,
  renameFolder,
  moveFolder,
  deleteFolder,
};
