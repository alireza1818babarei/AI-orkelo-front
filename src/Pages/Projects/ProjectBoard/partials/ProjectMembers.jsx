import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledDropdown,
} from 'reactstrap';
import { resolveUserAvatarWithFallback } from '../../../../utils/mediaUrl.js';

const resolveInitials = (member) => {
  if (member?.initials) return member.initials;
  const name = String(member?.name || '').trim();
  if (!name) return 'NA';
  const parts = name.split(/\s+/).slice(0, 2);
  return parts.map((item) => item[0]?.toUpperCase() || '').join('') || 'NA';
};

const normalizeRole = (role) =>
  String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const PROJECT_ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'project_manager', label: 'Project Manager' },
];

const COMPANY_ROLE_LABELS = {
  company_owner: 'Owner',
  company_supervisor: 'Supervisor',
};

const formatProjectRole = (role) => {
  switch (normalizeRole(role)) {
    case 'project_manager':
      return 'Project Manager';
    default:
      return '';
  }
};

const resolveDisplayRole = (companyRole, projectRole) => {
  // Company-level roles outrank project roles in the sidebar display.
  const companyRoleLabel = COMPANY_ROLE_LABELS[normalizeRole(companyRole)];
  if (companyRoleLabel) return companyRoleLabel;

  return formatProjectRole(projectRole);
};

const resolveRemovalRole = (companyRole, projectRole) => {
  const normalizedCompanyRole = normalizeRole(companyRole);

  if (normalizedCompanyRole === 'company_owner') return 'company_owner';
  if (normalizedCompanyRole === 'company_supervisor') {
    return 'company_supervisor';
  }

  return normalizeRole(projectRole) === 'project_manager'
    ? 'project_manager'
    : 'member';
};

const canRemoveProjectMember = (actorCompanyRole, actorProjectRole, member) => {
  // Keep the UI aligned with the backend ProjectAccess::canRemoveMember rules.
  if (!member?.hasRemovalRoleData) return false;

  const actorRole = resolveRemovalRole(actorCompanyRole, actorProjectRole);
  const targetRole = resolveRemovalRole(member.companyRole, member.projectRole);

  switch (actorRole) {
    case 'company_owner':
      return true;
    case 'company_supervisor':
      return targetRole !== 'company_owner';
    case 'project_manager':
      return ['member', 'project_manager'].includes(targetRole);
    default:
      return false;
  }
};

const resolveValidProjectRole = (role) => {
  const normalized = normalizeRole(role);
  return PROJECT_ROLE_OPTIONS.some((option) => option.value === normalized)
    ? normalized
    : 'member';
};

const normalizeMembers = (members) =>
  (Array.isArray(members) ? members : []).map((member, index) => {
    const src = member ?? {};
    const name = src?.name ?? '';
    const avatarRaw = src?.avatar ?? '';
    const rawProjectRole = src?.project_role ?? src?.projectRole ?? src?.role;
    const rawCompanyRole = src?.company_role ?? src?.companyRole ?? src?.user_type;
    const projectRole =
      normalizeRole(rawProjectRole) || 'member';
    const companyRole = normalizeRole(rawCompanyRole);

    return {
      id: src?.id ?? `member-${index + 1}`,
      removeId: src?.id ?? null,
      name,
      projectRole,
      companyRole,
      displayRole: resolveDisplayRole(companyRole, projectRole),
      hasRemovalRoleData: rawProjectRole != null && rawCompanyRole != null,
      avatar: resolveUserAvatarWithFallback(
        avatarRaw,
        src?.id ?? src?.email ?? name,
      ),
      initials: resolveInitials({
        initials: src?.initials,
        name,
      }),
    };
  });

