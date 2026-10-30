import AppError from "./app-error.js";

class ConflictError extends AppError {
  constructor(message) {
    super(message, { statusCode: 409, code: "CONFLICT" });
  }
}

export default ConflictError;
