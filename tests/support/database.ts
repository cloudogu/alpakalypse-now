import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import type { AppDatabase } from "#/db/create";

export function migrateTestDatabase(database: AppDatabase) {
  migrate(database, { migrationsFolder: "drizzle" });
}
