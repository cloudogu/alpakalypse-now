import { defineConfig, devices } from "@playwright/test";

import { e2eDatabasePath, resetE2eDatabase } from "./tests/support/e2e-database";

const baseURL = "http://localhost:3001";
await resetE2eDatabase();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "vp dev --port 3001",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: e2eDatabasePath,
      BETTER_AUTH_URL: baseURL,
      BETTER_AUTH_SECRET: "alpakalypse-e2e-only-secret-at-least-32-characters",
      BETTER_AUTH_RATE_LIMIT_DISABLED: "true",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
