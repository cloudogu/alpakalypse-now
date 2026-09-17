import { config } from "dotenv";

import { createDatabase } from "./create.ts";
import { prepareDatabase, shouldSkipDatabaseSeed } from "./prepare.ts";

export { createDatabase, type AppDatabase } from "./create.ts";
export { migrateDatabase } from "./migrate.ts";
export { prepareDatabase, shouldSkipDatabaseSeed } from "./prepare.ts";
export { seedDatabase } from "./seed.ts";

config({ path: [".env.local", ".env"], quiet: true });

export const db = createDatabase(process.env.DATABASE_URL ?? "./alpakalypse.db");
const skipSeed = shouldSkipDatabaseSeed(process.env.SKIP_DATABASE_SEED);

await prepareDatabase(db, {
  skipSeed,
});

export const demoDataLoaded = !skipSeed;
