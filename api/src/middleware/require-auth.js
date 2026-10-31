import UnauthorizedError from "../errors/unauthorized-error.js";

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return next(new UnauthorizedError("Sign in to continue."));
};

export default requireAuth;
