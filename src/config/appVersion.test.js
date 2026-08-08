import { describe, expect, it } from "vitest";
import {
  RELEASE_SURFACES,
  doesVersionMatchApp,
  getReleaseSurfaceVersion,
  isReleaseSurfaceEnabledForVersion,
  normalizeAppVersion,
} from "./appVersion";

describe("app version config", () => {
  it("normalizes package and env-style versions", () => {
    expect(normalizeAppVersion("1.6.0")).toBe("v1.6.0");
    expect(normalizeAppVersion("v1.6.0")).toBe("v1.6.0");
    expect(normalizeAppVersion("version 1.6.0")).toBe("v1.6.0");
    expect(normalizeAppVersion("")).toBe("");
  });

  it("enables release surfaces only for their configured app version", () => {
    expect(getReleaseSurfaceVersion(RELEASE_SURFACES.APP_UPDATE_MODAL)).toBe(
      "v1.6.0",
    );
    expect(
      isReleaseSurfaceEnabledForVersion(
        RELEASE_SURFACES.PROJECT_BOARD_TOUR,
        "v1.6.0",
      ),
    ).toBe(true);
    expect(
      isReleaseSurfaceEnabledForVersion(
        RELEASE_SURFACES.PROJECT_BOARD_TOUR,
        "v1.7.0",
      ),
    ).toBe(false);
  });

  it("supports matching against one or multiple target versions", () => {
    expect(doesVersionMatchApp("1.6.0", "v1.6.0")).toBe(true);
    expect(doesVersionMatchApp(["v1.5.0", "v1.6.0"], "1.6.0")).toBe(true);
    expect(doesVersionMatchApp(["v1.5.0", "v1.7.0"], "1.6.0")).toBe(false);
  });
});
