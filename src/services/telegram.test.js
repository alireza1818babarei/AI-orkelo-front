import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api/axios";
import {
  createTelegramLinkClaim,
  getTelegramLinkClaimStatus,
  hasTelegramConnection,
} from "./telegram";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Telegram service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts to the Telegram link claims endpoint", async () => {
    const response = {
      data: {
        code: "telegram_link_created",
        data: { url: "https://t.me/example_bot?start=test-token" },
      },
    };
    api.post.mockResolvedValue(response);

    await expect(createTelegramLinkClaim()).resolves.toEqual(response.data);
    expect(api.post).toHaveBeenCalledWith("/telegram/link-claims");
  });

  it("gets a Telegram link claim status with cancellation support", async () => {
    const controller = new AbortController();
    const response = {
      data: { claimId: 42, status: "pending", connected: false },
    };
    api.get.mockResolvedValue(response);

    await expect(
      getTelegramLinkClaimStatus(42, { signal: controller.signal }),
    ).resolves.toEqual(response.data);
    expect(api.get).toHaveBeenCalledWith(
      "/telegram/link-claims/42/status",
      { signal: controller.signal },
    );
  });

  it("recognizes Telegram status already present in profile data", () => {
    expect(hasTelegramConnection({ telegram_connected: true })).toBe(true);
    expect(hasTelegramConnection({ telegram: { connected_at: "2026-08-06" } })).toBe(
      true,
    );
    expect(hasTelegramConnection({}, null)).toBe(false);
  });
});
