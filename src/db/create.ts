import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema.ts";

export function createDatabase(target: string) {
  return drizzle(target, { schema });
}

export type AppDatabase = ReturnType<typeof createDatabase>;
