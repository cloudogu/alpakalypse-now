import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { formatDate, formatMoney, rentalDays, todayIso } from "./format";

afterEach(() => vi.useRealTimers());

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

  it("formats an ISO date for the German locale", () => {
    expect(formatDate("2026-09-16")).toBe("16.09.2026");
  });

  it("returns today's ISO calendar date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T23:30:00Z"));

    expect(todayIso()).toBe("2026-09-16");
  });
});
