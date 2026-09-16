import { describe, expect, it } from "vite-plus/test";
import { safeRedirect } from "./navigation";

describe("safe login redirects", () => {
  it("keeps an internal application path", () => {
    expect(safeRedirect("/booking/kevin?from=catalog")).toBe("/booking/kevin?from=catalog");
  });

  it.each(["https://example.com", "//example.com", "profile", null])(
    "falls back to the profile for %s",
    (target) => {
      expect(safeRedirect(target)).toBe("/profile");
    },
  );
});
