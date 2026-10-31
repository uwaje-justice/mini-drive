import AppError from "./app-error.js";

class EnvError extends AppError {
  constructor(key) {
    super(`Environment variable: ${key}.`, {
      statusCode: 500,
      code: "ENV_ERROR",
    });
  }
}

export default EnvError;
