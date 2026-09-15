import { describe, expect, it } from "vite-plus/test";
import { formatMoney, rentalDays, todayIso } from "./format";

describe("booking calculations", () => {
  it("counts rental days independently of daylight-saving changes", () => {
    expect(rentalDays("2026-03-28", "2026-03-31")).toBe(3);
  });

  it("returns a negative duration for an invalid date range", () => {
    expect(rentalDays("2026-10-12", "2026-10-10")).toBe(-2);
  });

  it("formats euro cents for the German locale", () => {
    expect(formatMoney(8_900)).toContain("89,00");
  });

  it("returns today's ISO calendar date", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
