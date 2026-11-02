import cors from "cors";

import env from "../lib/env.js";

const isProduction = env("NODE_ENV", "development") === "production";
const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

if (isProduction && allowedOrigins.size === 0) {
  throw new Error("CLIENT_ORIGINS is required in production.");
}

const corsMiddleware = cors({
  origin: (origin, callback) =>
    callback(null, !origin || allowedOrigins.has(origin)),
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-csrf-token"],
  maxAge: 86400,
});

export default corsMiddleware;
