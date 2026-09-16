import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { hashPassword } from "better-auth/crypto";

import { createDatabase } from "#/db/create";
import { accounts, alpacas, bookings, sessions, users, verifications } from "#/db/schema";
import { migrateTestDatabase } from "./database";

export const e2eDatabasePath = resolve(".test-data/e2e.db");
mkdirSync(dirname(e2eDatabasePath), { recursive: true });

export async function resetE2eDatabase() {
  const database = createDatabase(e2eDatabasePath);
  migrateTestDatabase(database);

  await database.delete(verifications);
  await database.delete(sessions);
  await database.delete(accounts);
  await database.delete(bookings);
  await database.delete(users);
  await database.delete(alpacas);

  const now = new Date();
  const password = await hashPassword("Flausch123!");
  await database.insert(users).values([
    {
      id: "admin-demo",
      name: "Ada Admin",
      email: "admin@alpakalypse.demo",
      emailVerified: true,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "customer-demo",
      name: "Karla Kunde",
      email: "kunde@alpakalypse.demo",
      emailVerified: true,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await database
    .insert(accounts)
    .values([account("admin-demo", password, now), account("customer-demo", password, now)]);
  await database.insert(alpacas).values([
    {
      id: "kevin",
      name: "Kevin",
      bio: "Kevin ist souverän, fotogen und ein Profi für große Auftritte.",
      furColor: "Karamell",
      spitRisk: "low",
      dailyRate: 8_900,
      active: true,
    },
    {
      id: "brigitte",
      name: "Brigitte",
      bio: "Brigitte beobachtet erst und taut dann zuverlässig auf.",
      furColor: "Cremeweiß",
      spitRisk: "medium",
      dailyRate: 7_900,
      active: true,
    },
  ]);
  await database.insert(bookings).values({
    id: "existing-booking",
    userId: "customer-demo",
    alpacaId: "kevin",
    startDate: inDays(8),
    endDate: inDays(11),
    status: "confirmed",
    totalPrice: 26_700,
    createdAt: now,
  });

  database.$client.close();
}

function account(userId: string, password: string, now: Date) {
  return {
    id: `${userId}-credential`,
    accountId: userId,
    providerId: "credential",
    userId,
    password,
    createdAt: now,
    updatedAt: now,
  };
}

export function inDays(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
