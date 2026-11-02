import request from "@/api/api-client.js";

const folderPath = (folderId, suffix = "") =>
  `/api/folders/${encodeURIComponent(folderId)}${suffix}`;

export const createFolder = ({ name, parentId = null }) =>
  request("/api/folders", {
    method: "POST",
    body: { name, ...(parentId ? { parentId } : {}) },
  });

export const renameFolder = ({ folderId, name }) =>
  request(folderPath(folderId), {
    method: "PATCH",
    body: { name },
  });

export const moveFolder = ({ folderId, parentId = null }) =>
  request(folderPath(folderId, "/move"), {
    method: "POST",
    body: { parentId },
  });

export const deleteFolder = (folderId) =>
  request(folderPath(folderId), { method: "DELETE" });

export const getFolderMoveTargets = (folderId) =>
  request(folderPath(folderId, "/move-targets"));
