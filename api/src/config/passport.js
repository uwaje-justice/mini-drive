import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import authService from "../services/auth-service.js";

const invalidCredentials = "Invalid email or password.";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await authService.findByEmail(email);

        if (!user) return done(null, false, { message: invalidCredentials });

        const isValid = await authService.verifyPassword(user, password);

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
