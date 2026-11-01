import { getPreviewKind } from "./lib/preview.js";

const serializeDate = (value) => (value ? value.toISOString() : null);

export const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  createdAt: serializeDate(user.createdAt),
});

export const serializeFolder = (folder) => ({
  id: folder.id,
  name: folder.name,
  parentId: folder.parentId ?? null,
  createdAt: serializeDate(folder.createdAt),
});

export const serializeFile = (file) => ({
  id: file.id,
  name: file.name,
  folderId: file.folderId ?? null,
  folder: file.folder
    ? { id: file.folder.id, name: file.folder.name }
    : null,
  mimeType: file.mimeType,
  size: file.size,
  previewKind: getPreviewKind(file.mimeType),
  createdAt: serializeDate(file.createdAt),
});

export const serializeBreadcrumb = (breadcrumb) => ({
  id: breadcrumb.id ?? null,
  name: breadcrumb.name,
});

export const serializePagination = (pagination) => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  total: pagination.total,
  totalPages: pagination.totalPages,
  hasPrevious: pagination.hasPrevious,
  hasNext: pagination.hasNext,
});

export const serializeMoveTarget = (target) => ({
  id: target.id ?? null,
  name: target.name,
  path: target.path,
  depth: target.depth,
});

export const serializeShareLink = (link) => ({
  id: link.id,
  token: link.token,
  folderId: link.folderId,
  expiresAt: serializeDate(link.expiresAt),
  createdAt: serializeDate(link.createdAt),
  expired: link.expiresAt.getTime() <= Date.now(),
});

export const serializeDrive = ({
  folder = null,
  folders,
  files,
  folderPagination,
  filePagination,
  breadcrumbs,
}) => ({
  ...(folder ? { folder: serializeFolder(folder) } : {}),
  folders: folders.map(serializeFolder),
  files: files.map(serializeFile),
  folderPagination: serializePagination(folderPagination),
  filePagination: serializePagination(filePagination),
  breadcrumbs: breadcrumbs.map(serializeBreadcrumb),
});

export const serializeDriveCategory = (category) => ({
  id: category.id,
  name: category.name,
  count: category.count,
});

export const serializeActivity = (activity) => ({
  type: activity.type,
  action: activity.action,
  id: activity.id,
  name: activity.name,
  folder: activity.folder
    ? { id: activity.folder.id, name: activity.folder.name }
    : null,
  parent: activity.parent
    ? { id: activity.parent.id, name: activity.parent.name }
    : null,
  createdAt: serializeDate(activity.createdAt),
});

export const serializeDriveOverview = ({ summary, categories, activity }) => ({
  summary,
  categories: categories.map(serializeDriveCategory),
  activity: activity.map(serializeActivity),
});

export const serializeCategoryListing = ({
  category,
  files,
  pagination,
}) => ({
  category: serializeDriveCategory(category),
  files: files.map(serializeFile),
  pagination: serializePagination(pagination),
});

export const serializeSearchResult = (result) => ({
  type: result.type,
  id: result.id,
  name: result.name,
  path: result.path,
  folderId: result.folderId ?? null,
  size: result.size,
  mimeType: result.mimeType,
  previewKind: result.mimeType ? getPreviewKind(result.mimeType) : null,
  createdAt: serializeDate(result.createdAt),
});

export const serializeShare = (share) => ({
  token: share.token,
  folderId: share.folderId,
  expiresAt: serializeDate(share.expiresAt),
  createdAt: serializeDate(share.createdAt),
});
