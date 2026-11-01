export const queryKeys = {
  session: ["session"],
  driveOverview: ["drive", "overview"],
  driveRoot: (page, folderPage) => ["drive", "root", page, folderPage],
  driveCategory: (categoryId, page) => [
    "drive",
    "category",
    categoryId,
    page,
  ],
  folder: (folderId, page, folderPage) => [
    "drive",
    "folder",
    folderId,
    page,
    folderPage,
  ],
  file: (fileId) => ["files", fileId],
  fileMoveTargets: (fileId) => ["files", fileId, "move-targets"],
  folderMoveTargets: (folderId) => [
    "folders",
    folderId,
    "move-targets",
  ],
  search: (query, page) => ["search", query, page],
  folderShares: (folderId) => ["shares", folderId],
  publicShare: (token, folderId = null) => [
    "public-share",
    token,
    folderId,
  ],
};
