import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TelegramConnection, {
  getTelegramErrorMessage,
} from "./TelegramConnection";
import { createTelegramLinkClaim } from "../../services/telegram";
import { toastError, toastInfo } from "../../utils/sweetAlert";

vi.mock("../../services/telegram", () => ({
  createTelegramLinkClaim: vi.fn(),
}));

vi.mock("../../utils/sweetAlert", () => ({
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

const claimResponse = {
  message: "Telegram connection link created.",
  code: "telegram_link_created",
  data: {
    url: "https://t.me/example_bot?start=test-token",
    expires_at: "2026-08-06T12:10:00Z",
    expires_in_seconds: 600,
  },
};

describe("TelegramConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "open").mockReturnValue({});
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    });
  });

  it("renders the Telegram status and connect button", () => {
    render(<TelegramConnection />);

    expect(screen.getByRole("heading", { name: "Telegram" })).toBeInTheDocument();
    expect(screen.getByText("Not connected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect Telegram" }),
    ).toBeEnabled();
  });

  it("sends a Telegram link claim request when clicked", async () => {
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    render(<TelegramConnection />);

    fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));

    await waitFor(() => expect(createTelegramLinkClaim).toHaveBeenCalledTimes(1));
  });

  it("disables the button and shows a loading state while requesting", async () => {
    let resolveRequest;
    createTelegramLinkClaim.mockImplementation(
      () => new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<TelegramConnection />);

    fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));

    const loadingButton = screen.getByRole("button", { name: "Connecting..." });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolveRequest(claimResponse);
    });
  });

  it("opens the returned Telegram URL on desktop and shows instructions", async () => {
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    render(<TelegramConnection />);

    fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        claimResponse.data.url,
        "_blank",
        "noopener,noreferrer",
      );
    });
    expect(
      screen.getByText(/Open Telegram and press Start to complete the connection\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/The link expires in 10 minutes\./)).toBeInTheDocument();
    expect(toastInfo).toHaveBeenCalledWith(
      "Open Telegram and press Start to complete the connection.",
    );
  });

  it("opens the returned Telegram URL in a new tab on mobile devices too", async () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile",
    });
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    render(<TelegramConnection />);

    fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        claimResponse.data.url,
        "_blank",
        "noopener,noreferrer",
      );
    });
  });

  it("displays an API error and sends it to the existing toast system", async () => {
    createTelegramLinkClaim.mockRejectedValue({
      status: 503,
      message: "Telegram bot is not configured.",
    });
    render(<TelegramConnection />);

    fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));

    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(
      "Telegram is unavailable because the bot is not configured.",
    );
    expect(toastError).toHaveBeenCalledWith(error.textContent);
  });

  it("shows an already connected account without making a request", () => {
    render(<TelegramConnection connected />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Telegram Connected" }),
    ).toBeDisabled();
    expect(createTelegramLinkClaim).not.toHaveBeenCalled();
  });

  it("treats a conflict response as an already connected account", async () => {
    createTelegramLinkClaim.mockRejectedValue({
      status: 409,
      message: "Telegram is already connected.",
    });
    render(<TelegramConnection />);

    fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));

    expect(await screen.findByText("Connected")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Telegram is already connected to your account.",
    );
  });
});

describe("getTelegramErrorMessage", () => {
  it.each([
    [
      { status: 401, message: "Unauthenticated." },
      "Your session has expired. Please sign in again.",
    ],
    [
      { status: 403, message: "Forbidden." },
      "You are not allowed to connect Telegram for this account.",
    ],
    [
      { status: 410, message: "Claim expired." },
      "The Telegram connection link has expired. Create a new link and try again.",
    ],
    [
      { status: 0, message: "Network Error" },
      "Could not reach the server. Check your connection and try again.",
    ],
  ])("maps %# to a helpful message", (error, expected) => {
    expect(getTelegramErrorMessage(error)).toBe(expected);
  });
});
