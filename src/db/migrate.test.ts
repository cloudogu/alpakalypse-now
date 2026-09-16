import { afterEach, describe, expect, it } from "vite-plus/test";

import { alpacas } from "./schema";
import { createDatabase, type AppDatabase } from "./create";
import { migrateDatabase } from "./migrate";

describe("database migrations", () => {
  let database: AppDatabase | undefined;

  afterEach(() => database?.$client.close());

  it("prepares a new database and can be run repeatedly", async () => {
    database = createDatabase(":memory:");

    migrateDatabase(database);
    migrateDatabase(database);

    await expect(database.select().from(alpacas)).resolves.toEqual([]);
  });
});
