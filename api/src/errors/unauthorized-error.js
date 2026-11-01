import AppError from "./app-error.js";

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized.", fields) {
    super(message, { statusCode: 401, code: "UNAUTHORIZED", fields });
  }
}

export default UnauthorizedError;
