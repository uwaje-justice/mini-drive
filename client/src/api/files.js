import apiUrl from "@/api/api-base.js";
import request, { requestUpload } from "@/api/api-client.js";

const filePath = (fileId, suffix = "") =>
  `/api/files/${encodeURIComponent(fileId)}${suffix}`;

export const getFile = (fileId) => request(filePath(fileId));

export const uploadFiles = ({ files, folderId = null, onProgress }) => {
  const body = new FormData();

  for (const file of files) body.append("files", file);
  if (folderId) body.append("folderId", folderId);

  return requestUpload("/api/files", { body, onProgress });
};

export const renameFile = ({ fileId, name }) =>
  request(filePath(fileId), {
    method: "PATCH",
    body: { name },
  });

export const moveFile = ({ fileId, folderId = null }) =>
  request(filePath(fileId, "/move"), {
    method: "POST",
    body: { folderId },
  });

export const deleteFile = (fileId) =>
  request(filePath(fileId), { method: "DELETE" });

export const getFileMoveTargets = (fileId) =>
  request(filePath(fileId, "/move-targets"));

export const fileDownloadUrl = (fileId) =>
  apiUrl(filePath(fileId, "/download"));

export const filePreviewUrl = (fileId) => apiUrl(filePath(fileId, "/preview"));
