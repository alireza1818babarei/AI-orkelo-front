import api from "./axios";

const unwrapData = (response, fallback = null) =>
  response?.data?.data ?? response?.data ?? fallback;

export const getCompanyWorkRoles = async () => {
  const response = await api.get("/companies/my/work-roles");
  const data = unwrapData(response, []);
  return Array.isArray(data) ? data : [];
};

export const getCompanyWorkRoleMembers = async () => {
  const response = await api.get("/companies/my/work-roles/members");
  const data = unwrapData(response, []);
  return Array.isArray(data) ? data : [];
};

export const createCompanyWorkRole = async (payload) => {
  const response = await api.post("/companies/my/work-roles", payload);
  return unwrapData(response, null);
};

export const updateCompanyWorkRole = async (workRoleId, payload) => {
  const response = await api.patch(`/companies/my/work-roles/${workRoleId}`, payload);
  return unwrapData(response, null);
};

export const deleteCompanyWorkRole = async (workRoleId) =>
  api.delete(`/companies/my/work-roles/${workRoleId}`);

export const reorderCompanyWorkRoles = async (orderedIds) => {
  const response = await api.patch("/companies/my/work-roles/reorder", {
    ordered_ids: orderedIds,
  });
  const data = unwrapData(response, []);
  return Array.isArray(data) ? data : [];
};

export const assignCompanyMemberWorkRole = async (userId, workRoleId) => {
  const response = await api.patch(`/companies/my/members/${userId}/work-role`, {
    work_role_id: workRoleId || null,
  });
  return unwrapData(response, null);
};
