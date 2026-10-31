import AppError from "./app-error.js";

class PayloadTooLargeError extends AppError {
  constructor(message = "File is too large.") {
    super(message, { statusCode: 413, code: "PAYLOAD_TOO_LARGE" });
  }
}

export default PayloadTooLargeError;
