import { describe, expect, it } from "vitest";
import { getActiveAppUpdateForVersion } from "./appUpdates";

describe("app update releases", () => {
  it("returns the active update for the current release version", () => {
    expect(getActiveAppUpdateForVersion("v1.6.0")?.version).toBe("v1.6.0");
  });

  it("does not return old update content for a newer app version", () => {
    expect(getActiveAppUpdateForVersion("v1.7.0")).toBeNull();
  });
});
