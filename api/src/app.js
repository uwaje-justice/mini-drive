import express from "express";

import passport from "./config/passport.js";
import sessionMiddleware from "./config/session.js";
import env from "./lib/env.js";
import corsMiddleware from "./middleware/cors.js";
import { csrfProtection } from "./middleware/csrf.js";
import errorHandler from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import apiRouter from "./routes/index-routes.js";

const app = express();

if (env("NODE_ENV", "development") === "production") {
  app.set("trust proxy", 1);
}

app.use(corsMiddleware);
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
