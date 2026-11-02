import apiUrl from "@/api/api-base.js";
import request from "@/api/api-client.js";

const folderPath = (folderId, suffix = "") =>
  `/api/folders/${encodeURIComponent(folderId)}${suffix}`;

const sharePath = (token, suffix = "") =>
  `/api/public/shares/${encodeURIComponent(token)}${suffix}`;

const query = (params) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) search.set(key, value);
  }

  const value = search.toString();

  return value ? `?${value}` : "";
};

export const listFolderShares = (folderId) =>
  request(folderPath(folderId, "/shares"));

export const createFolderShare = ({ folderId, days }) =>
  request(folderPath(folderId, "/shares"), {
    method: "POST",
    body: { days },
  });

export const revokeFolderShare = ({ folderId, shareId }) =>
  request(folderPath(folderId, `/shares/${encodeURIComponent(shareId)}`), {
    method: "DELETE",
  });

export const getPublicShare = (
  token,
  { folderId = null, page = 1, folderPage = 1 } = {},
) => {
  const path = folderId
    ? sharePath(token, `/folders/${encodeURIComponent(folderId)}`)
    : sharePath(token);

  return request(`${path}${query({ page, folderPage })}`);
};

export const publicSharePath = (token, folderId = null) =>
  folderId
    ? `/share/${encodeURIComponent(token)}/folders/${encodeURIComponent(folderId)}`
    : `/share/${encodeURIComponent(token)}`;

export const publicFileDownloadUrl = (token, fileId) =>
  apiUrl(sharePath(token, `/files/${encodeURIComponent(fileId)}/download`));

export const publicFilePreviewUrl = (token, fileId) =>
  apiUrl(sharePath(token, `/files/${encodeURIComponent(fileId)}/preview`));
