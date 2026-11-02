import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";
import { runtimeDatabaseUrl } from "./database-url.js";

const adapter = new PrismaPg({ connectionString: runtimeDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

export default prisma;
