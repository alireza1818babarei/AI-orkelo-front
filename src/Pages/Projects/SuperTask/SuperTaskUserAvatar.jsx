import React, { useEffect, useState } from "react";
import {
  resolveUserAvatarUrl,
  resolveUserAvatarWithFallback,
} from "../../../utils/mediaUrl";

const getAvatar = (user, useGeneratedFallback) =>
  useGeneratedFallback
    ? resolveUserAvatarWithFallback(
        user?.avatar || "",
        user?.id ?? user?.email ?? user?.name ?? "super-task-user",
      )
    : resolveUserAvatarUrl(user?.avatar || "");

const getInitials = (user) => {
  const label = String(user?.name || user?.email || "?").trim();
  const parts = label.split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts.at(-1).charAt(0)}`.toUpperCase();
};

export default function SuperTaskUserAvatar({
  user,
  size = 34,
  title = "",
  useGeneratedFallback = true,
}) {
  const avatar = getAvatar(user, useGeneratedFallback);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  if (!user) return null;

  const initials = getInitials(user);

  return (
    <span
      className="super-task-avatar"
      style={{ width: size, height: size }}
      title={title || user.name || user.email || ""}
    >
      {!imageFailed && avatar ? (
        <img src={avatar} alt="" onError={() => setImageFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
