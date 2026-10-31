import { buildPagination } from "../lib/pagination.js";
import prisma from "../lib/prisma.js";
import folderService from "./folder-service.js";

const searchDrive = async (ownerId, rawQuery, { page } = {}) => {
  const query = rawQuery.trim();

  if (!query) {
    return {
      query: "",
      results: [],
      pagination: buildPagination({ page, total: 0 }),
    };
  }

  const nameQuery = query.toLowerCase();
  const [folders, files, paths] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId, nameKey: { contains: nameQuery } },
      select: { id: true, name: true, parentId: true, createdAt: true },
    }),
    prisma.file.findMany({
      where: { ownerId, nameKey: { contains: nameQuery } },
      select: {
        id: true,
        name: true,
        folderId: true,
        size: true,
        mimeType: true,
        createdAt: true,
      },
    }),
    folderService.getFolderPathMap(ownerId),
  ]);

  const pathFor = (folderId) =>
    folderId ? paths.get(folderId) ?? "My drive" : "My drive";

  const results = [
    ...folders.map((folder) => ({
      type: "folder",
      id: folder.id,
      name: folder.name,
      path: pathFor(folder.parentId),
      folderId: folder.id,
      size: null,
      mimeType: null,
      createdAt: folder.createdAt,
    })),
    ...files.map((file) => ({
      type: "file",
      id: file.id,
      name: file.name,
      path: pathFor(file.folderId),
      folderId: file.folderId,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    })),
  ].sort((left, right) => {
    if (left.type !== right.type) return left.type === "folder" ? -1 : 1;

    return left.name.localeCompare(right.name);
  });

  const pagination = buildPagination({ page, total: results.length });

  return {
    query,
    results: results.slice(
      pagination.offset,
      pagination.offset + pagination.pageSize,
    ),
    pagination,
  };
};

export default { searchDrive };
