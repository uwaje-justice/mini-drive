import AppError from "../errors/app-error.js";

const errorHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Something went wrong.";

  if (statusCode >= 500) console.error(err);
  if (res.headersSent) return next(err);

  return res.status(statusCode).render("error", { statusCode, message });
};

export default errorHandler;
