import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Spinner } from "reactstrap";
import { createTelegramLinkClaim } from "../../services/telegram";
import { toastError, toastInfo } from "../../utils/sweetAlert";

const ALREADY_CONNECTED_CODES = new Set([
  "telegram_already_connected",
  "telegram_account_already_connected",
  "telegram_link_exists",
]);

export const openTelegramUrl = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const getTelegramUrl = (payload) => {
  const rawUrl = payload?.data?.url;
  if (!rawUrl) return null;

  try {
    const parsedUrl = new URL(rawUrl);
    const isTelegramHost =
      parsedUrl.hostname === "t.me" || parsedUrl.hostname.endsWith(".t.me");
    return parsedUrl.protocol === "https:" && isTelegramHost ? rawUrl : null;
  } catch {
    return null;
  }
};

const isAlreadyConnectedError = (error) => {
  const code = String(error?.code ?? "").toLowerCase();
  const message = String(error?.message ?? "").toLowerCase();
  return (
    ALREADY_CONNECTED_CODES.has(code) ||
    Number(error?.status) === 409 ||
    /already (connected|linked)/.test(message)
  );
};

export const getTelegramErrorMessage = (error) => {
  const hasHttpStatus = error?.status !== undefined && error?.status !== null;
  const status = hasHttpStatus ? Number(error.status) : null;
  const message = String(error?.message ?? "").trim();
  const normalizedMessage = message.toLowerCase();

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You are not allowed to connect Telegram for this account.";
  }

  if (status === 410 || normalizedMessage.includes("expired")) {
    return "The Telegram connection link has expired. Create a new link and try again.";
  }

  if (
    status === 503 ||
    (normalizedMessage.includes("bot") &&
      /(not configured|unconfigured|unavailable|disabled)/.test(
        normalizedMessage,
      ))
  ) {
    return "Telegram is unavailable because the bot is not configured. Please contact support.";
  }

  if (
    (hasHttpStatus && status === 0) ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("timeout")
  ) {
    return "Could not reach the server. Check your connection and try again.";
  }

  return message || "Could not create a Telegram connection link. Please try again.";
};

const formatExpiry = (seconds) => {
  const parsedSeconds = Number(seconds);
  if (!Number.isFinite(parsedSeconds) || parsedSeconds <= 0) return "";

  if (parsedSeconds >= 60) {
    const minutes = Math.ceil(parsedSeconds / 60);
    return ` The link expires in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
  }

  return ` The link expires in ${Math.round(parsedSeconds)} seconds.`;
};

const TelegramConnection = ({ connected = false }) => {
  const [isConnected, setIsConnected] = useState(connected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (connected) setIsConnected(true);
  }, [connected]);

  const handleConnect = async () => {
    if (loading || isConnected) return;

    setLoading(true);
    setError("");
    setInstructions("");

    try {
      const payload = await createTelegramLinkClaim();
      const telegramUrl = getTelegramUrl(payload);

      if (!telegramUrl) {
        throw new Error(
          "The server did not return a valid Telegram connection link. Please try again.",
        );
      }

      openTelegramUrl(telegramUrl);
      const nextInstructions =
        "Open Telegram and press Start to complete the connection." +
        formatExpiry(payload?.data?.expires_in_seconds);
      setInstructions(nextInstructions);
      toastInfo("Open Telegram and press Start to complete the connection.");
    } catch (requestError) {
      if (isAlreadyConnectedError(requestError)) {
        setIsConnected(true);
        setInstructions("Telegram is already connected to your account.");
        toastInfo("Telegram is already connected to your account.");
      } else {
        const message = getTelegramErrorMessage(requestError);
        setError(message);
        toastError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-3 p-md-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span
              className="h-45 w-45 d-flex-center rounded-circle text-white flex-shrink-0"
              style={{ backgroundColor: "#229ED9" }}
              aria-hidden="true"
            >
              <i className="ti ti-brand-telegram fs-4"></i>
            </span>
            <div>
              <h5 className="mb-1">Telegram</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">Status:</span>
                <span
                  className={`badge ${
                    isConnected ? "text-bg-success" : "text-bg-secondary"
                  }`}
                >
                  {isConnected ? "Connected" : "Not connected"}
                </span>
              </div>
            </div>
          </div>

          <Button
            color="primary"
            type="button"
            onClick={handleConnect}
            disabled={loading || isConnected}
            aria-busy={loading}
          >
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <Spinner size="sm" aria-hidden="true" />
                <span>Connecting...</span>
              </span>
            ) : isConnected ? (
              "Telegram Connected"
            ) : (
              "Connect Telegram"
            )}
          </Button>
        </div>

        <p className="text-muted mt-3 mb-0">
          Connect Telegram to receive account notifications through the bot.
        </p>

        {instructions ? (
          <div className="alert alert-info mt-3 mb-0" role="status">
            {instructions}
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default TelegramConnection;
