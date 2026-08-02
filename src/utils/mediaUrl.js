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

const encodePathForUrl = (path) =>
  String(path || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const normalizePublicDiskPath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalizeCleaned = (cleanedValue) => {
    const cleaned = String(cleanedValue || "").replace(/^\/+/, "");
    if (!cleaned) return "";
    if (cleaned.startsWith("storage/")) return cleaned.slice("storage/".length);
    if (
      cleaned.startsWith("user_avatars/") ||
      cleaned.startsWith("company_images/") ||
      cleaned.startsWith("project_images/") ||
      cleaned.startsWith("task_attachments/") ||
      cleaned.startsWith("task_checklist_item_attachments/") ||
      cleaned.startsWith("attachments/")
    ) {
      return cleaned;
    }
    return "";
  };

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (!LOCAL_HOSTNAMES.has(parsed.hostname)) return "";
      return normalizeCleaned(parsed.pathname);
    } catch {
      return "";
    }
  }

  return normalizeCleaned(raw);
};

export const resolvePublicMediaUrl = (value) => {
  const backendOrigin = getBackendOrigin();
  const publicDiskPath = normalizePublicDiskPath(value);

  if (!backendOrigin || !publicDiskPath) return "";

  return `${backendOrigin}/api/v1/media/public/${encodePathForUrl(publicDiskPath)}`;
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

  const publicMediaUrl = resolvePublicMediaUrl(raw);
  if (publicMediaUrl) return publicMediaUrl;

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
  if (!backendOrigin) return raw;

  if (cleaned.includes("/")) {
    return `${backendOrigin}/${cleaned}`;
  }

  // DB values like "avatar.jpg" are usually served from "/storage/avatar.jpg".
  return `${backendOrigin}/storage/${cleaned}`;
};

export const resolveUserAvatarWithFallback = (value, seed = "") =>
  resolveUserAvatarUrl(value) || resolveRandomAiAvatar(seed);
