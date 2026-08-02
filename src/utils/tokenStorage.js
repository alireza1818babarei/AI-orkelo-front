const TOKEN_KEY = "access_token";
const SESSION_TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const REMEMBERED_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const getFallbackExpiresAt = (maxAgeMs) => Date.now() + maxAgeMs;

const normalizeExpiresAt = (expiresAt, maxAgeMs) => {
  const parsed = expiresAt ? new Date(expiresAt).getTime() : NaN;
  return Number.isFinite(parsed) ? parsed : getFallbackExpiresAt(maxAgeMs);
};

const storeSharedToken = (token, expiresAt = null, maxAgeMs) => {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      token,
      expiresAt: normalizeExpiresAt(expiresAt, maxAgeMs),
    }),
  );
};

const parseStoredToken = (rawValue) => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed === "string") {
      storeSharedToken(parsed, null, SESSION_TOKEN_MAX_AGE_MS);
      return parsed;
    }
    if (!parsed || typeof parsed !== "object") return null;

    const token = typeof parsed.token === "string" ? parsed.token : null;
    const expiresAt = Number(parsed.expiresAt);
    if (!token) return null;

    if (!Number.isFinite(expiresAt)) {
      storeSharedToken(token, null, SESSION_TOKEN_MAX_AGE_MS);
      return token;
    }

    if (Date.now() > expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return token;
  } catch {
    storeSharedToken(rawValue, null, SESSION_TOKEN_MAX_AGE_MS);
    return rawValue;
  }
};

export const getToken = () => {
  const sharedToken = parseStoredToken(localStorage.getItem(TOKEN_KEY));
  if (sharedToken) return sharedToken;

  // Migrate existing per-tab sessions so the next opened tab can reuse them.
  const legacySessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (!legacySessionToken) return null;

  storeSharedToken(legacySessionToken, null, SESSION_TOKEN_MAX_AGE_MS);
  sessionStorage.removeItem(TOKEN_KEY);
  return legacySessionToken;
};

export const setToken = (token, rememberMe, expiresAt = null) => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  const maxAgeMs = rememberMe
    ? REMEMBERED_TOKEN_MAX_AGE_MS
    : SESSION_TOKEN_MAX_AGE_MS;

  // localStorage is shared by tabs. Expiry preserves the difference between
  // a regular browser session and a long-lived "Remember me" session.
  storeSharedToken(token, expiresAt, maxAgeMs);
};

export const clearTokenEveryWhere = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
