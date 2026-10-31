export const sendData = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ data });
