import env from "./env.js";

const isTest = env("NODE_ENV", "development") === "test";

export const runtimeDatabaseUrl = () =>
  isTest ? env("TEST_DATABASE_URL") : env("DATABASE_URL");

export const migrationDatabaseUrl = () =>
  isTest
    ? env("TEST_DATABASE_URL")
    : process.env.DIRECT_URL || env("DATABASE_URL");
