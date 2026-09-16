import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { db } from "#/db";
import { createApplication, type Actor } from "#/lib/application";
import { auth } from "#/lib/auth";
import { todayIso } from "#/lib/format";
import { alpacaInput, bookingInput } from "#/lib/validation";

async function currentUser(): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: getRequest().headers });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role === "admin" ? "admin" : "customer",
  };
}

const application = createApplication({
  database: db,
  currentUser,
  today: todayIso,
  createId: () => crypto.randomUUID(),
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(currentUser);
export const listActiveAlpacas = createServerFn({ method: "GET" }).handler(() =>
  application.listActiveAlpacas(),
);

export const getAlpaca = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => application.getAlpaca(data.id));

export const createBooking = createServerFn({ method: "POST" })
  .validator(bookingInput)
  .handler(({ data }) => application.createBooking(data));

export const getBookingConfirmation = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => application.getBookingConfirmation(data.id));

export const getProfile = createServerFn({ method: "GET" }).handler(() => application.getProfile());

export const cancelOwnBooking = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => application.cancelOwnBooking(data.id));

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(() =>
  application.getAdminDashboard(),
);

export const listAdminAlpacas = createServerFn({ method: "GET" }).handler(() =>
  application.listAdminAlpacas(),
);

export const saveAlpaca = createServerFn({ method: "POST" })
  .validator(alpacaInput)
  .handler(({ data }) => application.saveAlpaca(data));

export const setAlpacaActive = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), active: z.boolean() }))
  .handler(({ data }) => application.setAlpacaActive(data.id, data.active));

export const getAdminAlpaca = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => application.getAdminAlpaca(data.id));

export const listAdminBookings = createServerFn({ method: "GET" }).handler(() =>
  application.listAdminBookings(),
);

export const adminCancelBooking = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => application.adminCancelBooking(data.id));
