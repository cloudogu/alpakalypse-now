import { afterEach, describe, expect, it } from "vite-plus/test";

import { createDatabase, type AppDatabase } from "./create";
import { prepareDatabase, shouldSkipDatabaseSeed } from "./prepare";
import { alpacas, bookings, users } from "./schema";

describe("database preparation", () => {
  let database: AppDatabase | undefined;

  afterEach(() => database?.$client.close());

  it("migrates and seeds a new database idempotently", async () => {
    database = createDatabase(":memory:");

    await prepareDatabase(database);
    await prepareDatabase(database);

    await expect(database.select().from(alpacas)).resolves.toHaveLength(9);
    await expect(database.select().from(users)).resolves.toHaveLength(2);
    await expect(database.select().from(bookings)).resolves.toHaveLength(3);
  });

  it("can skip demo data without skipping migrations", async () => {
    database = createDatabase(":memory:");

    await prepareDatabase(database, { skipSeed: true });

    await expect(database.select().from(alpacas)).resolves.toEqual([]);
  });
});

describe("SKIP_DATABASE_SEED", () => {
  it.each(["1", "true", "TRUE", "yes", "on"])("treats %s as enabled", (value) => {
    expect(shouldSkipDatabaseSeed(value)).toBe(true);
  });

  it.each([undefined, "", "0", "false", "no", "off"])("does not skip for %s", (value) => {
    expect(shouldSkipDatabaseSeed(value)).toBe(false);
  });
});
