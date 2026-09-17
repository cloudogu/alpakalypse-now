import { db } from "../src/db/index.ts";
import { DEMO_PASSWORD, DEMO_USERS, seedDatabase } from "../src/db/seed.ts";

await seedDatabase(db);

console.log("Demo-Daten angelegt.");
for (const user of DEMO_USERS) {
  console.log(`${user.name}: ${user.email} / ${DEMO_PASSWORD}`);
}
