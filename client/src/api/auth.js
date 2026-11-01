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

export const updateEmail = ({ email, currentPassword }) =>
  request("/api/auth/email", {
    method: "PATCH",
    body: { email, currentPassword },
  });

export const updatePassword = ({
  currentPassword,
  newPassword,
  confirmPassword,
}) =>
  request("/api/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword, confirmPassword },
  });
