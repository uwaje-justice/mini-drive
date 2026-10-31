import { randomUUID } from "node:crypto";

import NotFoundError from "../errors/not-found-error.js";
import prisma from "../lib/prisma.js";
import folderService from "./folder-service.js";

const dayInMs = 24 * 60 * 60 * 1000;

const shareNotFound = () => new NotFoundError("Share link not found or expired.");

const listShareLinks = async (ownerId, folderId) => {
  const folder = await folderService.getFolder(ownerId, folderId);

  const links = await prisma.shareLink.findMany({
    where: { folderId: folder.id },
    orderBy: { createdAt: "desc" },
  });

  return { folder, links };
};

const createShareLink = async (ownerId, folderId, days) => {
  const folder = await folderService.getFolder(ownerId, folderId);

  return prisma.shareLink.create({
    data: {
      token: randomUUID(),
      folderId: folder.id,
      expiresAt: new Date(Date.now() + days * dayInMs),
    },
  });
};

const revokeShareLink = async (ownerId, folderId, shareId) => {
  const link = await prisma.shareLink.findFirst({
    where: { id: shareId, folderId, folder: { ownerId } },
  });

  if (!link) throw new NotFoundError("Share link not found.");

  await prisma.shareLink.delete({ where: { id: link.id } });

  return link;
};

const getValidShare = async (token) => {
  const share = await prisma.shareLink.findUnique({
    where: { token },
    include: { folder: true },
  });

  if (!share || share.expiresAt.getTime() <= Date.now()) {
    throw shareNotFound();
  }

  return share;
};

const getSharedContents = async (
  token,
  folderId,
  { page, folderPage } = {},
) => {
  const share = await getValidShare(token);
  const ownerId = share.folder.ownerId;
  const targetId = folderId ?? share.folderId;
  const folderIds = await folderService.getSubtreeFolderIds(
    ownerId,
    share.folderId,
  );

  if (!folderIds.includes(targetId)) throw shareNotFound();

  const contents = await folderService.getContents(ownerId, targetId, {
    page,
    folderPage,
    breadcrumbRootId: share.folderId,
  });
  const folder =
    targetId === share.folderId
      ? { ...contents.folder, parentId: null }
      : contents.folder;

  return { share, ...contents, folder };
};

const getSharedFile = async (token, fileId) => {
  const share = await getValidShare(token);
  const ownerId = share.folder.ownerId;
  const folderIds = await folderService.getSubtreeFolderIds(
    ownerId,
    share.folderId,
  );

  const file = await prisma.file.findFirst({
    where: { id: fileId, ownerId, folderId: { in: folderIds } },
  });

  if (!file) throw shareNotFound();

  return file;
};

export default {
  listShareLinks,
  createShareLink,
  revokeShareLink,
  getSharedContents,
  getSharedFile,
};
