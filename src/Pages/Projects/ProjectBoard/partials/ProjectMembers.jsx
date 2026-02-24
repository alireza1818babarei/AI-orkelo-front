import React, { useMemo } from "react";
import { resolveUserAvatarUrl } from "../../../../utils/mediaUrl.js";

const resolveInitials = (member) => {
  if (member?.initials) return member.initials;
  const name = String(member?.name || "").trim();
  if (!name) return "NA";
  const parts = name.split(/\s+/).slice(0, 2);
  return parts.map((item) => item[0]?.toUpperCase() || "").join("") || "NA";
};

const normalizeMembers = (members) =>
  (Array.isArray(members) ? members : []).map((member, index) => {
    const user =
      member?.user && typeof member.user === "object" ? member.user : null;
    const name =
      user?.name ??
      user?.full_name ??
      member?.name ??
      member?.full_name ??
      "";
    const avatarRaw =
      user?.avatar ??
      user?.avatar_url ??
      user?.image ??
      user?.image_url ??
      user?.profile_photo_url ??
      member?.avatar ??
      member?.avatar_url ??
      member?.image ??
      member?.image_url ??
      member?.profile_photo_url ??
      "";

    return {
      id: member?.id ?? member?.user_id ?? user?.id ?? `member-${index + 1}`,
      removeId:
        member?.member_id ??
        member?.membership_id ??
        member?.id ??
        member?.user_id ??
        user?.id ??
        null,
      name,
      avatar: resolveUserAvatarUrl(avatarRaw),
      initials: resolveInitials({
        initials: user?.initials ?? member?.initials,
        name,
      }),
    };
  });

const ProjectMembers = ({
  members = [],
  loading = false,
  onAddMember,
  onDeleteMember,
  removingByMemberId = {},
  collapsed = false,
}) => {
  const data = useMemo(() => normalizeMembers(members), [members]);

  return (
    <aside className={`project-members-panel mt-1  ${collapsed ? "is-collapsed" : ""}`}>
      <div className="project-members-panel__inner">
        <div className="project-members-panel__head">
          <button
            type="button"
            className="project-members-panel__add-btn"
            aria-label="Add user"
            onClick={onAddMember}
          >
            <i className="ph ph-user-plus" />
          </button>
        </div>

        <div className="project-members-panel__list app-scroll">
          {loading ? (
            <div className="project-members-panel__loading">
              <iconify-icon icon="line-md:loading-loop" />
            </div>
          ) : (
            data.map((member) => (
              <div key={member.id} className="project-members-panel__item">
                {member.removeId ? (
                  <button
                    type="button"
                    className="project-members-panel__delete"
                    onClick={() => onDeleteMember?.(member)}
                    disabled={!!removingByMemberId[String(member.removeId)]}
                    aria-label={`Remove ${member.name || "member"}`}
                  >
                    {removingByMemberId[String(member.removeId)] ? (
                      <iconify-icon icon="line-md:loading-loop" />
                    ) : (
                      <i className="ph ph-trash" />
                    )}
                  </button>
                ) : null}
                <div className="project-members-panel__avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <span>{member.initials}</span>
                  )}
                </div>
                <h6 className="project-members-panel__name">{member.name}</h6>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default ProjectMembers;
