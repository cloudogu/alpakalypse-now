import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import type { AppDatabase } from "./create.ts";
import { accounts, alpacas, bookings, users } from "./schema.ts";

const herd = [
  [
    "kevin",
    "Kevin",
    "Karamell",
    "low",
    8900,
    "Sieht aus wie ein Rockstar, kaut aber lieber in Ruhe. Kevin ist souverän, fotogen und ein Profi für große Auftritte.",
  ],
  [
    "brigitte",
    "Brigitte",
    "Cremeweiß",
    "medium",
    7900,
    "Brigitte beobachtet erst, urteilt kurz und taut dann zuverlässig auf. Perfekt für Gartenfeste mit Niveau.",
  ],
  [
    "horst",
    "Horst",
    "Schokobraun",
    "low",
    9500,
    "Horst ist die Ruhe selbst. Er bringt Gelassenheit, würde sie aber niemals ungefragt als Coaching verkaufen.",
  ],
  [
    "gisela",
    "Gisela",
    "Zimt",
    "high",
    8400,
    "Gisela hat Meinungen und kommuniziert sie gelegentlich mit Nachdruck. Ein Erlebnis für mutige Gesellschaften.",
  ],
  [
    "manfred",
    "Manfred",
    "Schwarz",
    "medium",
    10500,
    "Elegant, mysteriös und stets für ein dramatisches Profilbild zu haben. Manfred kennt seine Schokoladenseite.",
  ],
  [
    "rosalie",
    "Rosalie",
    "Rosébeige",
    "low",
    9900,
    "Rosalie ist der Sonnenschein der Herde. Sie liebt ruhige Menschen, knuspriges Gras und Kameras.",
  ],
  [
    "dieter",
    "Dieter",
    "Grau",
    "medium",
    7600,
    "Dieter wirkt ein wenig zerzaust, hat aber sein Leben erstaunlich gut im Griff. Meistens jedenfalls.",
  ],
  [
    "susi",
    "Susi",
    "Weiß",
    "low",
    9200,
    "Susi ist aufmerksam, freundlich und bei Gruppen das soziale Schmiermittel – ganz ohne peinliche Kennenlernspiele.",
  ],
  [
    "klaus",
    "Klaus",
    "Gescheckt",
    "high",
    8700,
    "Klaus liebt Grenzen. Vor allem testet er gern, ob deine wirklich gelten. Unvergesslich und sehr fotogen.",
  ],
] as const;

export async function seedDatabase(database: AppDatabase, now = new Date()) {
  await database
    .insert(alpacas)
    .values(
      herd.map(([id, name, furColor, spitRisk, dailyRate, bio]) => ({
        id,
        name,
        furColor,
        spitRisk,
        dailyRate,
        bio,
        imageUrl: `/alpacas/${id}.webp`,
        active: true,
        createdAt: now,
      })),
    )
    .onConflictDoNothing();

  for (const [id] of herd) {
    await database
      .update(alpacas)
      .set({ imageUrl: `/alpacas/${id}.webp` })
      .where(eq(alpacas.id, id));
  }

  const password = await hashPassword("Flausch123!");
  for (const person of [
    {
      id: "admin-demo",
      name: "Ada Admin",
      email: "admin@alpakalypse.demo",
      role: "admin" as const,
    },
    {
      id: "customer-demo",
      name: "Karla Kunde",
      email: "kunde@alpakalypse.demo",
      role: "customer" as const,
    },
  ]) {
    await database
      .insert(users)
      .values({ ...person, emailVerified: true, createdAt: now, updatedAt: now })
      .onConflictDoNothing();
    await database.update(users).set({ role: person.role }).where(eq(users.id, person.id));
    await database
      .insert(accounts)
      .values({
        id: `${person.id}-credential`,
        accountId: person.id,
        providerId: "credential",
        userId: person.id,
        password,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }

  const inDays = (days: number) =>
    new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);
  await database
    .insert(bookings)
    .values([
      {
        id: "demo-booking-1",
        userId: "customer-demo",
        alpacaId: "kevin",
        startDate: inDays(8),
        endDate: inDays(11),
        status: "confirmed",
        totalPrice: 26_700,
        createdAt: now,
      },
      {
        id: "demo-booking-2",
        userId: "customer-demo",
        alpacaId: "rosalie",
        startDate: inDays(17),
        endDate: inDays(19),
        status: "confirmed",
        totalPrice: 19_800,
        createdAt: now,
      },
      {
        id: "demo-booking-3",
        userId: "customer-demo",
        alpacaId: "horst",
        startDate: inDays(-20),
        endDate: inDays(-18),
        status: "cancelled",
        totalPrice: 19_000,
        createdAt: now,
      },
    ])
    .onConflictDoNothing();
}
