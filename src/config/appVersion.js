import packageJson from "../../package.json";

const FALLBACK_APP_VERSION = "v1.6.0";

export const RELEASE_SURFACES = Object.freeze({
  APP_UPDATE_MODAL: "appUpdateModal",
  PROJECT_BOARD_TOUR: "projectBoardTour",
  TASK_CHECKLIST_COPY_TOUR: "taskChecklistCopyTour",
});

export const normalizeAppVersion = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/^version\s*/i, "").trim();

  if (/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(normalized)) {
    return `v${normalized}`;
  }

  return normalized;
};

const resolvePackageAppVersion = () =>
  normalizeAppVersion(packageJson?.version) || FALLBACK_APP_VERSION;

// package.json is the single source of truth for release UI targeting.
export const APP_VERSION = resolvePackageAppVersion();

// Release-only UI belongs here so old modals and tours do not leak into newer deploys.
export const APP_RELEASE_SURFACES = Object.freeze({
  [RELEASE_SURFACES.APP_UPDATE_MODAL]: Object.freeze({
    version: "v1.6.0",
    enabled: true,
  }),
  [RELEASE_SURFACES.PROJECT_BOARD_TOUR]: Object.freeze({
    version: "v1.6.0",
    enabled: true,
  }),
  [RELEASE_SURFACES.TASK_CHECKLIST_COPY_TOUR]: Object.freeze({
    version: "v1.6.0",
    enabled: true,
  }),
});

export const getReleaseSurface = (surfaceKey) =>
  APP_RELEASE_SURFACES[surfaceKey] ?? null;

export const getReleaseSurfaceVersion = (surfaceKey) =>
  normalizeAppVersion(getReleaseSurface(surfaceKey)?.version);

export const doesVersionMatchApp = (targetVersion, appVersion = APP_VERSION) => {
  const normalizedAppVersion = normalizeAppVersion(appVersion);
  const targetVersions = Array.isArray(targetVersion)
    ? targetVersion
    : [targetVersion];

  return targetVersions.some(
    (version) => normalizeAppVersion(version) === normalizedAppVersion,
  );
};

export const isReleaseSurfaceEnabledForVersion = (
  surfaceKey,
  appVersion = APP_VERSION,
) => {
  const surface = getReleaseSurface(surfaceKey);

  return Boolean(
    surface?.enabled && doesVersionMatchApp(surface.version, appVersion),
  );
};
