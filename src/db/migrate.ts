import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import type { AppDatabase } from "./create.ts";

export function migrateDatabase(database: AppDatabase, migrationsFolder = "drizzle") {
  migrate(database, { migrationsFolder });
}
