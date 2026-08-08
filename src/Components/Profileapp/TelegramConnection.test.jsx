import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TelegramConnection, {
  getTelegramErrorMessage,
} from "./TelegramConnection";
import {
  createTelegramLinkClaim,
  getTelegramLinkClaimStatus,
} from "../../services/telegram";
import { toastError, toastInfo, toastSuccess } from "../../utils/sweetAlert";

const { dispatchMock } = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock("../../services/telegram", () => ({
  createTelegramLinkClaim: vi.fn(),
  getTelegramLinkClaimStatus: vi.fn(),
}));

vi.mock("../../utils/sweetAlert", () => ({
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
}));

const claimResponse = {
  message: "Telegram connection link created.",
  code: "telegram_link_created",
  data: {
    claimId: 42,
    url: "https://t.me/example_bot?start=test-token",
    expires_at: "2099-08-06T12:10:00Z",
    expires_in_seconds: 600,
  },
};

describe("TelegramConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTelegramLinkClaimStatus.mockResolvedValue({
      claimId: 42,
      status: "pending",
      connected: false,
    });
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

  afterEach(() => {
    vi.useRealTimers();
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

    const loadingButton = screen.getByRole("button", { name: "Creating link..." });
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

  it("polls until Telegram reports a completed connection", async () => {
    vi.useFakeTimers();
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    getTelegramLinkClaimStatus.mockResolvedValue({
      claimId: 42,
      status: "completed",
      connected: true,
      telegramUsername: "username",
    });
    render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
    });
    expect(
      screen.getByRole("button", { name: "Waiting for Telegram..." }),
    ).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(getTelegramLinkClaimStatus).toHaveBeenCalledWith(42, {
      signal: expect.any(AbortSignal),
    });
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Your Telegram account has been connected.",
    );
    expect(toastSuccess).toHaveBeenCalledWith("Telegram account connected");
    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });

  it("stops and reports when a completed claim is disconnected", async () => {
    vi.useFakeTimers();
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    getTelegramLinkClaimStatus.mockResolvedValue({
      claimId: 42,
      status: "completed",
      connected: false,
    });
    render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(screen.getByText("Not connected")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "The Telegram account was disconnected",
    );
    expect(getTelegramLinkClaimStatus).toHaveBeenCalledTimes(1);
  });

  it("stops polling and allows a new claim when the claim expires", async () => {
    vi.useFakeTimers();
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    getTelegramLinkClaimStatus.mockResolvedValue({
      claimId: 42,
      status: "expired",
      connected: false,
    });
    render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "The Telegram linking request expired.",
    );
    expect(
      screen.getByRole("button", { name: "Connect Telegram" }),
    ).toBeEnabled();
    expect(getTelegramLinkClaimStatus).toHaveBeenCalledTimes(1);
  });

  it("retries a network error on the next interval while still pending", async () => {
    vi.useFakeTimers();
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    getTelegramLinkClaimStatus
      .mockRejectedValueOnce({ status: 0, message: "Network Error" })
      .mockResolvedValueOnce({
        claimId: 42,
        status: "completed",
        connected: true,
      });
    render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(getTelegramLinkClaimStatus).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(getTelegramLinkClaimStatus).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("stops polling and shows an error when the claim is not found", async () => {
    vi.useFakeTimers();
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    getTelegramLinkClaimStatus.mockRejectedValue({
      status: 404,
      message: "Not Found",
    });
    render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The Telegram linking request could not be found.",
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(getTelegramLinkClaimStatus).toHaveBeenCalledTimes(1);
  });

  it("stops polling when the user closes the pending message", async () => {
    vi.useFakeTimers();
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Stop waiting for Telegram" }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(getTelegramLinkClaimStatus).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Connect Telegram" }),
    ).toBeEnabled();
  });

  it("aborts an in-flight status request when unmounted", async () => {
    vi.useFakeTimers();
    let requestSignal;
    createTelegramLinkClaim.mockResolvedValue(claimResponse);
    getTelegramLinkClaimStatus.mockImplementation((_claimId, { signal }) => {
      requestSignal = signal;
      return new Promise(() => {});
    });
    const { unmount } = render(<TelegramConnection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Connect Telegram" }));
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(requestSignal?.aborted).toBe(false);

    unmount();
    expect(requestSignal?.aborted).toBe(true);
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
