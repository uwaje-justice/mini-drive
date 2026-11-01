import request from "@/api/api-client.js";

const filePath = (fileId, suffix = "") =>
  `/api/files/${encodeURIComponent(fileId)}${suffix}`;

export const getFile = (fileId) => request(filePath(fileId));

export const fileDownloadUrl = (fileId) => filePath(fileId, "/download");

export const filePreviewUrl = (fileId) => filePath(fileId, "/preview");
