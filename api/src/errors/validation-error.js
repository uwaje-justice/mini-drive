import AppError from "./app-error.js";

class ValidationError extends AppError {
  constructor(fields, message = "Validation failed.") {
    super(message, {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      fields,
    });
  }
}

export default ValidationError;
