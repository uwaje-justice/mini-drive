import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";

import env from "../lib/env.js";
import prisma from "../lib/prisma.js";

const weekInMs = 7 * 24 * 60 * 60 * 1000;

export const sessionCookieName = "connect.sid";

export const getSessionCookieOptions = (isProduction) => ({
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: weekInMs,
});

const sessionMiddleware = session({
  name: sessionCookieName,
  secret: env("SESSION_SECRET"),
  resave: false,
  saveUninitialized: false,
  cookie: getSessionCookieOptions(
    env("NODE_ENV", "development") === "production",
  ),
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }),
});

export default sessionMiddleware;
