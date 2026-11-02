import request from "@/api/api-client.js";

const toQueryString = (params) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      search.set(key, value);
    }
  }

  const value = search.toString();

  return value ? `?${value}` : "";
};

export const getDriveOverview = () => request("/api/drive/overview");

export const getDriveActivity = ({
  page = 1,
  query = "",
  action = "",
  targetType = "",
} = {}) =>
  request(
    `/api/drive/activity${toQueryString({
      page,
      q: query,
      action,
      targetType,
    })}`,
  );

export const clearDriveActivityItem = (activityId) =>
  request(`/api/drive/activity/${encodeURIComponent(activityId)}`, {
    method: "DELETE",
  });

export const clearDriveActivity = () =>
  request("/api/drive/activity", { method: "DELETE" });

export const getDriveRoot = ({ page = 1, folderPage = 1 } = {}) =>
  request(`/api/drive${toQueryString({ page, folderPage })}`);

export const getDriveCategory = (categoryId, { page = 1 } = {}) =>
  request(
    `/api/drive/categories/${encodeURIComponent(categoryId)}${toQueryString({ page })}`,
  );

export const getFolder = (folderId, { page = 1, folderPage = 1 } = {}) =>
  request(
    `/api/folders/${encodeURIComponent(folderId)}${toQueryString({ page, folderPage })}`,
  );
