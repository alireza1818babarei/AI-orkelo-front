import { resolveUserAvatarUrl } from "./mediaUrl.js";

export const SYSTEM_NOTIFICATION_AVATAR =
  "/assets/images/logo/orkelo-system-notification.jpg";

export const isSystemNotification = (notification) =>
  notification?.is_system === true ||
  String(notification?.sender_type ?? "").trim().toLowerCase() === "system";

export const resolveNotificationAvatarUrl = (notification) => {
  if (isSystemNotification(notification)) return SYSTEM_NOTIFICATION_AVATAR;

  return resolveUserAvatarUrl(notification?.actor?.avatar ?? "");
};

export const resolveNotificationSenderName = (notification) => {
  if (isSystemNotification(notification)) return "Orkelo";

  return (
    notification?.actor?.name ?? notification?.title ?? "Notification"
  );
};
