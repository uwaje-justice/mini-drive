import request from "@/api/api-client.js";

const query = (params) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) search.set(key, value);
  }

  const value = search.toString();

  return value ? `?${value}` : "";
};

export const getDriveOverview = () => request("/api/drive/overview");

export const getDriveRoot = ({ page = 1, folderPage = 1 } = {}) =>
  request(`/api/drive${query({ page, folderPage })}`);

export const getDriveCategory = (categoryId, { page = 1 } = {}) =>
  request(
    `/api/drive/categories/${encodeURIComponent(categoryId)}${query({ page })}`,
  );

export const getFolder = (folderId, { page = 1, folderPage = 1 } = {}) =>
  request(
    `/api/folders/${encodeURIComponent(folderId)}${query({ page, folderPage })}`,
  );
