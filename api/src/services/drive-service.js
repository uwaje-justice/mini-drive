import NotFoundError from "../errors/not-found-error.js";
import {
  fileCategories,
  getFileCategory,
  getFileCategoryFilter,
  getFileCategoryId,
} from "../lib/file-categories.js";
import { buildPagination } from "../lib/pagination.js";
import prisma from "../lib/prisma.js";

const activityLimit = 8;
const folderRelation = { select: { id: true, name: true } };
const parentRelation = { select: { id: true, name: true } };

const countCategories = (groups) =>
  groups.reduce(
    (counts, group) => {
      const categoryId = getFileCategoryId(group.mimeType);

      return {
        ...counts,
        [categoryId]: counts[categoryId] + group._count._all,
      };
    },
    Object.fromEntries(fileCategories.map((category) => [category.id, 0])),
  );

const buildActivity = (files, folders) =>
  [
    ...files.map((file) => ({
      type: "file",
      action: "created",
      id: file.id,
      name: file.name,
      folder: file.folder,
      parent: null,
      createdAt: file.createdAt,
    })),
    ...folders.map((folder) => ({
      type: "folder",
      action: "created",
      id: folder.id,
      name: folder.name,
      folder: null,
      parent: folder.parent,
      createdAt: folder.createdAt,
    })),
  ]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, activityLimit);

const listOverview = async (ownerId) => {
  const [fileCount, folderCount, mimeGroups, files, folders] =
    await Promise.all([
      prisma.file.count({ where: { ownerId } }),
      prisma.folder.count({ where: { ownerId } }),
      prisma.file.groupBy({
        by: ["mimeType"],
        where: { ownerId },
        _count: { _all: true },
      }),
      prisma.file.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        take: activityLimit,
        include: { folder: folderRelation },
      }),
      prisma.folder.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        take: activityLimit,
        include: { parent: parentRelation },
      }),
    ]);
  const counts = countCategories(mimeGroups);
  const categories = fileCategories
    .filter((category) => category.id !== "other" || counts.other > 0)
    .map((category) => ({ ...category, count: counts[category.id] }));

  return {
    summary: { fileCount, folderCount },
    categories,
    activity: buildActivity(files, folders),
  };
};

const listCategory = async (ownerId, categoryId, { page } = {}) => {
  const category = getFileCategory(categoryId);

  if (!category) throw new NotFoundError("Category not found.");

  const where = { ownerId, ...getFileCategoryFilter(category.id) };
  const total = await prisma.file.count({ where });
  const pagination = buildPagination({ page, total });
  const files = await prisma.file.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.offset,
    take: pagination.pageSize,
    include: { folder: folderRelation },
  });

  return {
    category: { id: category.id, name: category.name, count: total },
    files,
    pagination,
  };
};

export default { listOverview, listCategory };
