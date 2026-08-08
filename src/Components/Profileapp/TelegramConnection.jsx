import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, CardBody, Spinner } from "reactstrap";
import {
  createTelegramLinkClaim,
  getTelegramLinkClaimStatus,
} from "../../services/telegram";
import { getMyProfileThunk, meThunk } from "../../store/auth/authSlice";
import { toastError, toastInfo, toastSuccess } from "../../utils/sweetAlert";

const CLAIM_POLL_INTERVAL_MS = 2000;
const DEFAULT_CLAIM_LIFETIME_MS = 10 * 60 * 1000;
const MAX_TIMER_DELAY_MS = 2_147_483_647;

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

const unwrapData = (payload) => {
  if (
    payload?.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return payload.data;
  }

  return payload ?? {};
};

const getClaimExpiryTimestamp = (claim) => {
  const expiresAt = claim?.expires_at ?? claim?.expiresAt;
  const parsedExpiresAt = expiresAt ? new Date(expiresAt).getTime() : NaN;
  if (Number.isFinite(parsedExpiresAt)) return parsedExpiresAt;

  const expiresInSeconds = Number(
    claim?.expires_in_seconds ?? claim?.expiresInSeconds,
  );
  if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    return Date.now() + expiresInSeconds * 1000;
  }

  return Date.now() + DEFAULT_CLAIM_LIFETIME_MS;
};

const isNetworkError = (error) =>
  error?.status !== undefined &&
  error?.status !== null &&
  Number(error.status) === 0;

