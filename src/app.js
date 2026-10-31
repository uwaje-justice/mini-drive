import express from "express";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import formatBytes from "./lib/format-bytes.js";
import isPreviewable from "./lib/preview.js";
import cors from "cors";
import sessionMiddleware from "./config/session.js";
import passport from "./config/passport.js";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import foldersRouter from "./routes/folders.js";
import filesRouter from "./routes/files.js";
import shareRouter from "./routes/share.js";
import searchRouter from "./routes/search.js";
import apiRouter from "./api/routes/index.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";
import { csrfProtection, attachCsrfToken } from "./middleware/csrf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(
  "/fonts/roboto",
  express.static(
    join(__dirname, "..", "node_modules", "@fontsource-variable", "roboto"),
    { maxAge: "30d" },
  ),
);
app.use(express.static(join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);
app.use(attachCsrfToken);

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.locals.currentUser = req.user ?? null;
  res.locals.currentPath = req.path;
  res.locals.formatBytes = formatBytes;
  res.locals.isPreviewable = isPreviewable;
  res.locals.query = req.query;
  next();
});

app.use(indexRouter);
app.use("/auth", authRouter);
app.use("/folders", foldersRouter);
app.use("/files", filesRouter);
app.use("/share", shareRouter);
app.use("/search", searchRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
