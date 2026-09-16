import { afterEach, describe, expect, it } from "vite-plus/test";

import { alpacas, bookings, users } from "#/db/schema";
import { createDatabase, type AppDatabase } from "#/db/create";
import { createApplication, type Actor } from "./application";
import { migrateTestDatabase } from "../../tests/support/database";

describe("alpaca catalog", () => {
  let database: AppDatabase | undefined;

  afterEach(() => database?.$client.close());

  it("lists only active alpacas in alphabetical order", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    await database
      .insert(alpacas)
      .values([
        alpaca({ id: "zora", name: "Zora", active: true }),
        alpaca({ id: "berta", name: "Berta", active: false }),
        alpaca({ id: "anna", name: "Anna", active: true }),
      ]);
    const application = createApplication({
      database,
      currentUser: async () => null,
      today: () => "2026-09-16",
      createId: () => "generated-id",
    });

    const result = await application.listActiveAlpacas();

    expect(result.map(({ name }) => name)).toEqual(["Anna", "Zora"]);
  });

  it("shows only confirmed blocked periods for an active alpaca", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await database.insert(users).values(userRow(customer));
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    await database
      .insert(bookings)
      .values([
        bookingRow({ id: "confirmed", status: "confirmed", userId: customer.id }),
        bookingRow({ id: "cancelled", status: "cancelled", userId: customer.id }),
      ]);
    const application = createApplication({
      database,
      currentUser: async () => null,
      today: () => "2026-09-16",
      createId: () => "generated-id",
    });

    const result = await application.getAlpaca("kevin");

    expect(result.blocked.map(({ id }) => id)).toEqual(["confirmed"]);
  });

  it("does not expose an inactive alpaca", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    await database.insert(alpacas).values(alpaca({ id: "berta", name: "Berta", active: false }));

    await expect(testApplication(database, null).getAlpaca("berta")).rejects.toThrow("NOT_FOUND");
  });
});

describe("booking", () => {
  let database: AppDatabase | undefined;

  afterEach(() => database?.$client.close());

  it("creates a confirmed booking that its customer can retrieve", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await database.insert(users).values(userRow(customer));
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    const application = createApplication({
      database,
      currentUser: async () => customer,
      today: () => "2026-09-16",
      createId: () => "booking-1",
    });

    const created = await application.createBooking({
      alpacaId: "kevin",
      startDate: "2026-09-20",
      endDate: "2026-09-23",
    });
    const confirmation = await application.getBookingConfirmation(created.id);

    expect(confirmation).toMatchObject({
      id: "booking-1",
      alpacaName: "Kevin",
      startDate: "2026-09-20",
      endDate: "2026-09-23",
      status: "confirmed",
      totalPrice: 26_700,
    });
  });

  it.each([
    ["2026-09-16", "2026-09-18", "Der Starttermin muss in der Zukunft liegen."],
    ["2026-09-20", "2026-09-20", "Das Enddatum muss nach dem Startdatum liegen."],
  ])("rejects the invalid period %s to %s", async (startDate, endDate, message) => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await seedBookingContext(database, customer);
    const application = testApplication(database, customer);

    await expect(
      application.createBooking({ alpacaId: "kevin", startDate, endDate }),
    ).rejects.toThrow(message);
  });

  it("rejects a period that overlaps a confirmed booking", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await seedBookingContext(database, customer);
    await database
      .insert(bookings)
      .values(bookingRow({ id: "existing", status: "confirmed", userId: customer.id }));
    const application = testApplication(database, customer);

    await expect(
      application.createBooking({
        alpacaId: "kevin",
        startDate: "2026-09-22",
        endDate: "2026-09-24",
      }),
    ).rejects.toThrow("Dieser Zeitraum ist bereits gebucht.");
  });

  it("allows a period adjacent to a confirmed booking", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await seedBookingContext(database, customer);
    await database
      .insert(bookings)
      .values(bookingRow({ id: "existing", status: "confirmed", userId: customer.id }));
    const application = testApplication(database, customer);

    await expect(
      application.createBooking({
        alpacaId: "kevin",
        startDate: "2026-09-23",
        endDate: "2026-09-24",
      }),
    ).resolves.toEqual({ id: "generated-id" });
  });

  it("allows a period that only overlaps a cancelled booking", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await seedBookingContext(database, customer);
    await database
      .insert(bookings)
      .values(bookingRow({ id: "cancelled", status: "cancelled", userId: customer.id }));

    await expect(
      testApplication(database, customer).createBooking({
        alpacaId: "kevin",
        startDate: "2026-09-21",
        endDate: "2026-09-22",
      }),
    ).resolves.toEqual({ id: "generated-id" });
  });

  it("rejects anonymous bookings", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const application = testApplication(database, null);

    await expect(
      application.createBooking({
        alpacaId: "kevin",
        startDate: "2026-09-20",
        endDate: "2026-09-23",
      }),
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("hides another customer's confirmation but allows an admin to retrieve it", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const owner = actor({ id: "customer-1", role: "customer" });
    const other = actor({ id: "customer-2", role: "customer" });
    const admin = actor({ id: "admin-1", role: "admin" });
    await database.insert(users).values([userRow(owner), userRow(other), userRow(admin)]);
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    await database
      .insert(bookings)
      .values(bookingRow({ id: "private", status: "confirmed", userId: owner.id }));

    await expect(
      testApplication(database, other).getBookingConfirmation("private"),
    ).rejects.toThrow("NOT_FOUND");
    await expect(
      testApplication(database, admin).getBookingConfirmation("private"),
    ).resolves.toMatchObject({ id: "private" });
  });
});

