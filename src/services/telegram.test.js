import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api/axios";
import {
  createTelegramLinkClaim,
  hasTelegramConnection,
} from "./telegram";

vi.mock("../api/axios", () => ({
  default: {
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

  it("recognizes Telegram status already present in profile data", () => {
    expect(hasTelegramConnection({ telegram_connected: true })).toBe(true);
    expect(hasTelegramConnection({ telegram: { connected_at: "2026-08-06" } })).toBe(
      true,
    );
    expect(hasTelegramConnection({}, null)).toBe(false);
  });
});
