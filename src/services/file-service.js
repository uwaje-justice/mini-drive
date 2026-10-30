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

const createFile = async ({ ownerId, folderId, file }) => {
  const folder = await assertFolder(ownerId, folderId);
  const folderKey = folder?.id ?? rootFolderKey;
  const name = file.originalname.trim();

  if (!name) throw new BadRequestError("File name is missing.");

  const nameKey = fileNameKey(name);

  await assertUniqueFileName(ownerId, folderKey, nameKey);

  const saved = await storage.save(file);

  try {
    return await prisma.file.create({
      data: {
        name,
        nameKey,
        storageKey: saved.key,
        mimeType: file.mimetype,
        size: file.size,
        ownerId,
        folderId: folder?.id ?? null,
        folderKey,
      },
    });
  } catch (error) {
    await storage.remove(saved.key);

    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "A file with this name already exists in this folder.",
      );
    }

    throw error;
  }
};

export default { createFile };
