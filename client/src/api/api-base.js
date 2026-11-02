const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

const apiUrl = (path) => `${baseUrl}${path}`;

export default apiUrl;
