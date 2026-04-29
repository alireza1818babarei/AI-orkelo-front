export const normalizedProjectReport = (reports = []) => {
  if (!reports) return null;
  return reports.map((report) => ({
    id: report.id,
    companyId: report.company_id,
    createdAt: report.created_at,
    downloadUrl: report.download_url,
    reportName: report.original_name,
    description: report.description || '',
    projectName: report.project?.name || '-',
    reportSize: report.size,
    uploaderName: report.uploader?.name || '-',
    uploaderAvatar: report.uploader?.avatar || null,
    canEdit: report.can_edit
  }));
};
