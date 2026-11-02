import request from "@/api/api-client.js";

export const searchDrive = ({ query, page = 1 }) => {
  const search = new URLSearchParams({ q: query, page: String(page) });

  return request(`/api/search?${search.toString()}`);
};
