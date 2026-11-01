export const queryKeys = {
  session: ["session"],
  driveRoot: ["drive", "root"],
  folder: (folderId) => ["drive", "folder", folderId],
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
