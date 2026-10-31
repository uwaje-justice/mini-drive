import AppError from "./app-error.js";

class UnsupportedMediaTypeError extends AppError {
  constructor(message = "File type is not allowed.") {
    super(message, { statusCode: 415, code: "UNSUPPORTED_MEDIA_TYPE" });
  }
}

export default UnsupportedMediaTypeError;
