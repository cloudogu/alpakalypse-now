import { definePlugin } from "nitro";

import { demoDataLoaded } from "../db";
import { DEMO_PASSWORD, DEMO_USERS } from "../db/seed";
import { ALPAKALYPSE_BANNER, getRandomAlpacaFunFact } from "../lib/startup-message";

export default definePlugin(() => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  console.log(ALPAKALYPSE_BANNER);
  console.log();
  console.log("Alpaka-Fun-Fakt:", getRandomAlpacaFunFact());

  if (demoDataLoaded) {
    console.log();
    console.log("Demo-Zugänge:");
    console.log("-------------");
    for (const user of DEMO_USERS) {
      console.log(`${user.name}: ${user.email} / ${DEMO_PASSWORD}`);
    }
    console.log();
  }
});
