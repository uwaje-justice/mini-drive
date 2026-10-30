import express from "express";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import env from "./lib/env.js";
import cors from "cors";
import sessionMiddleware from "./config/session.js";
import passport from "./config/passport.js";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user ?? null;
  next();
});

app.use(indexRouter);
app.use("/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

const port = env("PORT", 3000);

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server is running on port ${port}.`);
});
