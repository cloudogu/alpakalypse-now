import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "#/db";
import * as schema from "#/db/schema";

export const auth = betterAuth({
  appName: "Alpakalypse Now",
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    modelName: "users",
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: false },
    },
  },
  session: { modelName: "sessions" },
  account: { modelName: "accounts" },
  verification: { modelName: "verifications" },
  rateLimit: { enabled: true, window: 60, max: 20 },
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  plugins: [tanstackStartCookies()],
});
