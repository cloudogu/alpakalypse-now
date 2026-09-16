import { describe, expect, it } from "vite-plus/test";

import { alpacaInput, bookingInput } from "./validation";

describe("booking input", () => {
  it("accepts a complete ISO date period", () => {
    expect(
      bookingInput.safeParse({
        alpacaId: "kevin",
        startDate: "2026-09-20",
        endDate: "2026-09-23",
      }).success,
    ).toBe(true);
  });

  it("rejects malformed transport values", () => {
    expect(
      bookingInput.safeParse({ alpacaId: "", startDate: "20.09.2026", endDate: "later" }).success,
    ).toBe(false);
  });
});

describe("alpaca input", () => {
  it("accepts the admin form value", () => {
    expect(
      alpacaInput.safeParse({
        name: "Rosalie",
        bio: "Rosalie ist ein sonniges und entspanntes Alpaka.",
        furColor: "Rosébeige",
        spitRisk: "low",
        dailyRate: 9_900,
        imageUrl: "",
        active: true,
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid price and image URL", () => {
    expect(
      alpacaInput.safeParse({
        name: "Rosalie",
        bio: "Rosalie ist ein sonniges und entspanntes Alpaka.",
        furColor: "Rosébeige",
        spitRisk: "low",
        dailyRate: 0,
        imageUrl: "not-a-url",
        active: true,
      }).success,
    ).toBe(false);
  });
});
