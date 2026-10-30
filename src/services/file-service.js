import prisma from "../lib/prisma.js";
import storage from "../lib/storage.js";
import BadRequestError from "../errors/bad-request-error.js";
import ConflictError from "../errors/conflict-error.js";
import NotFoundError from "../errors/not-found-error.js";

const rootFolderKey = "root";

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

const assertUniqueFileName = async (ownerId, folderKey, nameKey) => {
  const existing = await prisma.file.findFirst({
    where: { ownerId, folderKey, nameKey },
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
    include: { folder: { select: { id: true, name: true } } },
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

export default { createFile, getFile, deleteFile };
