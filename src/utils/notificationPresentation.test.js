import { describe, expect, it } from "vitest";
import {
  SYSTEM_NOTIFICATION_AVATAR,
  isSystemNotification,
  resolveNotificationAvatarUrl,
  resolveNotificationSenderName,
} from "./notificationPresentation.js";

describe("notification presentation", () => {
  it("uses the Orkelo identity for system notifications", () => {
    const notification = {
      sender_type: "system",
      is_system: true,
      actor: null,
      title: "Timer reminder",
    };

    expect(isSystemNotification(notification)).toBe(true);
    expect(resolveNotificationAvatarUrl(notification)).toBe(
      SYSTEM_NOTIFICATION_AVATAR,
    );
    expect(resolveNotificationSenderName(notification)).toBe("Orkelo");
  });

  it("keeps the actor identity for user notifications", () => {
    const notification = {
      sender_type: "user",
      is_system: false,
      actor: {
        name: "Reza",
        avatar: "/assets/images/profile-app/reza.jpg",
      },
    };

    expect(isSystemNotification(notification)).toBe(false);
    expect(resolveNotificationAvatarUrl(notification)).toBe(
      "/assets/images/profile-app/reza.jpg",
    );
    expect(resolveNotificationSenderName(notification)).toBe("Reza");
  });
});
