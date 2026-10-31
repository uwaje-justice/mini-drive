import AppError from "../errors/app-error.js";

const errorCode = (error, statusCode) => {
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

  return res
    .status(statusCode)
    .set({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    })
    .json({
      error: {
        code: errorCode(err, statusCode),
        message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
};

export default errorHandler;
