import AppError from "../errors/app-error.js";

const isApiRequest = (req) =>
  req.originalUrl === "/api" || req.originalUrl.startsWith("/api/");

const apiErrorCode = (error, statusCode) => {
  if (error.code === "EBADCSRFTOKEN") return "CSRF_INVALID";
  if (error instanceof AppError) return error.code;

  return statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED";
};

const errorHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message =
    isAppError || statusCode < 500 ? err.message : "Something went wrong.";

  if (statusCode >= 500) console.error(err);
  if (res.headersSent) return next(err);

  if (isApiRequest(req)) {
    res.set({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });

    return res.status(statusCode).json({
      error: {
        code: apiErrorCode(err, statusCode),
        message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  return res.status(statusCode).render("error", {
    statusCode,
    message,
    csrfToken: req.csrfToken?.() ?? "",
  });
};

export default errorHandler;
