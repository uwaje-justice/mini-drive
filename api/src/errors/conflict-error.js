import AppError from "./app-error.js";

class ConflictError extends AppError {
  constructor(message, fields) {
    super(message, { statusCode: 409, code: "CONFLICT", fields });
  }
}

export default ConflictError;
