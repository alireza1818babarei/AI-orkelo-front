import api from "../api/axios";

export const createTelegramLinkClaim = async () => {
  const response = await api.post("/telegram/link-claims");
  return response.data;
};

const hasValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const sourceHasTelegramConnection = (source) => {
  if (!source || typeof source !== "object") return false;

  if (
    source.telegram_connected === true ||
    source.is_telegram_connected === true ||
    source.has_telegram_connection === true
  ) {
    return true;
  }

  if (
    hasValue(source.telegram_chat_id) ||
    hasValue(source.telegram_user_id) ||
    hasValue(source.telegram_connected_at) ||
    hasValue(source.telegram_linked_at)
  ) {
    return true;
  }

  const telegram = source.telegram_account ?? source.telegram;
  return Boolean(
    telegram &&
      typeof telegram === "object" &&
      (telegram.connected === true ||
        telegram.is_connected === true ||
        hasValue(telegram.chat_id) ||
        hasValue(telegram.connected_at) ||
        hasValue(telegram.linked_at)),
  );
};

export const hasTelegramConnection = (...sources) =>
  sources.some(sourceHasTelegramConnection);
