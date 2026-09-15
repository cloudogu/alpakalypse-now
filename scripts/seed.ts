import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { accounts, alpacas, bookings, users } from "../src/db/schema.ts";

const now = new Date();
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

await db
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
  await db
    .update(alpacas)
    .set({ imageUrl: `/alpacas/${id}.webp` })
    .where(eq(alpacas.id, id));
}

const password = await hashPassword("Flausch123!");
for (const person of [
  { id: "admin-demo", name: "Ada Admin", email: "admin@alpakalypse.demo", role: "admin" as const },
  {
    id: "customer-demo",
    name: "Karla Kunde",
    email: "kunde@alpakalypse.demo",
    role: "customer" as const,
  },
]) {
  await db
    .insert(users)
    .values({ ...person, emailVerified: true, createdAt: now, updatedAt: now })
    .onConflictDoNothing();
  await db.update(users).set({ role: person.role }).where(eq(users.id, person.id));
  await db
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
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
await db
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

console.log("Demo-Daten angelegt.");
console.log("Admin: admin@alpakalypse.demo / Flausch123!");
console.log("Kunde: kunde@alpakalypse.demo / Flausch123!");
