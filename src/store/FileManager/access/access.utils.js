const normalizeRole = (role) => String(role ?? '').trim().toLowerCase();

const normalizeId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
};

export const normalizeAccessMember = (member) => ({
  id: normalizeId(member?.id),
  name: String(member?.name ?? '').trim(),
  email: String(member?.email ?? '').trim(),
  avatar: member?.avatar ?? null,
  role: normalizeRole(member?.role),
  status: String(member?.status ?? '').trim().toLowerCase(),
  hasFileManagementAccess: Boolean(
    member?.has_finance_center_access ?? member?.has_file_management_access,
  ),
});

export const normalizeFileManagementAccessPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root ?? {};

  return {
    companyId: normalizeId(data?.company_id ?? null),
    selectedUserIds: Array.isArray(data?.selected_user_ids)
      ? data.selected_user_ids.map(normalizeId).filter(Boolean)
      : [],
    members: Array.isArray(data?.members)
      ? data.members.map(normalizeAccessMember)
      : [],
  };
};

export const normalizeFileManagementAccessUpdatePayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root ?? {};

  return {
    companyId: normalizeId(data?.company_id ?? null),
    selectedUserIds: Array.isArray(data?.selected_user_ids)
      ? data.selected_user_ids.map(normalizeId).filter(Boolean)
      : [],
  };
};

