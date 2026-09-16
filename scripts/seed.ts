import { db } from "../src/db/index.ts";
import { seedDatabase } from "../src/db/seed.ts";

await seedDatabase(db);

console.log("Demo-Daten angelegt.");
console.log("Admin: admin@alpakalypse.demo / Flausch123!");
console.log("Kunde: kunde@alpakalypse.demo / Flausch123!");
