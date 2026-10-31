import AppError from "./app-error.js";

class BadRequestError extends AppError {
  constructor(message = "Bad request.") {
    super(message, { statusCode: 400, code: "BAD_REQUEST" });
  }
}

export default BadRequestError;
