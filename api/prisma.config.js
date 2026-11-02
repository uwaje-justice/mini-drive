import { defineConfig } from "prisma/config";

import { migrationDatabaseUrl } from "./src/lib/database-url.js";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: migrationDatabaseUrl() },
});
