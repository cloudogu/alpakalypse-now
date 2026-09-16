import type { AppDatabase } from "./create.ts";
import { migrateDatabase } from "./migrate.ts";
import { seedDatabase } from "./seed.ts";

interface PrepareDatabaseOptions {
  migrationsFolder?: string;
  skipSeed?: boolean;
}

export async function prepareDatabase(
  database: AppDatabase,
  { migrationsFolder, skipSeed = false }: PrepareDatabaseOptions = {},
) {
  migrateDatabase(database, migrationsFolder);

  if (!skipSeed) {
    await seedDatabase(database);
  }
}

export function shouldSkipDatabaseSeed(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() ?? "");
}
