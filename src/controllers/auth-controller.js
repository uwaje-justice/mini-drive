import passport from "../config/passport.js";
import authService from "../services/auth-service.js";
import ConflictError from "../errors/conflict-error.js";

const driveHome = "/folders";

const showRegister = (req, res) => {
  if (req.user) return res.redirect(driveHome);

  return res.render("auth/register", { errors: {}, values: {} });
};

const register = async (req, res, next) => {
  const { email, password } = req.matchedData;

  try {
    const user = await authService.registerUser({ email, password });

    return req.login(user, (error) => {
      if (error) return next(error);
      return res.redirect(driveHome);
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return res.status(409).render("auth/register", {
        errors: { email: error.message },
        values: { email },
      });
    }

    return next(error);
  }
};

const showLogin = (req, res) => {
  if (req.user) return res.redirect(driveHome);

  return res.render("auth/login", { errors: {}, values: {} });
};

const login = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);

    if (!user) {
      return res.status(401).render("auth/login", {
        errors: { form: info.message },
        values: { email: req.matchedData.email },
      });
    }

    return req.login(user, (loginError) => {
      if (loginError) return next(loginError);
      return res.redirect(driveHome);
    });
  })(req, res, next);
};

const logout = (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    return req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);

      res.clearCookie("connect.sid");
      return res.redirect("/auth/login");
    });
  });
};

export default { showRegister, register, showLogin, login, logout };
