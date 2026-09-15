import { drizzle } from "drizzle-orm/better-sqlite3";
import { config } from "dotenv";

import * as schema from "./schema.ts";

config({ path: [".env.local", ".env"], quiet: true });

export const db = drizzle(process.env.DATABASE_URL ?? "./alpakalypse.db", { schema });
