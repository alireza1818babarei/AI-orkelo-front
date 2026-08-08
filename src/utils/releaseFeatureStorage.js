import { APP_VERSION, normalizeAppVersion } from "../config/appVersion";

export const normalizeStorageKeyPart = (value, fallback = "guest") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

export const canUseLocalStorage = (probePrefix = "orkelo_storage_probe") => {
  if (typeof window === "undefined") return false;

  try {
    const probeKey = `${probePrefix}:probe`;
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
};

export const buildVersionedFeatureStorageKey = ({
  prefix,
  userId,
  featureVersion = APP_VERSION,
  extraParts = [],
}) => {
  const normalizedPrefix = normalizeStorageKeyPart(prefix, "orkelo_feature");
  const normalizedUserId = normalizeStorageKeyPart(userId);
  const normalizedVersion = normalizeStorageKeyPart(
    normalizeAppVersion(featureVersion),
    "unknown-version",
  );
  const normalizedExtraParts = (Array.isArray(extraParts) ? extraParts : [])
    .map((part) => normalizeStorageKeyPart(part, "item"))
    .filter(Boolean);

  return [
    normalizedPrefix,
    normalizedUserId,
    normalizedVersion,
    ...normalizedExtraParts,
  ].join(":");
};

export const hasSeenVersionedFeature = (
  storageKey,
  legacyStorageKeys = [],
) => {
  if (!canUseLocalStorage(storageKey)) return false;

  try {
    const keysToCheck = [
      storageKey,
      ...(Array.isArray(legacyStorageKeys) ? legacyStorageKeys : []),
    ].filter(Boolean);

    return keysToCheck.some((key) => window.localStorage.getItem(key) === "1");
  } catch {
    return false;
  }
};

export const markVersionedFeatureSeen = (storageKey) => {
  if (!canUseLocalStorage(storageKey)) return;

  try {
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // Storage failures should not block release UI.
  }
};
