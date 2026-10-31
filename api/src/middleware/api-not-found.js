import NotFoundError from "../errors/not-found-error.js";

const notFound = (req, res, next) =>
  next(new NotFoundError("API route not found."));

export default notFound;
