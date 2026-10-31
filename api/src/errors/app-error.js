class AppError extends Error {
  constructor(
    message,
    { statusCode = 500, code = "APP_ERROR", fields } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}

export default AppError;
