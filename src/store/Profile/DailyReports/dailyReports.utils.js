const normalizeProject = (project) => {
  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
  };
};

const normalizeUploader = (uploader) => {
  if (!uploader) return null;

  return {
    id: uploader.id,
    name: uploader.name,
    email: uploader.email,
    avatar: uploader.avatar,
  };
};

export const normalizeReport = (report) => {
  if (!report) return null;

  return {
    id: report.id,
    companyId: report.company_id,
    projectId: report.project_id,
    uploadedBy: report.uploaded_by,
    originalName: report.original_name,
    description: report.description || '',
    mime: report.mime,
    size: report.size,
    downloadUrl: report.download_url,
    canEdit: report.can_edit,
    project: normalizeProject(report.project),
    uploader: normalizeUploader(report.uploader),
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  };
};

export const normalizeDailyReportsResponse = (payload = {}) => {
  const rawItems = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta ?? {};

  return {
    items: rawItems.map(normalizeReport).filter(Boolean),
    meta: {
      currentPage: Number(meta?.current_page ?? payload?.current_page ?? 1),
      lastPage: Number(meta?.last_page ?? payload?.last_page ?? 1),
      perPage: Number(meta?.per_page ?? payload?.per_page ?? (rawItems.length || 10)),
      total: Number(meta?.total ?? payload?.total ?? rawItems.length),
    },
  };
};

export const getInitialState = () => ({
  uploadLoading: false,
  reportsLoading: false,
  successMessage: null,
  dailyReportsItems: [],
  meta: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  },
  error: null,
});
