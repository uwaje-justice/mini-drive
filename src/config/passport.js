import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import authService from "../services/auth-service.js";
import UnauthorizedError from "../errors/unauthorized-error.js";

const invalidCredentials = new UnauthorizedError("Invalid email or password.")
  .message;

passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const { email: safeEmail, password: safePassword } = req.matchedData;
        const user = await authService.findByEmail(safeEmail);

        if (!user) return done(null, false, { message: invalidCredentials });

        const isValid = await authService.verifyPassword(user, safePassword);

        if (!isValid) return done(null, false, { message: invalidCredentials });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.findPublicById(id);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

export default passport;
