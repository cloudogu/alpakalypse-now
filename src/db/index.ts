import { config } from "dotenv";

import { createDatabase } from "./create.ts";

export { createDatabase, type AppDatabase } from "./create.ts";

config({ path: [".env.local", ".env"], quiet: true });

export const db = createDatabase(process.env.DATABASE_URL ?? "./alpakalypse.db");
