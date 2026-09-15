import { and, asc, count, desc, eq, gt, lt } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { db } from "#/db";
import { alpacas, bookings, users } from "#/db/schema";
import { auth } from "#/lib/auth";
import { rentalDays, todayIso } from "#/lib/format";

async function currentUser() {
  const session = await auth.api.getSession({ headers: getRequest().headers });
  return session?.user ?? null;
}
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

export const getCurrentUser = createServerFn({ method: "GET" }).handler(currentUser);
export const listActiveAlpacas = createServerFn({ method: "GET" }).handler(async () =>
  db.select().from(alpacas).where(eq(alpacas.active, true)).orderBy(asc(alpacas.name)),
);

export const getAlpaca = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const alpaca = await db.query.alpacas.findFirst({
      where: and(eq(alpacas.id, data.id), eq(alpacas.active, true)),
    });
    if (!alpaca) throw new Error("NOT_FOUND");
    const blocked = await db
      .select({ id: bookings.id, startDate: bookings.startDate, endDate: bookings.endDate })
      .from(bookings)
      .where(and(eq(bookings.alpacaId, data.id), eq(bookings.status, "confirmed")))
      .orderBy(asc(bookings.startDate));
    return { alpaca, blocked };
  });

export const createBooking = createServerFn({ method: "POST" })
  .validator(
    z.object({ alpacaId: z.string().min(1), startDate: z.iso.date(), endDate: z.iso.date() }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (data.startDate <= todayIso())
      throw new Error("Der Starttermin muss in der Zukunft liegen.");
    if (data.endDate <= data.startDate)
      throw new Error("Das Enddatum muss nach dem Startdatum liegen.");
    const alpaca = await db.query.alpacas.findFirst({
      where: and(eq(alpacas.id, data.alpacaId), eq(alpacas.active, true)),
    });
    if (!alpaca) throw new Error("Dieses Alpaka ist nicht verfügbar.");
    const overlap = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.alpacaId, data.alpacaId),
        eq(bookings.status, "confirmed"),
        lt(bookings.startDate, data.endDate),
        gt(bookings.endDate, data.startDate),
      ),
    });
    if (overlap) throw new Error("Dieser Zeitraum ist bereits gebucht.");
    const id = crypto.randomUUID();
    await db.insert(bookings).values({
      id,
      userId: user.id,
      alpacaId: alpaca.id,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "confirmed",
      totalPrice: alpaca.dailyRate * rentalDays(data.startDate, data.endDate),
    });
    return { id };
  });

export const getBookingConfirmation = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const [booking] = await db
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
      .where(eq(bookings.id, data.id))
      .limit(1);
    if (!booking || (booking.userId !== user.id && user.role !== "admin"))
      throw new Error("NOT_FOUND");
    return booking;
  });

export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const ownBookings = await db
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
});

export const cancelOwnBooking = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, data.id), eq(bookings.userId, user.id)),
    });
    if (!booking || booking.startDate <= todayIso())
      throw new Error("Diese Buchung kann nicht mehr storniert werden.");
    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.id, data.id), eq(bookings.userId, user.id)));
    return { ok: true };
  });

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const [[alpacaCount], [activeBookingCount]] = await Promise.all([
    db.select({ value: count() }).from(alpacas),
    db.select({ value: count() }).from(bookings).where(eq(bookings.status, "confirmed")),
  ]);
  return { alpacas: alpacaCount.value, activeBookings: activeBookingCount.value };
});

export const listAdminAlpacas = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db.select().from(alpacas).orderBy(asc(alpacas.name));
});

const alpacaInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(10).max(1000),
  furColor: z.string().trim().min(2).max(50),
  spitRisk: z.enum(["low", "medium", "high"]),
  dailyRate: z.number().int().positive(),
  imageUrl: z.union([z.url(), z.literal("")]),
  active: z.boolean(),
});
export const saveAlpaca = createServerFn({ method: "POST" })
  .validator(alpacaInput)
  .handler(async ({ data }) => {
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
    const id = data.id ?? crypto.randomUUID();
    if (data.id) await db.update(alpacas).set(values).where(eq(alpacas.id, data.id));
    else await db.insert(alpacas).values({ id, ...values });
    return { id };
  });

export const setAlpacaActive = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), active: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(alpacas).set({ active: data.active }).where(eq(alpacas.id, data.id));
    return { ok: true };
  });
export const getAdminAlpaca = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const alpaca = await db.query.alpacas.findFirst({ where: eq(alpacas.id, data.id) });
    if (!alpaca) throw new Error("NOT_FOUND");
    return alpaca;
  });

export const listAdminBookings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
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
});
export const adminCancelBooking = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, data.id));
    return { ok: true };
  });
