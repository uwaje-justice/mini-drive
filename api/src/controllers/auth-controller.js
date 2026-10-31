import passport from "../config/passport.js";
import ConflictError from "../errors/conflict-error.js";
import { generateCsrfToken } from "../middleware/csrf.js";
import { sendData, sendError } from "../responses.js";
import { serializeUser } from "../serializers.js";
import authService from "../services/auth-service.js";

const sessionData = (req, user) => ({
  user: user ? serializeUser(user) : null,
  csrfToken: generateCsrfToken(req),
});

const session = (req, res) =>
  sendData(res, sessionData(req, req.user ?? null));

const register = async (req, res, next) => {
  const { email, password } = req.matchedData;

  try {
    const user = await authService.registerUser({ email, password });

    return req.login(user, (error) => {
      if (error) return next(error);

      return sendData(res, sessionData(req, user), 201);
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return sendError(res, 409, error.code, error.message, {
        email: error.message,
      });
    }

    return next(error);
  }
};

const login = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);

    if (!user) {
      return sendError(res, 401, "UNAUTHORIZED", info.message);
    }

    return req.login(user, (loginError) => {
      if (loginError) return next(loginError);

      return sendData(res, sessionData(req, user));
    });
  })(req, res, next);
};

const logout = (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    return req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);

      res.clearCookie("connect.sid");
      return res.status(204).end();
    });
  });
};

export default { session, register, login, logout };