const TelegramConnection = ({ connected = false }) => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(connected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [instructions, setInstructions] = useState("");
  const [instructionTone, setInstructionTone] = useState("info");
  const [claimStatus, setClaimStatus] = useState("idle");

  const mountedRef = useRef(false);
  const activeClaimIdRef = useRef(null);
  const createAbortControllerRef = useRef(null);
  const pollAbortControllerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const claimExpiryTimerRef = useRef(null);
  const pollGenerationRef = useRef(0);

  const stopPolling = useCallback(() => {
    pollGenerationRef.current += 1;

    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (claimExpiryTimerRef.current !== null) {
      window.clearTimeout(claimExpiryTimerRef.current);
      claimExpiryTimerRef.current = null;
    }

    if (pollAbortControllerRef.current) {
      pollAbortControllerRef.current.abort();
      pollAbortControllerRef.current = null;
    }

    activeClaimIdRef.current = null;
  }, []);

  useEffect(() => {
    if (connected) setIsConnected(true);
  }, [connected]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      createAbortControllerRef.current?.abort();
      createAbortControllerRef.current = null;
      stopPolling();
    };
  }, [stopPolling]);

  const setExpiredState = useCallback(() => {
    stopPolling();
    if (!mountedRef.current) return;

    setLoading(false);
    setIsConnected(false);
    setClaimStatus("expired");
    setInstructionTone("warning");
    setInstructions(
      "The Telegram linking request expired. Create a new link to try again.",
    );
  }, [stopPolling]);

  const startPolling = useCallback(
    (claimId, expiresAtTimestamp) => {
      stopPolling();
      activeClaimIdRef.current = claimId;
      const generation = pollGenerationRef.current;

      const isCurrentPoll = () =>
        mountedRef.current &&
        pollGenerationRef.current === generation &&
        String(activeClaimIdRef.current) === String(claimId);

      const expireClaim = () => {
        if (!isCurrentPoll()) return;
        setExpiredState();
      };

      const scheduleNextPoll = () => {
        if (!isCurrentPoll()) return;
        pollTimerRef.current = window.setTimeout(
          pollClaimStatus,
          CLAIM_POLL_INTERVAL_MS,
        );
      };

      const pollClaimStatus = async () => {
        if (!isCurrentPoll()) return;

        const controller = new AbortController();
        pollAbortControllerRef.current = controller;

        try {
          const payload = await getTelegramLinkClaimStatus(claimId, {
            signal: controller.signal,
          });
          if (!isCurrentPoll() || controller.signal.aborted) return;

          const statusData = unwrapData(payload);
          const status = String(statusData?.status ?? "").toLowerCase();

          if (status === "pending") {
            scheduleNextPoll();
            return;
          }

          if (status === "completed") {
            stopPolling();
            setLoading(false);
            setClaimStatus("completed");
            setError("");

            if (statusData?.connected === true) {
              setIsConnected(true);
              setInstructionTone("success");
              setInstructions("Your Telegram account has been connected.");
              toastSuccess("Telegram account connected");
              dispatch(meThunk());
              dispatch(getMyProfileThunk());
            } else {
              setIsConnected(false);
              setInstructionTone("warning");
              setInstructions(
                "The Telegram account was disconnected after the linking request completed.",
              );
              toastInfo(
                "Telegram was disconnected after the linking request completed.",
              );
            }
            return;
          }

          if (status === "expired") {
            setExpiredState();
            return;
          }

          stopPolling();
          setLoading(false);
          setClaimStatus("error");
          setInstructions("");
          setError("Telegram returned an unknown linking status.");
          toastError("Telegram returned an unknown linking status.");
        } catch (pollError) {
          if (
            !isCurrentPoll() ||
            controller.signal.aborted ||
            pollError?.message === "canceled"
          ) {
            return;
          }

          if (isNetworkError(pollError)) {
            scheduleNextPoll();
            return;
          }

          const status = Number(pollError?.status ?? 0);
          stopPolling();
          setLoading(false);
          setClaimStatus("error");
          setInstructions("");

          if (status === 401) {
            setError("Your session has expired. Please sign in again.");
            dispatch(meThunk());
            return;
          }

          if (status === 404) {
            const message =
              "The Telegram linking request could not be found. Create a new link to try again.";
            setError(message);
            toastError(message);
            return;
          }

          const message = getTelegramErrorMessage(pollError);
          setError(message);
          toastError(message);
        } finally {
          if (pollAbortControllerRef.current === controller) {
            pollAbortControllerRef.current = null;
          }
        }
      };

      const expiresInMs = Math.min(
        MAX_TIMER_DELAY_MS,
        Math.max(0, expiresAtTimestamp - Date.now()),
      );
      claimExpiryTimerRef.current = window.setTimeout(
        expireClaim,
        expiresInMs,
      );
      scheduleNextPoll();
    },
    [dispatch, setExpiredState, stopPolling],
  );

  const handleConnect = async () => {
    if (
      loading ||
      isConnected ||
      claimStatus === "pending" ||
      createAbortControllerRef.current
    ) {
      return;
    }

    stopPolling();
    setLoading(true);
    setError("");
    setInstructions("");
    setInstructionTone("info");
    setClaimStatus("creating");

    const controller = new AbortController();
    createAbortControllerRef.current = controller;

    try {
      const payload = await createTelegramLinkClaim({
        signal: controller.signal,
      });
      if (!mountedRef.current || controller.signal.aborted) return;

      const claim = unwrapData(payload);
      const telegramUrl = getTelegramUrl(payload);
      const claimId = claim?.claimId ?? claim?.claim_id;

      if (!telegramUrl) {
        throw new Error(
          "The server did not return a valid Telegram connection link. Please try again.",
        );
      }

      if (claimId === null || claimId === undefined || String(claimId) === "") {
        throw new Error(
          "The server did not return a Telegram claim ID. Please try again.",
        );
      }

      openTelegramUrl(telegramUrl);
      const nextInstructions =
        "Open Telegram and press Start to complete the connection." +
        formatExpiry(claim?.expires_in_seconds ?? claim?.expiresInSeconds);
      setInstructions(nextInstructions);
      setInstructionTone("info");
      setClaimStatus("pending");
      startPolling(claimId, getClaimExpiryTimestamp(claim));
      toastInfo("Open Telegram and press Start to complete the connection.");
    } catch (requestError) {
      if (
        !mountedRef.current ||
        controller.signal.aborted ||
        requestError?.message === "canceled"
      ) {
        return;
      }

      if (isAlreadyConnectedError(requestError)) {
        stopPolling();
        setIsConnected(true);
        setClaimStatus("completed");
        setInstructionTone("success");
        setInstructions("Telegram is already connected to your account.");
        toastInfo("Telegram is already connected to your account.");
      } else {
        const message = getTelegramErrorMessage(requestError);
        setClaimStatus("error");
        setError(message);
        toastError(message);
      }
    } finally {
      if (createAbortControllerRef.current === controller) {
        createAbortControllerRef.current = null;
      }
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleStopWaiting = () => {
    stopPolling();
    setLoading(false);
    setClaimStatus("idle");
    setInstructions("");
    setError("");
  };

  const waitingForTelegram = claimStatus === "pending";

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
            disabled={loading || waitingForTelegram || isConnected}
            aria-busy={loading || waitingForTelegram}
          >
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <Spinner size="sm" aria-hidden="true" />
                <span>Creating link...</span>
              </span>
            ) : waitingForTelegram ? (
              <span className="d-inline-flex align-items-center gap-2">
                <Spinner size="sm" aria-hidden="true" />
                <span>Waiting for Telegram...</span>
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
          <div
            className={`alert alert-${instructionTone} ${
              waitingForTelegram ? "alert-dismissible" : ""
            } mt-3 mb-0`}
            role="status"
          >
            {waitingForTelegram ? (
              <strong className="me-1">Waiting for Telegram...</strong>
            ) : null}
            {instructions}
            {waitingForTelegram ? (
              <button
                type="button"
                className="btn-close"
                aria-label="Stop waiting for Telegram"
                onClick={handleStopWaiting}
              ></button>
            ) : null}
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
