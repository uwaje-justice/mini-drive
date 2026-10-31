import { csrfSync } from "csrf-sync";

const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) =>
    req.body?._csrf ?? req.get("x-csrf-token"),
  errorConfig: {
    statusCode: 403,
    message: "Invalid CSRF token. Refresh the page and try again.",
    code: "EBADCSRFTOKEN",
  },
  skipCsrfProtection: (req) =>
    req.path === "/files/upload" && Boolean(req.is("multipart/form-data")),
});

export const csrfProtection = csrfSynchronisedProtection;

export const attachCsrfToken = (req, res, next) => {
  res.locals.csrfToken = generateToken(req);
  next();
};
