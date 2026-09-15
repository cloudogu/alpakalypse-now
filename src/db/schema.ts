import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  role: text("role", { enum: ["customer", "admin"] })
    .default("customer")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const alpacas = sqliteTable("alpacas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  furColor: text("fur_color").notNull(),
  spitRisk: text("spit_risk", { enum: ["low", "medium", "high"] })
    .default("low")
    .notNull(),
  dailyRate: integer("daily_rate").notNull(),
  imageUrl: text("image_url"),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    alpacaId: text("alpaca_id")
      .notNull()
      .references(() => alpacas.id),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    status: text("status", { enum: ["confirmed", "cancelled"] })
      .default("confirmed")
      .notNull(),
    totalPrice: integer("total_price").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => [
    index("bookings_user_id_idx").on(table.userId),
    index("bookings_alpaca_id_idx").on(table.alpacaId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  sessions: many(sessions),
  accounts: many(accounts),
}));
export const alpacasRelations = relations(alpacas, ({ many }) => ({ bookings: many(bookings) }));
export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  alpaca: one(alpacas, { fields: [bookings.alpacaId], references: [alpacas.id] }),
}));
