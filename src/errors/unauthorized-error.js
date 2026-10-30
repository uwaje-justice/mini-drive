import AppError from "./app-error.js";

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized.") {
    super(message, { statusCode: 401, code: "UNAUTHORIZED" });
  }
}

export default UnauthorizedError;
