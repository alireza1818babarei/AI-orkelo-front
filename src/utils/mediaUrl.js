const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const AI_AVATAR_POOL = [
  "/assets/images/ai_avtar/icon-1.jpg",
  "/assets/images/ai_avtar/icon-2.png",
  "/assets/images/ai_avtar/icon-3.png",
  "/assets/images/ai_avtar/icon-4.png",
  "/assets/images/ai_avtar/icon-5.png",
  "/assets/images/ai_avtar/icon-6.png",
  "/assets/images/ai_avtar/icon-7.png",
  "/assets/images/ai_avtar/icon-8.png",
  "/assets/images/ai_avtar/icon-9.png",
];

export const getBackendOrigin = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  try {
    return new URL(String(apiBase)).origin;
  } catch {
    return "";
  }
};

const hashString = (value) => {
  const input = String(value ?? "");
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const resolveRandomAiAvatar = (seed = "") => {
  if (!AI_AVATAR_POOL.length) return "";
  const index = hashString(seed || "guest-avatar") % AI_AVATAR_POOL.length;
  return AI_AVATAR_POOL[index];
};

export const resolveUserAvatarUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
  if (raw.startsWith("/assets/")) return raw;
  if (raw.startsWith("assets/")) return `/${raw}`;

  const backendOrigin = getBackendOrigin();

  if (/^https?:\/\//i.test(raw)) {
    if (!backendOrigin) return raw;
    try {
      const parsed = new URL(raw);
      if (LOCAL_HOSTNAMES.has(parsed.hostname)) {
        return `${backendOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return raw;
    }
    return raw;
  }

  const cleaned = raw.replace(/^\/+/, "");
  if (!backendOrigin) {
    if (cleaned.startsWith("storage/")) return `/${cleaned}`;
    if (cleaned.startsWith("user_avatars/")) return `/storage/${cleaned}`;
    if (cleaned.startsWith("company_images/")) return `/storage/${cleaned}`;
    return raw;
  }

  if (cleaned.startsWith("storage/")) {
    return `${backendOrigin}/${cleaned}`;
  }

  if (cleaned.startsWith("user_avatars/")) {
    return `${backendOrigin}/storage/${cleaned}`;
  }

  if (cleaned.startsWith("company_images/")) {
    return `${backendOrigin}/storage/${cleaned}`;
  }

  if (cleaned.includes("/")) {
    return `${backendOrigin}/${cleaned}`;
  }

  // DB values like "avatar.jpg" are usually served from "/storage/avatar.jpg".
  return `${backendOrigin}/storage/${cleaned}`;
};

export const resolveUserAvatarWithFallback = (value, seed = "") =>
  resolveUserAvatarUrl(value) || resolveRandomAiAvatar(seed);
