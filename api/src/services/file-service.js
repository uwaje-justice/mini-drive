import BadRequestError from "../errors/bad-request-error.js";
import ConflictError from "../errors/conflict-error.js";
import NotFoundError from "../errors/not-found-error.js";
import prisma from "../lib/prisma.js";
import storage from "../lib/storage.js";

const rootFolderKey = "root";
const folderRelation = { select: { id: true, name: true } };

const fileNameKey = (name) => name.trim().toLowerCase();

const isUniqueViolation = (error) => error.code === "P2002";

const assertFolder = async (ownerId, folderId) => {
  if (!folderId) return null;

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, ownerId },
    select: { id: true },
  });

  if (!folder) throw new NotFoundError("Folder not found.");

  return folder;
};

const assertUniqueFileName = async (ownerId, folderKey, nameKey, excludeId) => {
  const existing = await prisma.file.findFirst({
    where: {
      ownerId,
      folderKey,
      nameKey,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError(
      "A file with this name already exists in this folder.",
    );
  }
};

const getFile = async (ownerId, id) => {
  const file = await prisma.file.findFirst({
    where: { id, ownerId },
    include: { folder: folderRelation },
  });

  if (!file) throw new NotFoundError("File not found.");

  return file;
};

const createFile = async ({ ownerId, folderId, file }) => {
  const folder = await assertFolder(ownerId, folderId);
  const folderKey = folder?.id ?? rootFolderKey;
  const name = file.originalname.trim();

  if (!name) throw new BadRequestError("File name is missing.");

  if (name.length > 255) {
    throw new BadRequestError("File name must be 255 characters or fewer.");
  }

  const nameKey = fileNameKey(name);

  await assertUniqueFileName(ownerId, folderKey, nameKey);

  const saved = await storage.save(file, { ownerId });

  try {
    return await prisma.file.create({
      data: {
        name,
        nameKey,
        ...saved,
        mimeType: file.mimetype,
        size: file.size,
        ownerId,
        folderId: folder?.id ?? null,
        folderKey,
      },
      include: { folder: folderRelation },
    });
  } catch (error) {
    await storage.remove(saved);

    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "A file with this name already exists in this folder.",
      );
    }

    throw error;
  }
};

const createFiles = async ({ ownerId, folderId, files }) => {
  const created = [];
  const errors = [];

  for (const file of files) {
    try {
      created.push(await createFile({ ownerId, folderId, file }));
    } catch (error) {
      if (!(error instanceof ConflictError || error instanceof BadRequestError)) {
        throw error;
      }

      errors.push({
        statusCode: error.statusCode,
        message: `${file.originalname}: ${error.message}`,
      });
    }
  }

  return { created, errors };
};

const assertValidName = (name) => {
  const trimmedName = name.trim();

  if (!trimmedName) throw new BadRequestError("File name is missing.");

  if (trimmedName.length > 255) {
    throw new BadRequestError("File name must be 255 characters or fewer.");
  }

  return trimmedName;
};

const renameFile = async (ownerId, id, { name }) => {
  const file = await getFile(ownerId, id);
  const trimmedName = assertValidName(name);
  const nameKey = fileNameKey(trimmedName);

  await assertUniqueFileName(ownerId, file.folderKey, nameKey, file.id);

  try {
    return await prisma.file.update({
      where: { id: file.id },
      data: { name: trimmedName, nameKey },
      include: { folder: folderRelation },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "A file with this name already exists in this folder.",
      );
    }

    throw error;
  }
};

const moveFile = async (ownerId, id, { folderId }) => {
  const file = await getFile(ownerId, id);
  const folder = await assertFolder(ownerId, folderId);
  const folderKey = folder?.id ?? rootFolderKey;

  await assertUniqueFileName(ownerId, folderKey, file.nameKey, file.id);

  try {
    return await prisma.file.update({
      where: { id: file.id },
      data: { folderId: folder?.id ?? null, folderKey },
      include: { folder: folderRelation },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "A file with this name already exists in this folder.",
      );
    }

    throw error;
  }
};

const deleteFile = async (ownerId, id) => {
  const file = await getFile(ownerId, id);

  await prisma.file.delete({ where: { id: file.id } });

  try {
    await storage.remove(file);
  } catch (error) {
    console.error(error);
  }

  return file;
};

export default {
  createFile,
  createFiles,
  getFile,
  renameFile,
  moveFile,
  deleteFile,
};
