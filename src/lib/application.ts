import { and, asc, count, desc, eq, gt, lt } from "drizzle-orm";

import type { AppDatabase } from "#/db/create";
import { alpacas, bookings, users } from "#/db/schema";
import { rentalDays } from "#/lib/format";

export type Actor = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

type ApplicationDependencies = {
  database: AppDatabase;
  currentUser: () => Promise<Actor | null>;
  today: () => string;
  createId: () => string;
};

export type AlpacaInput = {
  id?: string;
  name: string;
  bio: string;
  furColor: string;
  spitRisk: "low" | "medium" | "high";
  dailyRate: number;
  imageUrl: string;
  active: boolean;
};

export function createApplication({
  database,
  currentUser,
  today,
  createId,
}: ApplicationDependencies) {
  async function requireUser() {
    const user = await currentUser();
    if (!user) throw new Error("UNAUTHORIZED");
    return user;
  }

  async function requireAdmin() {
    const user = await requireUser();
    if (user.role !== "admin") throw new Error("FORBIDDEN");
    return user;
  }

  return {
    listActiveAlpacas: () =>
      database.select().from(alpacas).where(eq(alpacas.active, true)).orderBy(asc(alpacas.name)),
    async getAlpaca(id: string) {
      const alpaca = await database.query.alpacas.findFirst({
        where: and(eq(alpacas.id, id), eq(alpacas.active, true)),
      });
      if (!alpaca) throw new Error("NOT_FOUND");
      const blocked = await database
        .select({ id: bookings.id, startDate: bookings.startDate, endDate: bookings.endDate })
        .from(bookings)
        .where(and(eq(bookings.alpacaId, id), eq(bookings.status, "confirmed")))
        .orderBy(asc(bookings.startDate));
      return { alpaca, blocked };
    },
    async createBooking(data: { alpacaId: string; startDate: string; endDate: string }) {
      const user = await requireUser();
      if (data.startDate <= today()) throw new Error("Der Starttermin muss in der Zukunft liegen.");
      if (data.endDate <= data.startDate)
        throw new Error("Das Enddatum muss nach dem Startdatum liegen.");
      const alpaca = await database.query.alpacas.findFirst({
        where: and(eq(alpacas.id, data.alpacaId), eq(alpacas.active, true)),
      });
      if (!alpaca) throw new Error("Dieses Alpaka ist nicht verfügbar.");
      const overlap = await database.query.bookings.findFirst({
        where: and(
          eq(bookings.alpacaId, data.alpacaId),
          eq(bookings.status, "confirmed"),
          lt(bookings.startDate, data.endDate),
          gt(bookings.endDate, data.startDate),
        ),
      });
      if (overlap) throw new Error("Dieser Zeitraum ist bereits gebucht.");
      const id = createId();
      await database.insert(bookings).values({
        id,
        userId: user.id,
        alpacaId: alpaca.id,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "confirmed",
        totalPrice: alpaca.dailyRate * rentalDays(data.startDate, data.endDate),
      });
      return { id };
    },
    async getBookingConfirmation(id: string) {
      const user = await requireUser();
      const [booking] = await database
        .select({
          id: bookings.id,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          alpacaName: alpacas.name,
          userId: bookings.userId,
        })
        .from(bookings)
        .innerJoin(alpacas, eq(bookings.alpacaId, alpacas.id))
        .where(eq(bookings.id, id))
        .limit(1);
      if (!booking || (booking.userId !== user.id && user.role !== "admin"))
        throw new Error("NOT_FOUND");
      return booking;
    },
    async getProfile() {
      const user = await requireUser();
      const ownBookings = await database
        .select({
          id: bookings.id,
          alpacaName: alpacas.name,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          status: bookings.status,
          totalPrice: bookings.totalPrice,
        })
        .from(bookings)
        .innerJoin(alpacas, eq(bookings.alpacaId, alpacas.id))
        .where(eq(bookings.userId, user.id))
        .orderBy(desc(bookings.startDate));
      return { user, bookings: ownBookings };
    },
    async cancelOwnBooking(id: string) {
      const user = await requireUser();
      const booking = await database.query.bookings.findFirst({
        where: and(eq(bookings.id, id), eq(bookings.userId, user.id)),
      });
      if (!booking || booking.startDate <= today())
        throw new Error("Diese Buchung kann nicht mehr storniert werden.");
      await database
        .update(bookings)
        .set({ status: "cancelled" })
        .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)));
      return { ok: true };
    },
    async getAdminDashboard() {
      await requireAdmin();
      const [[alpacaCount], [activeBookingCount]] = await Promise.all([
        database.select({ value: count() }).from(alpacas),
        database.select({ value: count() }).from(bookings).where(eq(bookings.status, "confirmed")),
      ]);
      return { alpacas: alpacaCount.value, activeBookings: activeBookingCount.value };
    },
    async listAdminAlpacas() {
      await requireAdmin();
      return database.select().from(alpacas).orderBy(asc(alpacas.name));
    },
    async saveAlpaca(data: AlpacaInput) {
      await requireAdmin();
      const values = {
        name: data.name,
        bio: data.bio,
        furColor: data.furColor,
        spitRisk: data.spitRisk,
        dailyRate: data.dailyRate,
        imageUrl: data.imageUrl || null,
        active: data.active,
      };
      const id = data.id ?? createId();
      if (data.id) await database.update(alpacas).set(values).where(eq(alpacas.id, data.id));
      else await database.insert(alpacas).values({ id, ...values });
      return { id };
    },
    async setAlpacaActive(id: string, active: boolean) {
      await requireAdmin();
      await database.update(alpacas).set({ active }).where(eq(alpacas.id, id));
      return { ok: true };
    },
    async getAdminAlpaca(id: string) {
      await requireAdmin();
      const alpaca = await database.query.alpacas.findFirst({ where: eq(alpacas.id, id) });
      if (!alpaca) throw new Error("NOT_FOUND");
      return alpaca;
    },
    async listAdminBookings() {
      await requireAdmin();
      return database
        .select({
          id: bookings.id,
          customerName: users.name,
          customerEmail: users.email,
          alpacaName: alpacas.name,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.userId, users.id))
        .innerJoin(alpacas, eq(bookings.alpacaId, alpacas.id))
        .orderBy(desc(bookings.createdAt));
    },
    async adminCancelBooking(id: string) {
      await requireAdmin();
      await database.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, id));
      return { ok: true };
    },
  };
}
