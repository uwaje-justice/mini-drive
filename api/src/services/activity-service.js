import NotFoundError from "../errors/not-found-error.js";
import { buildPagination } from "../lib/pagination.js";
import prisma from "../lib/prisma.js";

const activityPageSize = 20;
const activityOrder = [{ createdAt: "desc" }, { id: "desc" }];
const searchFields = [
  "targetName",
  "previousName",
  "locationName",
  "fromLocationName",
  "toLocationName",
  "previousEmail",
  "nextEmail",
];

const buildWhere = (ownerId, { text, action, targetType } = {}) => {
  const filters = [];

  if (text) {
    filters.push({
      OR: searchFields.map((field) => ({ [field]: { contains: text } })),
    });
  }
  if (action) filters.push({ action });
  if (targetType) filters.push({ targetType });

  return filters.length > 0 ? { ownerId, AND: filters } : { ownerId };
};

export const recordActivity = (client, activity) =>
  client.activity.create({
    data: activity,
  });

const addAvailability = async (ownerId, activity) => {
  const fileIds = [
    ...new Set(
      activity
        .filter(
          (item) => item.targetType === "file" && item.targetId !== null,
        )
        .map((item) => item.targetId),
    ),
  ];
  const folderIds = [
    ...new Set(
      activity
        .filter(
          (item) => item.targetType === "folder" && item.targetId !== null,
        )
        .map((item) => item.targetId),
    ),
  ];

  const [files, folders] = await Promise.all([
    fileIds.length > 0
      ? prisma.file.findMany({
          where: { ownerId, id: { in: fileIds } },
          select: { id: true },
        })
      : [],
    folderIds.length > 0
      ? prisma.folder.findMany({
          where: { ownerId, id: { in: folderIds } },
          select: { id: true },
        })
      : [],
  ]);
  const availableIds = new Set([
    ...files.map((file) => file.id),
    ...folders.map((folder) => folder.id),
  ]);

  return activity.map((item) => ({
    ...item,
    available:
      item.targetType !== "account" &&
      item.targetId !== null &&
      availableIds.has(item.targetId),
  }));
};

const listRecent = async (ownerId, take) => {
  const activity = await prisma.activity.findMany({
    where: { ownerId },
    orderBy: activityOrder,
    take,
  });

  return addAvailability(ownerId, activity);
};

const listPage = async (ownerId, { page, ...filters } = {}) => {
  const where = buildWhere(ownerId, filters);
  const total = await prisma.activity.count({ where });
  const pagination = buildPagination({
    page,
    total,
    size: activityPageSize,
  });
  const activity = await prisma.activity.findMany({
    where,
    orderBy: activityOrder,
    skip: pagination.offset,
    take: pagination.pageSize,
  });

  return {
    activity: await addAvailability(ownerId, activity),
    pagination,
  };
};

const remove = async (ownerId, id) => {
  const result = await prisma.activity.deleteMany({
    where: { id, ownerId },
  });

  if (result.count === 0) throw new NotFoundError("Activity not found.");
};

const clear = async (ownerId) => {
  await prisma.activity.deleteMany({ where: { ownerId } });
};

export default {
  listRecent,
  listPage,
  remove,
  clear,
};