describe("customer profile", () => {
  let database: AppDatabase | undefined;

  afterEach(() => database?.$client.close());

  it("shows only the customer's bookings and lets them cancel a future booking", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    const other = actor({ id: "customer-2", role: "customer" });
    await database.insert(users).values([userRow(customer), userRow(other)]);
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    await database.insert(bookings).values([
      bookingRow({ id: "own", status: "confirmed", userId: customer.id }),
      {
        ...bookingRow({ id: "own-later", status: "confirmed", userId: customer.id }),
        startDate: "2026-09-25",
        endDate: "2026-09-27",
      },
      bookingRow({ id: "other", status: "confirmed", userId: other.id }),
    ]);
    const application = testApplication(database, customer);

    await application.cancelOwnBooking("own");
    const profile = await application.getProfile();

    expect(profile.bookings).toMatchObject([
      { id: "own-later", status: "confirmed" },
      { id: "own", status: "cancelled" },
    ]);
  });

  it("does not let a customer cancel somebody else's booking", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    const other = actor({ id: "customer-2", role: "customer" });
    await database.insert(users).values([userRow(customer), userRow(other)]);
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    await database
      .insert(bookings)
      .values(bookingRow({ id: "other", status: "confirmed", userId: other.id }));
    const application = testApplication(database, customer);

    await expect(application.cancelOwnBooking("other")).rejects.toThrow(
      "Diese Buchung kann nicht mehr storniert werden.",
    );
  });

  it("does not let a customer cancel a past booking", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await seedBookingContext(database, customer);
    await database.insert(bookings).values({
      ...bookingRow({ id: "past", status: "confirmed", userId: customer.id }),
      startDate: "2026-09-01",
      endDate: "2026-09-03",
    });

    await expect(testApplication(database, customer).cancelOwnBooking("past")).rejects.toThrow(
      "Diese Buchung kann nicht mehr storniert werden.",
    );
  });
});

describe("administration", () => {
  let database: AppDatabase | undefined;

  afterEach(() => database?.$client.close());

  it("reports herd and active-booking totals to an admin", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const admin = actor({ id: "admin-1", role: "admin" });
    const customer = actor({ id: "customer-1", role: "customer" });
    await database.insert(users).values([userRow(admin), userRow(customer)]);
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    await database
      .insert(bookings)
      .values(bookingRow({ id: "confirmed", status: "confirmed", userId: customer.id }));
    const application = testApplication(database, admin);

    await expect(application.getAdminDashboard()).resolves.toEqual({
      alpacas: 1,
      activeBookings: 1,
    });
  });

  it("creates and deactivates an alpaca", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const admin = actor({ id: "admin-1", role: "admin" });
    await database.insert(users).values(userRow(admin));
    const application = testApplication(database, admin);

    const created = await application.saveAlpaca({
      name: "Rosalie",
      bio: "Rosalie ist ein sonniges und sehr entspanntes Test-Alpaka.",
      furColor: "Rosébeige",
      spitRisk: "low",
      dailyRate: 9_900,
      imageUrl: "",
      active: true,
    });
    await application.setAlpacaActive(created.id, false);
    const saved = await application.getAdminAlpaca(created.id);

    expect(saved).toMatchObject({ id: "generated-id", name: "Rosalie", active: false });
  });

  it("lists bookings with customer details and cancels one", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const admin = actor({ id: "admin-1", role: "admin" });
    const customer = actor({ id: "customer-1", role: "customer" });
    await database.insert(users).values([userRow(admin), userRow(customer)]);
    await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
    await database
      .insert(bookings)
      .values(bookingRow({ id: "confirmed", status: "confirmed", userId: customer.id }));
    const application = testApplication(database, admin);

    await application.adminCancelBooking("confirmed");
    const result = await application.listAdminBookings();

    expect(result).toMatchObject([
      {
        id: "confirmed",
        customerName: customer.name,
        customerEmail: customer.email,
        alpacaName: "Kevin",
        status: "cancelled",
      },
    ]);
  });

  it("rejects customer access to administration", async () => {
    database = createDatabase(":memory:");
    migrateTestDatabase(database);
    const customer = actor({ id: "customer-1", role: "customer" });
    await database.insert(users).values(userRow(customer));
    const application = testApplication(database, customer);

    await expect(application.getAdminDashboard()).rejects.toThrow("FORBIDDEN");
  });
});

function alpaca({ id, name, active }: { id: string; name: string; active: boolean }) {
  return {
    id,
    name,
    active,
    bio: `${name} ist ein besonders entspanntes Test-Alpaka.`,
    furColor: "Karamell",
    spitRisk: "low" as const,
    dailyRate: 8_900,
  };
}

function actor({ id, role }: { id: string; role: Actor["role"] }): Actor {
  return { id, role, name: `User ${id}`, email: `${id}@example.com` };
}

function userRow(user: Actor) {
  return {
    ...user,
    emailVerified: true,
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
  };
}

function bookingRow({
  id,
  status,
  userId,
}: {
  id: string;
  status: "confirmed" | "cancelled";
  userId: string;
}) {
  return {
    id,
    userId,
    alpacaId: "kevin",
    startDate: "2026-09-20",
    endDate: "2026-09-23",
    status,
    totalPrice: 26_700,
  };
}

async function seedBookingContext(database: AppDatabase, customer: Actor) {
  await database.insert(users).values(userRow(customer));
  await database.insert(alpacas).values(alpaca({ id: "kevin", name: "Kevin", active: true }));
}

function testApplication(database: AppDatabase, currentActor: Actor | null) {
  return createApplication({
    database,
    currentUser: async () => currentActor,
    today: () => "2026-09-16",
    createId: () => "generated-id",
  });
}
