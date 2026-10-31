import { csrfSync } from "csrf-sync";

const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) => req.get("x-csrf-token"),
  errorConfig: {
    statusCode: 403,
    message: "Invalid CSRF token.",
    code: "EBADCSRFTOKEN",
  },
});

export const csrfProtection = csrfSynchronisedProtection;

export const generateCsrfToken = (req) => generateToken(req);
