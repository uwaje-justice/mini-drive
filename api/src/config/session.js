import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";

import env from "../lib/env.js";
import prisma from "../lib/prisma.js";

const weekInMs = 7 * 24 * 60 * 60 * 1000;

export const sessionCookieName = "connect.sid";

const sessionMiddleware = session({
  name: sessionCookieName,
  secret: env("SESSION_SECRET"),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env("NODE_ENV", "development") === "production",
    maxAge: weekInMs,
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }),
});

export default sessionMiddleware;
