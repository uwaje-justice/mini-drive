const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.redirect("/auth/login");
};

export default requireAuth;
