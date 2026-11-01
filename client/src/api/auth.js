import request from "@/api/api-client.js";

export const loginUser = ({ email, password }) =>
  request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const registerUser = ({ email, password, confirmPassword }) =>
  request("/api/auth/register", {
    method: "POST",
    body: { email, password, confirmPassword },
  });

export const logoutUser = () =>
  request("/api/auth/logout", {
    method: "POST",
  });
