import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "#/db";
import * as schema from "#/db/schema";

export const auth = betterAuth({
  appName: "Alpakalypse Now",
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  advanced: {
    ipAddress: {
      // IP tracking is disabled to suppress the missing client IP warning; this is acceptable for a demo app.
      disableIpTracking: true,
    },
  },
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
  rateLimit: {
    enabled: process.env.BETTER_AUTH_RATE_LIMIT_DISABLED !== "true",
    window: 60,
    max: 20,
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  plugins: [tanstackStartCookies()],
});
