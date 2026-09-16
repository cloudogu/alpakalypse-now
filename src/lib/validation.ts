import { z } from "zod";

export const bookingInput = z.object({
  alpacaId: z.string().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});

export const alpacaInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(10).max(1000),
  furColor: z.string().trim().min(2).max(50),
  spitRisk: z.enum(["low", "medium", "high"]),
  dailyRate: z.number().int().positive(),
  imageUrl: z.union([z.url(), z.literal("")]),
  active: z.boolean(),
});
