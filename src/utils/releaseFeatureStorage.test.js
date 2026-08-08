import { beforeEach, describe, expect, it } from "vitest";
import {
  buildVersionedFeatureStorageKey,
  hasSeenVersionedFeature,
  markVersionedFeatureSeen,
} from "./releaseFeatureStorage";

describe("release feature storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("builds a user and version scoped storage key", () => {
    expect(
      buildVersionedFeatureStorageKey({
        prefix: "orkelo_tour_seen",
        userId: 42,
        featureVersion: "1.6.0",
      }),
    ).toBe("orkelo_tour_seen:42:v1.6.0");
  });

  it("marks the current versioned key as seen", () => {
    const storageKey = "orkelo_tour_seen:42:v1.6.0";

    markVersionedFeatureSeen(storageKey);

    expect(hasSeenVersionedFeature(storageKey)).toBe(true);
  });

  it("respects legacy keys so existing users do not see migrated tours again", () => {
    const storageKey = "orkelo_tour_seen:42:v1.6.0";
    const legacyKey = "orkelo_tour_seen_v1:42";

    window.localStorage.setItem(legacyKey, "1");

    expect(hasSeenVersionedFeature(storageKey, [legacyKey])).toBe(true);
  });
});
