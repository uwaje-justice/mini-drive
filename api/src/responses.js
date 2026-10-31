export const sendData = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ data });

export const sendError = (
  res,
  statusCode,
  code,
  message,
  fields = undefined,
) =>
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
    },
  });
