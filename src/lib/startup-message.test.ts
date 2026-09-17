import { describe, expect, it } from "vite-plus/test";

import { ALPACA_FUN_FACTS, getRandomAlpacaFunFact } from "./startup-message";

describe("getRandomAlpacaFunFact", () => {
  it("selects a message using the supplied random value", () => {
    expect(getRandomAlpacaFunFact(() => 0)).toBe(ALPACA_FUN_FACTS[0]);
    expect(getRandomAlpacaFunFact(() => 0.999)).toBe(ALPACA_FUN_FACTS.at(-1));
  });

  it("always returns one of the configured fun facts", () => {
    expect(ALPACA_FUN_FACTS).toContain(getRandomAlpacaFunFact());
  });
});
