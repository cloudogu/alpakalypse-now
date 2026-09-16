import { expect, test, type Page } from "@playwright/test";

import { inDays, resetE2eDatabase } from "../support/e2e-database";

test.beforeEach(async ({ context }) => {
  await resetE2eDatabase();
  await context.clearCookies();
});

test("a visitor explores the catalog and an alpaca profile", async ({ page }) => {
  await page.goto("/alpacas");
  await waitForHydration(page);

  await page.getByRole("button", { name: "Karamell" }).click();
  await expect(page.getByRole("heading", { name: "Kevin" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Brigitte" })).toBeHidden();
  await page.getByRole("link", { name: "Steckbrief ansehen" }).click();

  await expect(page.getByRole("heading", { name: "Hallo, ich bin Kevin." })).toBeVisible();
});

test("a customer logs in, books an alpaca, and cancels the booking", async ({ page }) => {
  await page.goto("/alpacas/kevin");
  await page.getByRole("link", { name: "Jetzt Kevin buchen" }).click();
  await expect(page.getByRole("heading", { name: "Einlass zur Koppel" })).toBeVisible();
  await login(page, "kunde@alpakalypse.demo");
  await expect(page).toHaveURL(/\/booking\/kevin$/);
  await waitForHydration(page);

  await page.getByLabel("Startdatum").fill(inDays(20));
  await page.getByLabel("Enddatum").fill(inDays(23));
  await expect(page.getByText(/267,00/)).toBeVisible();
  await page.getByRole("button", { name: "Verbindlich buchen" }).click();

  await expect(page.getByRole("heading", { name: "Der Flausch ist reserviert." })).toBeVisible();
  await page.getByRole("link", { name: "Zum Profil" }).click();
  await page.getByRole("button", { name: "Stornieren" }).first().click();
  await expect(page.getByText("Storniert").first()).toBeVisible();
});

test("an overlapping booking shows the business error", async ({ page }) => {
  await page.goto("/login?redirect=%2Fbooking%2Fkevin");
  await login(page, "kunde@alpakalypse.demo");
  await expect(page).toHaveURL(/\/booking\/kevin$/);
  await waitForHydration(page);
  await page.getByLabel("Startdatum").fill(inDays(9));
  await page.getByLabel("Enddatum").fill(inDays(10));
  await page.getByRole("button", { name: "Verbindlich buchen" }).click();

  await expect(page.getByRole("alert")).toHaveText("Dieser Zeitraum ist bereits gebucht.");
});

test("a customer cannot open administration", async ({ page }) => {
  await page.goto("/login?redirect=%2Fadmin");
  await login(page, "kunde@alpakalypse.demo");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /Wenn's flauschig/ })).toBeVisible();
});

test("an admin creates an alpaca and cancels a booking", async ({ page }) => {
  await page.goto("/login?redirect=%2Fadmin");
  await login(page, "admin@alpakalypse.demo");
  await expect(page.getByText("Aktive Buchungen")).toBeVisible();
  await waitForHydration(page);

  const adminNavigation = page.getByRole("complementary");
  await adminNavigation.getByRole("link", { name: "Alpakas", exact: true }).click();
  await page.getByRole("link", { name: "Neu anlegen" }).click();
  await page.getByLabel("Name").fill("Rosalie");
  await page.getByLabel("Fellfarbe").fill("Rosébeige");
  await page.getByLabel("Bio").fill("Rosalie ist ein sonniges und sehr entspanntes Test-Alpaka.");
  await page.getByLabel("Tagesmiete in EUR").fill("99");
  await page.getByRole("button", { name: "Alpaka speichern" }).click();
  await expect(page.getByRole("cell", { name: "Rosalie", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Rosalie bearbeiten" }).click();
  await page.getByLabel("Name").fill("Rosalie Neu");
  await page.getByRole("button", { name: "Alpaka speichern" }).click();
  const rosalieRow = page.getByRole("row").filter({ hasText: "Rosalie Neu" });
  await rosalieRow.getByRole("button", { name: "Deaktivieren" }).click();
  await expect(rosalieRow.getByText("Inaktiv")).toBeVisible();

  await adminNavigation.getByRole("link", { name: "Buchungen", exact: true }).click();
  await page.getByRole("button", { name: "Stornieren" }).click();
  await expect(page.getByRole("cell", { name: "Storniert", exact: true })).toBeVisible();
});

test("a visitor registers and logs out", async ({ page }) => {
  await page.goto("/register");
  await waitForHydration(page);
  await page.getByLabel("Name").fill("Rita Registriert");
  await page.getByLabel("E-Mail").fill("rita@example.com");
  await page.getByLabel("Passwort").fill("Flausch123!");
  await page.getByRole("button", { name: "Registrieren" }).click();
  await expect(page.getByRole("heading", { name: "Hallo, Rita Registriert" })).toBeVisible();
  await waitForHydration(page);

  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page.getByRole("link", { name: "Anmelden" })).toBeVisible();
});

async function login(page: Page, email: string) {
  await waitForHydration(page);
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort").fill("Flausch123!");
  await page.getByRole("button", { name: "Anmelden" }).click();
}

async function waitForHydration(page: Page) {
  await page.locator("html[data-hydrated='true']").waitFor();
}
