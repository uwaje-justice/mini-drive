import AppError from "./app-error.js";

class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super(message, { statusCode: 404, code: "NOT_FOUND" });
  }
}

export default NotFoundError;