const ProjectMembers = ({
  members = [],
  loading = false,
  onAddMember,
  onDeleteMember,
  onUpdateMemberRole,
  removingByMemberId = {},
  roleUpdatingByMemberId = {},
  collapsed = false,
}) => {
  const data = useMemo(() => normalizeMembers(members), [members]);
  const [roleModalMember, setRoleModalMember] = useState(null);
  const [roleModalValue, setRoleModalValue] = useState('member');
  const user = useSelector((s) => s.auth?.user ?? null);
  const activeCompanyRole = useSelector(
    (s) => s.companyContext?.activeCompany?.membership?.role ?? null,
  );
  const companyRole = normalizeRole(
    activeCompanyRole ?? user?.company_role ?? user?.user_type,
  );
  const currentUserId = String(user?.id ?? '');
  const currentProjectMember = useMemo(
    () => data.find((member) => String(member.id) === currentUserId) ?? null,
    [data, currentUserId],
  );
  const actorProjectRole = currentProjectMember?.projectRole ?? 'member';
  const hasProjectManagerRole = Array.isArray(user?.project_roles)
    ? user.project_roles.some(
        (item) => normalizeRole(item?.role) === 'project_manager',
      )
    : false;
  const canAddProjectMember =
    companyRole === 'company_owner' ||
    companyRole === 'company_supervisor' ||
    hasProjectManagerRole;
  const canManageProjectRoles =
    companyRole === 'company_owner' || companyRole === 'company_supervisor';

  const handleRoleChange = async (member, nextRole) => {
    if (!nextRole || nextRole === member.projectRole) return;
    return onUpdateMemberRole?.(member, nextRole);
  };

  const openRoleModal = (member) => {
    setRoleModalMember(member);
    setRoleModalValue(resolveValidProjectRole(member?.projectRole));
  };

  const closeRoleModal = () => {
    setRoleModalMember(null);
    setRoleModalValue('member');
  };

  const activeRoleMemberId = String(roleModalMember?.removeId ?? '');
  const roleModalUpdating = !!roleUpdatingByMemberId[activeRoleMemberId];

  const submitRoleChange = async () => {
    if (!roleModalMember) return;

    const result = await handleRoleChange(roleModalMember, roleModalValue);
    if (result === false) return;

    closeRoleModal();
  };

  return (
    <aside
      className={`project-members-panel mt-1  ${collapsed ? 'is-collapsed' : ''}`}
    >
      <div className='project-members-panel__inner'>
        {canAddProjectMember ? (
          <div className='project-members-panel__head'>
            <button
              type='button'
              className='project-members-panel__add-btn'
              aria-label='Add user'
              onClick={onAddMember}
            >
              <i className='ph ph-user-plus' />
            </button>
          </div>
        ) : null}

        <div className='project-members-panel__list app-scroll'>
          {loading ? (
            <div className='project-members-panel__loading'>
              <iconify-icon icon='line-md:loading-loop' />
            </div>
          ) : (
            data.map((member) => {
              const canRemoveMember = canRemoveProjectMember(
                companyRole,
                actorProjectRole,
                member,
              );

              return (
                <div key={member.id} className='project-members-panel__item'>
                  {member.removeId && canRemoveMember ? (
                    <UncontrolledDropdown className='project-members-panel__actions'>
                      <DropdownToggle
                        tag='button'
                        type='button'
                        className='project-members-panel__actions-toggle'
                        aria-label={`Open actions for ${member.name || 'member'}`}
                      >
                        <i className='ph-bold ph-dots-three-vertical' />
                      </DropdownToggle>
                      <DropdownMenu className='project-members-panel__actions-menu'>
                        {canManageProjectRoles ? (
                          <>
                            <DropdownItem
                              type='button'
                              onClick={() => openRoleModal(member)}
                            >
                              <i className='ph ph-user-switch' />
                              <span>Set role</span>
                            </DropdownItem>
                            <DropdownItem divider />
                          </>
                        ) : null}
                        <DropdownItem
                          type='button'
                          className='text-danger'
                          disabled={!!removingByMemberId[String(member.removeId)]}
                          onClick={() => onDeleteMember?.(member)}
                        >
                          {removingByMemberId[String(member.removeId)] ? (
                            <iconify-icon icon='line-md:loading-loop' />
                          ) : (
                            <i className='ph ph-trash' />
                          )}
                          <span>Remove</span>
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  ) : null}
                  <div className='project-members-panel__avatar'>
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <span>{member.initials}</span>
                    )}
                  </div>
                  <h6 className='project-members-panel__name'>{member.name}</h6>
                  {member.displayRole ? (
                    <span className='project-members-panel__role-badge'>
                      {member.displayRole}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={!!roleModalMember} toggle={closeRoleModal} centered>
        <ModalHeader toggle={closeRoleModal}>Set Project Role</ModalHeader>
        <ModalBody>
          <div className='project-member-role-modal'>
            <div className='project-member-role-modal__member'>
              <div className='project-member-role-modal__avatar'>
                {roleModalMember?.avatar ? (
                  <img
                    src={roleModalMember.avatar}
                    alt={roleModalMember?.name || 'member'}
                  />
                ) : (
                  <span>{roleModalMember?.initials || 'NA'}</span>
                )}
              </div>
              <div>
                <h6>{roleModalMember?.name || 'Member'}</h6>
                <p>Choose this member's role in the project.</p>
              </div>
            </div>

            <label className='project-member-role-modal__label'>
              Project role
            </label>
            <select
              className='project-member-role-modal__select'
              value={roleModalValue}
              disabled={roleModalUpdating}
              onChange={(event) => setRoleModalValue(event.target.value)}
            >
              {PROJECT_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='light' onClick={closeRoleModal} disabled={roleModalUpdating}>
            Cancel
          </Button>
          <Button
            color='primary'
            onClick={submitRoleChange}
            disabled={roleModalUpdating}
          >
            {roleModalUpdating ? 'Saving...' : 'Save role'}
          </Button>
        </ModalFooter>
      </Modal>
    </aside>
  );
};

export default ProjectMembers;
