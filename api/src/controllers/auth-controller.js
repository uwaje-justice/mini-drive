import passport from "../config/passport.js";
import { sessionCookieName } from "../config/session.js";
import ConflictError from "../errors/conflict-error.js";
import UnauthorizedError from "../errors/unauthorized-error.js";
import { generateCsrfToken } from "../middleware/csrf.js";
import { sendData } from "../responses.js";
import { serializeUser } from "../serializers.js";
import authService from "../services/auth-service.js";

const sessionData = (req, user) => ({
  user: user ? serializeUser(user) : null,
  csrfToken: generateCsrfToken(req),
});

const session = (req, res) =>
  sendData(res, sessionData(req, req.user ?? null));

const register = async (req, res, next) => {
  const { email, password } = req.validated;

  try {
    const user = await authService.registerUser({ email, password });

    return req.login(user, (error) => {
      if (error) return next(error);

      return sendData(res, sessionData(req, user), 201);
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return next(
        new ConflictError(error.message, { email: error.message }),
      );
    }

    return next(error);
  }
};

const login = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);

    if (!user) {
      return next(
        new UnauthorizedError(info?.message ?? "Invalid email or password."),
      );
    }

    return req.login(user, (loginError) => {
      if (loginError) return next(loginError);

      return sendData(res, sessionData(req, user));
    });
  })(req, res, next);
};

const email = async (req, res, next) => {
  try {
    const user = await authService.updateEmail(req.user.id, req.validated);

    return sendData(res, sessionData(req, user));
  } catch (error) {
    if (error instanceof ConflictError) {
      return next(new ConflictError(error.message, { email: error.message }));
    }

    return next(error);
  }
};

const password = async (req, res, next) => {
  try {
    const user = await authService.updatePassword(req.user.id, {
      ...req.validated,
      currentSessionId: req.sessionID,
    });

    return sendData(res, sessionData(req, user));
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    return req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);

      res.clearCookie(sessionCookieName);
      return res.status(204).end();
    });
  });
};

export default { session, register, login, logout, email, password };
