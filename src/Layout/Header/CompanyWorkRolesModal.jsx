import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import {
  assignCompanyMemberWorkRole,
  createCompanyWorkRole,
  deleteCompanyWorkRole,
  getCompanyWorkRoleMembers,
  getCompanyWorkRoles,
  reorderCompanyWorkRoles,
  updateCompanyWorkRole,
} from "../../api/workRoles";
import { resolveUserAvatarWithFallback } from "../../utils/mediaUrl";
import { alertConfirm, toastError, toastSuccess } from "../../utils/sweetAlert";
import "./CompanyWorkRolesModal.css";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.errors?.work_role?.[0] ||
  error?.response?.data?.errors?.name?.[0] ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export default function CompanyWorkRolesModal({ isOpen, onClose, companyId }) {
  const [tab, setTab] = useState("roles");
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const activeRoles = useMemo(
    () => roles.filter((role) => role?.is_active),
    [roles],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [roleItems, memberItems] = await Promise.all([
        getCompanyWorkRoles(),
        getCompanyWorkRoleMembers(),
      ]);
      setRoles(roleItems);
      setMembers(memberItems);
    } catch (error) {
      toastError(getErrorMessage(error, "Failed to load Work Roles"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setTab("roles");
    setEditingId(null);
    setNewRoleName("");
    loadData();
  }, [companyId, isOpen, loadData]);

  const syncUpdatedRole = useCallback((updatedRole) => {
    setRoles((current) => current.map((role) =>
      role.id === updatedRole.id ? updatedRole : role,
    ));
    setMembers((current) => current.map((member) =>
      member.work_role?.id === updatedRole.id
        ? { ...member, work_role: updatedRole }
        : member,
    ));
  }, []);

  const syncReorderedRoles = useCallback((reorderedRoles) => {
    const rolesById = new Map(
      reorderedRoles.map((role) => [role.id, role]),
    );

    setRoles(reorderedRoles);
    setMembers((current) => current.map((member) => {
      const updatedRole = rolesById.get(member.work_role?.id);
      return updatedRole ? { ...member, work_role: updatedRole } : member;
    }));
  }, []);

  const createRole = async (event) => {
    event.preventDefault();
    const name = newRoleName.trim();
    if (!name) return;
    try {
      setBusyKey("create");
      const role = await createCompanyWorkRole({ name, is_active: true });
      setRoles((current) => [...current, role]);
      setNewRoleName("");
      toastSuccess("Work Role created");
    } catch (error) {
      toastError(getErrorMessage(error, "Create Work Role failed"));
    } finally {
      setBusyKey("");
    }
  };

  const saveRoleName = async (role) => {
    const name = editingName.trim();
    if (!name || name === role.name) {
      setEditingId(null);
      return;
    }
    try {
      setBusyKey(`edit-${role.id}`);
      const updated = await updateCompanyWorkRole(role.id, { name });
      syncUpdatedRole(updated);
      setEditingId(null);
      toastSuccess("Work Role updated");
    } catch (error) {
      toastError(getErrorMessage(error, "Update Work Role failed"));
    } finally {
      setBusyKey("");
    }
  };

  const toggleRole = async (role) => {
    try {
      setBusyKey(`toggle-${role.id}`);
      const updated = await updateCompanyWorkRole(role.id, { is_active: !role.is_active });
      syncUpdatedRole(updated);
      toastSuccess(updated.is_active ? "Work Role activated" : "Work Role deactivated");
    } catch (error) {
      toastError(getErrorMessage(error, "Update Work Role failed"));
    } finally {
      setBusyKey("");
    }
  };

  const removeRole = async (role) => {
    const result = await alertConfirm({
      title: "Delete Work Role",
      text: `Delete “${role.name}”? Assigned roles must be removed from members first.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!result?.isConfirmed) return;
    try {
      setBusyKey(`delete-${role.id}`);
      await deleteCompanyWorkRole(role.id);
      setRoles((current) => current.filter((item) => item.id !== role.id));
      toastSuccess("Work Role deleted");
    } catch (error) {
      toastError(getErrorMessage(error, "Delete Work Role failed"));
    } finally {
      setBusyKey("");
    }
  };

  const moveRole = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= roles.length) return;
    const previous = roles;
    const next = [...roles];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setRoles(next);
    try {
      setBusyKey("reorder");
      const reorderedRoles = await reorderCompanyWorkRoles(
        next.map((role) => role.id),
      );
      syncReorderedRoles(reorderedRoles);
    } catch (error) {
      setRoles(previous);
      toastError(getErrorMessage(error, "Reorder Work Roles failed"));
    } finally {
      setBusyKey("");
    }
  };

  const assignMember = async (member, workRoleId) => {
    try {
      setBusyKey(`member-${member.id}`);
      const result = await assignCompanyMemberWorkRole(
        member.id,
        workRoleId ? Number(workRoleId) : null,
      );
      setMembers((current) => current.map((item) =>
        item.id === member.id ? { ...item, work_role: result?.work_role || null } : item,
      ));
      toastSuccess("Member Work Role updated");
    } catch (error) {
      toastError(getErrorMessage(error, "Assign Work Role failed"));
    } finally {
      setBusyKey("");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="lg" className="company-work-roles-modal">
      <ModalHeader toggle={onClose}>Company Work Roles</ModalHeader>
      <ModalBody>
        <p className="company-work-roles-modal__intro">
          Manage official company roles used by Super Task Work Items. Personal work passion remains unchanged.
        </p>
        <div className="company-work-roles-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "roles"}
            className={tab === "roles" ? "is-active" : ""}
            onClick={() => setTab("roles")}
          >
            <i className="ti ti-hierarchy-2" aria-hidden="true" />Set Roles
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "members"}
            className={tab === "members" ? "is-active" : ""}
            onClick={() => setTab("members")}
          >
            <i className="ti ti-users" aria-hidden="true" />Assign Roles
          </button>
        </div>

        {loading ? (
          <div className="company-work-roles-state"><Spinner color="primary" /><span>Loading Work Roles...</span></div>
        ) : tab === "roles" ? (
          <div className="company-work-roles-panel">
            <form className="company-work-role-create" onSubmit={createRole}>
              <input
                className="form-control"
                value={newRoleName}
                onChange={(event) => setNewRoleName(event.target.value)}
                placeholder="e.g. Designer, Developer, QA Test"
                aria-label="New Work Role name"
                maxLength={100}
              />
              <Button type="submit" color="primary" className="text-white" disabled={!newRoleName.trim() || Boolean(busyKey)}>
                {busyKey === "create" ? <Spinner size="sm" /> : <><i className="ti ti-plus me-2" />Add role</>}
              </Button>
            </form>
            <div className="company-work-role-list">
              {roles.length ? roles.map((role, index) => (
                <div key={role.id} className={`company-work-role-row ${role.is_active ? "" : "is-inactive"}`}>
                  <div className="company-work-role-row__order">
                    <button type="button" onClick={() => moveRole(index, -1)} disabled={index === 0 || Boolean(busyKey)} aria-label={`Move ${role.name} up`}><i className="ti ti-chevron-up" /></button>
                    <button type="button" onClick={() => moveRole(index, 1)} disabled={index === roles.length - 1 || Boolean(busyKey)} aria-label={`Move ${role.name} down`}><i className="ti ti-chevron-down" /></button>
                  </div>
                  <span className="company-work-role-row__position">{index + 1}</span>
                  <div className="company-work-role-row__name">
                    {editingId === role.id ? (
                      <input className="form-control form-control-sm" value={editingName} onChange={(event) => setEditingName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveRoleName(role); if (event.key === "Escape") setEditingId(null); }} aria-label={`Edit ${role.name}`} maxLength={100} autoFocus />
                    ) : (
                      <><strong>{role.name}</strong><small>{role.slug}</small></>
                    )}
                  </div>
                  <span className={`company-work-role-status ${role.is_active ? "is-active" : ""}`}>{role.is_active ? "Active" : "Inactive"}</span>
                  <div className="company-work-role-row__actions">
                    {editingId === role.id ? (
                      <button type="button" onClick={() => saveRoleName(role)} disabled={busyKey === `edit-${role.id}`} title="Save"><i className="ti ti-check" /></button>
                    ) : (
                      <button type="button" onClick={() => { setEditingId(role.id); setEditingName(role.name); }} disabled={Boolean(busyKey)} title="Edit"><i className="ti ti-edit" /></button>
                    )}
                    <button type="button" onClick={() => toggleRole(role)} disabled={Boolean(busyKey)} title={role.is_active ? "Deactivate" : "Activate"}><i className={role.is_active ? "ti ti-toggle-right" : "ti ti-toggle-left"} /></button>
                    <button type="button" className="is-danger" onClick={() => removeRole(role)} disabled={Boolean(busyKey)} title="Delete"><i className="ti ti-trash" /></button>
                  </div>
                </div>
              )) : <div className="company-work-roles-state">No Work Roles have been created yet.</div>}
            </div>
          </div>
        ) : (
          <div className="company-work-role-members">
            {members.length ? members.map((member) => (
              <div key={member.id} className="company-work-role-member-row">
                <span className="company-work-role-member-row__avatar">
                  <img src={resolveUserAvatarWithFallback(member.avatar, member.id || member.email)} alt="" />
                </span>
                <div><strong>{member.name}</strong><small>{member.email}</small></div>
                <select className="form-select form-select-sm" value={member.work_role?.id || ""} onChange={(event) => assignMember(member, event.target.value)} disabled={Boolean(busyKey)} aria-label={`Work Role for ${member.name}`}>
                  <option value="">No Work Role</option>
                  {member.work_role && !member.work_role.is_active ? (
                    <option value={member.work_role.id} disabled>{member.work_role.name} (inactive)</option>
                  ) : null}
                  {activeRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>
            )) : <div className="company-work-roles-state">No company members are available.</div>}
          </div>
        )}
      </ModalBody>
      <ModalFooter><Button color="secondary" onClick={onClose}>Close</Button></ModalFooter>
    </Modal>
  );
}
