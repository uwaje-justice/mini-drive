import express from "express";
import sessionMiddleware from "./config/session.js";
import passport from "./config/passport.js";
import apiRouter from "./api/routes/index.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";
import { csrfProtection } from "./middleware/csrf.js";

const app = express();

app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
