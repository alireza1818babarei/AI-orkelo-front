const TOKEN_KEY = "access_token";
const REMEMBERED_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const getRememberedTokenExpiresAt = () =>
  Date.now() + REMEMBERED_TOKEN_MAX_AGE_MS;

const normalizeExpiresAt = (expiresAt) => {
  const parsed = expiresAt ? new Date(expiresAt).getTime() : NaN;
  return Number.isFinite(parsed) ? parsed : getRememberedTokenExpiresAt();
};

const storeRememberedToken = (token, expiresAt = null) => {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      token,
      expiresAt: normalizeExpiresAt(expiresAt),
    }),
  );
};

const parseStoredToken = (rawValue) => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed === "string") {
      storeRememberedToken(parsed);
      return parsed;
    }
    if (!parsed || typeof parsed !== "object") return null;

    const token = typeof parsed.token === "string" ? parsed.token : null;
    const expiresAt = Number(parsed.expiresAt);
    if (!token) return null;

    if (!Number.isFinite(expiresAt)) {
      storeRememberedToken(token);
      return token;
    }

    if (Date.now() > expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return token;
  } catch {
    storeRememberedToken(rawValue);
    return rawValue;
  }
};

export const getToken = () => {
  return (
    parseStoredToken(localStorage.getItem(TOKEN_KEY)) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
};

export const setToken = (token, rememberMe, expiresAt = null) => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  if (rememberMe) {
    // Remembered sessions are intentionally bounded instead of staying in localStorage forever.
    storeRememberedToken(token, expiresAt);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearTokenEveryWhere = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
