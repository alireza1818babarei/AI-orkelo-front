import { useEffect, useMemo, useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getActiveAppUpdateForVersion } from "../../Data/appUpdates";
import { APP_VERSION } from "../../config/appVersion";

const UPDATE_READ_STORAGE_PREFIX = "orkelo_app_update_read";

const normalizeUpdateId = (value) => String(value || "").trim();

const buildReadStorageKey = (userId, updateId) =>
  `${UPDATE_READ_STORAGE_PREFIX}:${userId || "guest"}:${updateId}`;

const normalizePathname = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw === "/") return "/";
  return raw.replace(/\/+$/, "") || "/";
};

const clearOldUpdateReadKeys = (userId, currentUpdateId) => {
  if (typeof window === "undefined") return;

  const normalizedUserId = String(userId || "guest");
  const currentKey = buildReadStorageKey(normalizedUserId, currentUpdateId);
  const userPrefix = `${UPDATE_READ_STORAGE_PREFIX}:${normalizedUserId}:`;

  Object.keys(window.localStorage).forEach((key) => {
    if (!key.startsWith(userPrefix)) return;
    if (key === currentKey) return;

    window.localStorage.removeItem(key);
  });
};

const AppUpdateModal = () => {
  const { user } = useSelector((state) => state.auth || {});
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const latestUpdate = useMemo(
    () => getActiveAppUpdateForVersion(APP_VERSION),
    [],
  );
  const updateId = normalizeUpdateId(latestUpdate?.version || latestUpdate?.id);
  const userId = String(user?.id ?? "guest");
  const normalizedPathname = normalizePathname(location?.pathname);
  const shouldShowOnThisPage = !!user?.id && normalizedPathname === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!updateId || !shouldShowOnThisPage) {
      setOpen(false);
      return;
    }

    clearOldUpdateReadKeys(userId, updateId);

    const storageKey = buildReadStorageKey(userId, updateId);
    const alreadyRead = window.localStorage.getItem(storageKey) === "1";
    setOpen(!alreadyRead);
  }, [updateId, userId, shouldShowOnThisPage]);

  const markAsRead = () => {
    if (typeof window !== "undefined" && updateId) {
      clearOldUpdateReadKeys(userId, updateId);

      const storageKey = buildReadStorageKey(userId, updateId);
      window.localStorage.setItem(storageKey, "1");
    }

    setOpen(false);
  };

  if (!latestUpdate || !updateId || !shouldShowOnThisPage) return null;

  const newFeatures = Array.isArray(latestUpdate.newFeatures)
    ? latestUpdate.newFeatures
    : [];
  const featuredNewFeature = newFeatures[0] ?? null;

  const closeForNow = () => {
    setOpen(false);
  };

  return (
    <Modal
      isOpen={open}
      toggle={closeForNow}
      centered
      size="xl"
      scrollable
      contentClassName="app-update-modal"
    >
      <ModalBody className="p-0">
        <div className="app-update-modal__layout">
          <section className="app-update-modal__hero">
            <button
              type="button"
              className="app-update-modal__dismiss"
              onClick={closeForNow}
              aria-label="Close update modal"
            >
              <i className="ph-bold ph-x" aria-hidden="true" />
            </button>

            <div className="app-update-modal__eyebrow">
              <span className="app-update-modal__eyebrow-icon">
                <i className="ph-duotone ph-rocket-launch" aria-hidden="true" />
              </span>
              <span>{latestUpdate.version || "Update"}</span>
            </div>

            <div className="app-update-modal__headline-wrap">
              <div className="app-update-modal__headline-icon">
                <i className="ph-duotone ph-sparkle" aria-hidden="true" />
              </div>
              <div>
                <h2 className="app-update-modal__title">
                  {latestUpdate.title || "New Update"}
                </h2>
                {latestUpdate.releasedAt ? (
                  <div className="app-update-modal__date">
                    Released on {latestUpdate.releasedAt}
                  </div>
                ) : null}
              </div>
            </div>

            {latestUpdate.summary ? (
              <p className="app-update-modal__summary">
                {latestUpdate.summary}
              </p>
            ) : null}

            {featuredNewFeature ? (
              <div className="app-update-modal__feature-spotlight">
                <div className="app-update-modal__feature-spotlight-head">
                  <div className="app-update-modal__feature-kicker">
                    <span className="app-update-modal__feature-kicker-icon">
                      <i className="ph-duotone ph-stars-three" aria-hidden="true" />
                    </span>
                    <span>Main Update</span>
                  </div>
                  <span className="app-update-modal__feature-pill">Available Now</span>
                </div>

                <div className="app-update-modal__feature-spotlight-body">
                  <div className="app-update-modal__feature-spotlight-icon">
                    <i
                      className={String(
                        featuredNewFeature?.icon || "ph-duotone ph-megaphone-simple",
                      ).trim()}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="app-update-modal__feature-spotlight-content">
                    <h3 className="app-update-modal__feature-spotlight-title">
                      {String(featuredNewFeature?.title || "New Feature").trim()}
                    </h3>
                    {featuredNewFeature?.description ? (
                      <p className="app-update-modal__feature-spotlight-description">
                        {String(featuredNewFeature.description).trim()}
                      </p>
                    ) : null}
                  </div>
                </div>

              </div>
            ) : null}

            <div className="app-update-modal__actions">
              <Button color="light" className="app-update-modal__later" onClick={closeForNow}>
                Later
              </Button>
              <Button color="dark" className="app-update-modal__read" onClick={markAsRead}>
                <i className="ph-bold ph-check-circle me-2" aria-hidden="true" />
                Read And Continue
              </Button>
            </div>
          </section>

          <section className="app-update-modal__details">
            {newFeatures.length ? (
              <div className="app-update-modal__panel app-update-modal__panel--main">
                <div className="app-update-modal__panel-head">
                  <span className="app-update-modal__panel-badge text-primary bg-primary-subtle">
                    <i className="ph-duotone ph-sparkle" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="app-update-modal__panel-title">What's New</div>
                    <div className="app-update-modal__panel-subtitle">
                      Key changes now available in Orkelo
                    </div>
                  </div>
                </div>

                <ul className="app-update-modal__list">
                  {newFeatures.map((feature, index) => {
                    const title = String(feature?.title || `Feature ${index + 1}`).trim();
                    const description = String(feature?.description || "").trim();
                    const icon = String(
                      feature?.icon || "ph-duotone ph-check-circle",
                    ).trim();
                    const featureKey = `${title}-${index}`;

                    return (
                      <li key={featureKey} className="app-update-modal__list-item">
                        <span className="app-update-modal__list-icon text-primary">
                          <i className={icon} aria-hidden="true" />
                        </span>
                        <span className="app-update-modal__list-copy">
                          <strong className="app-update-modal__list-title">
                            {title}
                          </strong>
                          {description ? (
                            <span className="app-update-modal__list-description">
                              {description}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AppUpdateModal;
