import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteProjectThunk,
  getProjectDetailsThunk,
  updateProjectThunk,
} from "../../../store/projects/projectDetailsSlice";
import {
  createProjectColumnThunk,
  getColumnTasksThunk,
  createProjectTaskThunk,
  deleteProjectColumnThunk,
  getProjectColumnsThunk,
  reorderProjectColumnsLocal,
  reorderProjectColumnsThunk,
  reorderProjectTasksLocal,
  reorderProjectTaskThunk,
  removeTaskFromColumn,
  updateProjectColumnThunk,
} from "../../../store/projects/projectColumnsSlice";
import {
  addProjectMemberThunk,
  deleteProjectMemberThunk,
  getProjectMembersThunk,
} from "../../../store/projects/projectMembersSlice";
import { getCompanyMembersThunk } from "../../../store/company/companyMembersSlice";

import ProjectDetailsModal from "../../../Components/projectDetailModal";
import TaskDetailModal from "../../../Components/taskDetailModal";
import {
  alertConfirm,
  alertSuccess,
  toastError,
  toastInfo,
  toastSuccess,
} from "../../../utils/sweetAlert";
import ProjectBoardHeader from "./partials/ProjectBoardHeader";
import ProjectEditModal from "./partials/ProjectEditModal";
import ProjectBoardColumns from "./partials/ProjectBoardColumns";
import ProjectColumnModal from "./partials/ProjectColumnModal";
import ProjectMembers from "./partials/ProjectMembers";
import ProjectAddMemberModal from "./partials/ProjectAddMemberModal";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  PROJECT_VISIBILITY,
  updateProjectSchema,
} from "../../../validation/project/updateProject.schema";

const PROJECT_STATUS = ["active", "deactive"];

const normalizeVisibilityValue = (value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "private" || normalized === "public") return normalized;
    if (["1", "true", "yes", "on"].includes(normalized)) return "private";
    if (["0", "false", "no", "off"].includes(normalized)) return "public";
    return null;
  }

  if (typeof value === "boolean") return value ? "private" : "public";
  if (typeof value === "number") return value === 1 ? "private" : "public";
  return null;
};

const resolveProjectVisibility = (project) => {
  if (!project || typeof project !== "object") return PROJECT_VISIBILITY[0];

  const candidates = [
    project.visibility,
    project.is_private,
    project.isPrivate,
    project.private,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeVisibilityValue(candidate);
    if (normalized) return normalized;
  }

  return PROJECT_VISIBILITY[0];
};

const toSortableColumnPosition = (column) => {
  const n = Number(column?.position);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

const sortColumnsByPosition = (columns) => {
  const next = Array.isArray(columns) ? [...columns] : [];
  return next.sort((a, b) => {
    const posDiff = toSortableColumnPosition(a) - toSortableColumnPosition(b);
    if (posDiff !== 0) return posDiff;

    const aId = Number(a?.id);
    const bId = Number(b?.id);
    if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;

    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });
};

const ProjectBoard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigat = useNavigate();
  const tasksForcedProjectRef = useRef(null);
  const lastRouteProjectIdRef = useRef(id);
  const routeSwitched =
    lastRouteProjectIdRef.current != null &&
    id != null &&
    String(lastRouteProjectIdRef.current) !== String(id);
  lastRouteProjectIdRef.current = id;

  const [infoOpen, setInfoOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [taskInfoOpen, setTaskInfoOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [removedTaskIds, setRemovedTaskIds] = useState([]);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [membersPanelCollapsed, setMembersPanelCollapsed] = useState(false);

  const { data, error, loading } = useSelector((s) => s.projectDetails);
  const pageError = routeSwitched ? null : error;
  const projectsList = useSelector((s) => s.projects?.items ?? []);
  const {
    items: projectColumns,
    status: columnsStatus,
    projectId: columnsProjectId,
    tasksLoadingByColumnId,
  } = useSelector((s) => s.projectColumns);
  const {
    items: projectMembers,
    projectId: membersProjectId,
    status: membersStatus,
    addingByEmail: projectMemberAddingByEmail,
    removingByMemberId: projectMemberRemovingByMemberId,
  } = useSelector((s) => s.projectMembers);
  const {
    items: companyMembers,
    status: companyMembersStatus,
    error: companyMembersError,
  } = useSelector((s) => s.companyMembers || {});

  const fromList = useMemo(() => {
    const numId = Number(id);
    return projectsList.find((p) => p.id === numId) || null;
  }, [projectsList, id]);

  const detailsPayload = useMemo(() => data?.data ?? data ?? null, [data]);
  const projectFromDetails = useMemo(() => {
    const d = detailsPayload;
    return d?.project || (d?.name ? d : null) || null;
  }, [detailsPayload]);
  const detailsProjectId = projectFromDetails?.id ?? detailsPayload?.id ?? null;
  const detailsMatch =
    detailsProjectId != null &&
    id != null &&
    String(detailsProjectId) === String(id);

  const project = (detailsMatch ? projectFromDetails : null) || fromList;
  const detailsMembers = detailsMatch ? detailsPayload?.members || [] : [];
  const membersFromSlice =
    membersProjectId && String(membersProjectId) === String(id)
      ? projectMembers
      : [];
  const members = membersFromSlice.length ? membersFromSlice : detailsMembers;
  const membersLoading =
    membersStatus === "loading" &&
    membersProjectId != null &&
    String(membersProjectId) === String(id);
  const columnsFromSlice =
    columnsProjectId && String(columnsProjectId) === String(id)
      ? projectColumns
      : null;
  const columnsFromDetails = detailsMatch
    ? detailsPayload?.columns || projectFromDetails?.columns || []
    : [];
  const columnsFromList = fromList?.columns || [];

  const baseColumns = columnsFromDetails.length
    ? columnsFromDetails
    : columnsFromList;

  const columns = useMemo(() => {
    if (!columnsFromSlice?.length) {
      return sortColumnsByPosition(baseColumns || []);
    }

    const removedSet = new Set(removedTaskIds.map(String));
    const baseMap = new Map(
      (baseColumns || []).map((c) => [String(c.id), c]),
    );

    return sortColumnsByPosition(
      columnsFromSlice.map((c) => {
        const base = baseMap.get(String(c.id));
        const next = { ...base, ...c };
        const baseTasks = Array.isArray(base?.tasks) ? base.tasks : null;
        const sliceTasks = Array.isArray(c?.tasks) ? c.tasks : null;
        const getTaskKey = (t) =>
          String(t?.id ?? t?.task_id ?? t?.uuid ?? t?.text ?? "");

        if (sliceTasks) {
          const baseByKey = new Map((baseTasks || []).map((t) => [getTaskKey(t), t]));
          next.tasks = sliceTasks
            .map((t) => {
              const key = getTaskKey(t);
              const baseTask = baseByKey.get(key);
              return baseTask ? { ...baseTask, ...t } : t;
            })
            .filter((t) => !removedSet.has(String(t.id ?? t.task_id ?? t.uuid)));
        } else if (baseTasks) {
          next.tasks = baseTasks.filter(
            (t) => !removedSet.has(String(t.id ?? t.task_id ?? t.uuid)),
          );
        }
        return next;
      }),
    );
  }, [columnsFromSlice, baseColumns, removedTaskIds]);

  useEffect(() => {
    if (!id) return;
    dispatch(getProjectDetailsThunk(id));
    dispatch(getProjectColumnsThunk(id));
    dispatch(getProjectMembersThunk(id));
  }, [dispatch, id]);

  useEffect(() => {
    setInfoOpen(false);
    setEditModal(false);
    setColumnModalOpen(false);
    setEditingColumn(null);
    setTaskInfoOpen(false);
    setActiveTask(null);
    setRemovedTaskIds([]);
    setAddMemberModalOpen(false);
    setMembersPanelCollapsed(false);
  }, [id]);

  const columnIdsKey = useMemo(() => {
    if (!columnsProjectId || String(columnsProjectId) !== String(id)) return "";
    const ids = (projectColumns || [])
      .map((c) => c?.id)
      .filter((v) => v != null)
      .map(String)
      .sort();
    return ids.join("|");
  }, [columnsProjectId, id, projectColumns]);

  useEffect(() => {
    if (!id) return;
    if (!columnsProjectId || String(columnsProjectId) !== String(id)) return;
    if (!columnIdsKey) return;

    const ids = columnIdsKey.split("|").filter(Boolean);
    const shouldForce = String(tasksForcedProjectRef.current) !== String(id);
    ids.forEach((columnId) => {
      dispatch(
        getColumnTasksThunk({ projectId: id, columnId, force: shouldForce }),
      );
    });
    if (shouldForce) tasksForcedProjectRef.current = String(id);
  }, [dispatch, id, columnsProjectId, columnIdsKey]);

  const tasksPending =
    tasksLoadingByColumnId && Object.keys(tasksLoadingByColumnId).length > 0;
  const tasksNeedLoad =
    columnsProjectId && String(columnsProjectId) === String(id)
      ? (projectColumns || []).some((c) => c?.tasks == null)
      : false;
  const tasksLoading = tasksPending || tasksNeedLoad;

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(updateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      visibility: PROJECT_VISIBILITY[0],
      image: null,
    },
  });

  const { ref: nameRef, ...nameField } = register("name");
  const { ref: statusRef, ...statusField } = register("status");
  const { ref: descriptionRef, ...descriptionField } =
    register("description");

  useEffect(() => {
    register("visibility");
  }, [register]);

  const {
    handleSubmit: handleColumnSubmit,
    register: registerColumn,
    reset: resetColumn,
    setValue: setColumnValue,
    watch: watchColumn,
    formState: { errors: columnErrors, isSubmitting: isColumnSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      color: "#3B82F6",
      icon: "list",
    },
  });

  const { ref: titleRef, ...titleField } = registerColumn("title", {
    required: "Title is required",
  });
  const { ref: colorRef, ...colorField } = registerColumn("color");
  const { ref: iconRef, ...iconField } = registerColumn("icon");
  const currentColumnIcon = watchColumn("icon");


  const buildFormValues = (p) => ({
    name: p?.name || "",
    description: p?.description || "",
    status: p?.status || "active",
    visibility: resolveProjectVisibility(p),
    image: null,
  });

  const resolveProjectFromPayload = (payload) => {
    const d = payload?.data ?? payload ?? null;
    return d?.project || (d?.name ? d : null) || null;
  };

  useEffect(() => {
    if (!editModal) return;
    if (!project) return;
    reset(buildFormValues(project));
  }, [editModal, project, reset]);

  const openEditModal = async () => {
    setEditModal(true);
    if (project) {
      reset(buildFormValues(project));
    }
    if (!id) return;

    try {
      const res = await dispatch(getProjectDetailsThunk(id)).unwrap();
      const p = resolveProjectFromPayload(res);
      if (p) reset(buildFormValues(p));
    } catch (e) {
      toastInfo("Failed to load project details");
    }
  };

  const closeEditModal = () => setEditModal(false);
  const openCreateColumnModal = () => {
    setEditingColumn(null);
    resetColumn({
      title: "",
      color: "#3B82F6",
      icon: "list",
    });
    setColumnModalOpen(true);
  };
  const openEditColumnModal = (column) => {
    if (!column) return;
    setEditingColumn(column);
    resetColumn({
      title: column.title || column.name || "",
      color: column.color || "#3B82F6",
      icon: column.icon || "list",
    });
    setColumnModalOpen(true);
  };
  const closeColumnModal = () => setColumnModalOpen(false);

  const isFormReady = !!project && !loading;
  const selectedProjectImage = watch("image");
  const selectedVisibility = watch("visibility");

  const getBackendOrigin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    try {
      return new URL(String(apiBase)).origin;
    } catch {
      return "";
    }
  };

  const resolveProjectImageSrc = (p) => {
    const raw =
      p?.image_url ??
      p?.image ??
      p?.logo ??
      p?.avatar ??
      p?.icon ??
      null;

    const str = String(raw || "").trim();
    if (!str) return "";
    if (/^https?:\/\//i.test(str)) return str;

    const origin = getBackendOrigin();
    if (!origin) return str;

    const cleaned = str.replace(/^\/+/, "");
    const storagePath = cleaned.startsWith("project_images/")
      ? `storage/${cleaned}`
      : cleaned;
    return `${origin}/${storagePath}`;
  };

  const currentProjectImageSrc = useMemo(
    () => resolveProjectImageSrc(project),
    [project],
  );

  const onSubmit = async (values) => {
    if (!project?.id) return;

    try {
      const hasImage = values.image instanceof File;
      let payload;
      if (hasImage) {
        const fd = new FormData();
        fd.append("name", values.name ?? "");
        fd.append("description", values.description ?? "");
        fd.append("status", values.status ?? "active");
        fd.append("visibility", values.visibility ?? PROJECT_VISIBILITY[0]);
        fd.append("image", values.image);
        payload = fd;
      } else {
        payload = {
          name: values.name ?? "",
          description: values.description ?? "",
          status: values.status ?? "active",
          visibility: values.visibility ?? PROJECT_VISIBILITY[0],
        };
      }

      await dispatch(
        updateProjectThunk({ id: project.id, payload }),
      ).unwrap();

      alertSuccess();
      closeEditModal();

      dispatch(getProjectDetailsThunk(String(project.id)));
    } catch (err) {
      toastInfo("Update failed");
    }
  };

  const onColumnSubmit = async (values) => {
    if (!project?.id) return;
    try {
      if (editingColumn?.id) {
        await dispatch(
          updateProjectColumnThunk({
            projectId: project.id,
            columnId: editingColumn.id,
            payload: values,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createProjectColumnThunk({
            projectId: project.id,
            payload: values,
          }),
        ).unwrap();
      }
      alertSuccess();
      closeColumnModal();
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Column save failed";
      toastError(msg);
    }
  };

  const handleColumnDelete = async (column) => {
    if (!project?.id || !column?.id) return;
    const { isConfirmed } = await alertConfirm({
      title: "Delete column",
      text: "Column will be deleted. Continue?",
      confirmText: "Delete",
      cancelText: "No",
    });
    if (!isConfirmed) return;

    try {
      await dispatch(
        deleteProjectColumnThunk({
          projectId: project.id,
          columnId: column.id,
        }),
      ).unwrap();
      alertSuccess();
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Delete failed";
      toastError(msg);
    }
  };

  const handleAddTask = async (column, text) => {
    if (!project?.id || !column?.id || !text?.trim()) return;
    try {
      await dispatch(
        createProjectTaskThunk({
          projectId: project.id,
          columnId: column.id,
          payload: {
            text: text.trim(),
            column_id: column.id,
          },
        }),
      ).unwrap();
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Task create failed";
      toastError(msg);
    }
  };

  const handleTaskClick = (task) => {
    if (!task) return;
    setActiveTask(task);
    setTaskInfoOpen(true);
  };

  const handleProjectDelete = async () => {
    const projectId = project?.id ?? id;
    if (!projectId) {
      toastError("Project id not found");
      return;
    }
    const { isConfirmed } = await alertConfirm({
      title: "Delete project",
      text: "Project will be deleted. Continue?",
      confirmText: "Delete",
      cancelText: "No",
    });
    if (!isConfirmed) return;

    try {
      await dispatch(deleteProjectThunk(projectId)).unwrap();
      alertSuccess();
      navigat("/");
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Delete failed";
      toastError(msg);
    }
  };

  const openAddMemberModal = () => {
    setAddMemberModalOpen(true);
    dispatch(getCompanyMembersThunk());
  };

  const handleReloadCompanyMembers = () => {
    dispatch(getCompanyMembersThunk());
  };

  const handleAddProjectMember = async (companyMember) => {
    const email = String(companyMember?.email ?? "").trim();
    if (!id || !email) {
      toastError("User email not found");
      return;
    }

    try {
      await dispatch(
        addProjectMemberThunk({
          projectId: id,
          email,
        }),
      ).unwrap();
      toastSuccess("Member added");
      dispatch(getProjectMembersThunk(id));
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Add member failed";
      toastError(msg);
    }
  };

  const normalizeColumnOrderIds = (orderedIds) =>
    (Array.isArray(orderedIds) ? orderedIds : [])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

  const handleReorderColumns = async ({ orderedIds, previousOrderedIds }) => {
    const projectId = Number(project?.id ?? id);
    if (!Number.isInteger(projectId) || projectId <= 0) return;

    const nextOrderedIds = normalizeColumnOrderIds(orderedIds);
    const prevOrderedIds = normalizeColumnOrderIds(previousOrderedIds);
    if (!nextOrderedIds.length) return;

    dispatch(
      reorderProjectColumnsLocal({
        projectId,
        orderedIds: nextOrderedIds,
      }),
    );

    try {
      await dispatch(
        reorderProjectColumnsThunk({
          projectId,
          orderedIds: nextOrderedIds,
        }),
      ).unwrap();
    } catch (err) {
      if (prevOrderedIds.length) {
        dispatch(
          reorderProjectColumnsLocal({
            projectId,
            orderedIds: prevOrderedIds,
          }),
        );
      }

      const msg =
        err?.message ||
        err?.data?.message ||
        "Column reorder failed";
      toastError(msg);
      throw err;
    }
  };

  const handleReorderTask = async ({
    taskId,
    sourceColumnId,
    destinationColumnId,
    sourceTaskIds,
    destinationTaskIds,
    previousSourceTaskIds,
    previousDestinationTaskIds,
  }) => {
    const projectId = Number(project?.id ?? id);
    if (!Number.isInteger(projectId) || projectId <= 0) return;

    const payload = {
      projectId,
      taskId,
      sourceColumnId,
      destinationColumnId,
      sourceTaskIds,
      destinationTaskIds,
    };

    dispatch(reorderProjectTasksLocal(payload));

    try {
      await dispatch(reorderProjectTaskThunk(payload)).unwrap();
    } catch (err) {
      dispatch(
        reorderProjectTasksLocal({
          projectId,
          sourceColumnId,
          destinationColumnId,
          sourceTaskIds: previousSourceTaskIds,
          destinationTaskIds: previousDestinationTaskIds,
        }),
      );

      const msg =
        err?.message ||
        err?.data?.message ||
        "Task reorder failed";
      toastError(msg);
      throw err;
    }
  };

  const handleDeleteProjectMember = async (member) => {
    const memberId = String(member?.removeId ?? "");
    if (!id || !memberId) {
      toastError("Member id not found");
      return;
    }

    const { isConfirmed } = await alertConfirm({
      title: "Are you sure?",
      text: "Member will be removed from project.",
      confirmText: "Remove",
      cancelText: "Cancel",
    });
    if (!isConfirmed) return;

    try {
      await dispatch(
        deleteProjectMemberThunk({
          projectId: id,
          memberId,
        }),
      ).unwrap();
      toastSuccess("Member removed");
      dispatch(getProjectMembersThunk(id));
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Remove member failed";
      toastError(msg);
    }
  };

  const busy =
    !project &&
    !pageError &&
    (loading ||
      columnsStatus === "idle" ||
      columnsStatus === "loading" ||
      (detailsPayload != null && !detailsMatch));

  if (busy)
    return (
      <div className="p-3">
        <iconify-icon icon="line-md:loading-loop" />
      </div>
    );
  if (pageError && !project)
    return (
      <div className="p-3">Error: {pageError?.message || pageError}</div>
    );
  if (!project) return <div className="p-3">Project not found!</div>;

  return (
    <section
      className={`project-board-layout ${membersPanelCollapsed ? "members-collapsed" : ""}`}
    >
      <div className="project-board-main">
        <Container fluid className="project-board-main__container">
          <ProjectBoardHeader
            projectName={project.name}
            onAddColumn={openCreateColumnModal}
            onDelete={handleProjectDelete}
            onEdit={openEditModal}
            onInfo={() => project && setInfoOpen(true)}
            disableAddColumn={!project?.id}
            disableDelete={!project}
            disableEdit={!id}
            disableInfo={!project}
          />

          <div className="project-board-main__content">
            <div className="project-board-main__scroll app-scroll">
              <ProjectBoardColumns
                columns={columns}
                status={columnsStatus}
                tasksLoading={tasksLoading}
                onEditColumn={openEditColumnModal}
                onDeleteColumn={handleColumnDelete}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
                onReorderColumns={handleReorderColumns}
                onReorderTask={handleReorderTask}
              />
            </div>
          </div>
        </Container>
      </div>

      <button
        type="button"
        className="project-members-fab"
        onClick={() => setMembersPanelCollapsed((prev) => !prev)}
        aria-expanded={!membersPanelCollapsed}
        aria-label={membersPanelCollapsed ? "Show project members" : "Hide project members"}
      >
        <i
          className={`ph ${
            membersPanelCollapsed ? "ph-users-three" : "ph-caret-right"
          }`}
        />
        <span>{membersPanelCollapsed ? "Members" : "Hide"}</span>
      </button>

      <ProjectMembers
        members={members}
        loading={membersLoading}
        onAddMember={openAddMemberModal}
        onDeleteMember={handleDeleteProjectMember}
        removingByMemberId={projectMemberRemovingByMemberId}
        collapsed={membersPanelCollapsed}
      />

      <ProjectEditModal
        isOpen={editModal}
        onClose={closeEditModal}
        onSubmit={handleSubmit(onSubmit)}
        isFormReady={isFormReady}
        isSubmitting={isSubmitting}
        errors={errors}
        nameField={nameField}
        nameRef={nameRef}
        statusField={statusField}
        statusRef={statusRef}
        descriptionField={descriptionField}
        descriptionRef={descriptionRef}
        setValue={setValue}
        statusOptions={PROJECT_STATUS}
        visibilityValue={selectedVisibility}
        onVisibilityChange={(visibility) =>
          setValue("visibility", visibility, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        currentImageSrc={currentProjectImageSrc}
        selectedImageFile={selectedProjectImage}
        onClearSelectedImage={() =>
          setValue("image", null, { shouldValidate: true, shouldDirty: true })
        }
      />

      <ProjectDetailsModal
        infoOpen={infoOpen}
        project={project}
        setInfoOpen={setInfoOpen}
        members={members}
        columns={columns}
      />

      <TaskDetailModal
        isOpen={taskInfoOpen}
        onClose={() => setTaskInfoOpen(false)}
        task={activeTask}
        projectId={
          activeTask?.project_id ??
          activeTask?.projectId ??
          activeTask?.project?.id ??
          project?.id ??
          id
        }
        onDeleted={({ taskId, columnId }) => {
          if (taskId && columnId) {
            dispatch(removeTaskFromColumn({ taskId, columnId }));
            setRemovedTaskIds((prev) =>
              prev.includes(taskId) ? prev : [...prev, taskId],
            );
          }
          if (project?.id) {
            dispatch(getProjectColumnsThunk(project.id));
          }
        }}
      />

      <ProjectColumnModal
        isOpen={columnModalOpen}
        onClose={closeColumnModal}
        onSubmit={handleColumnSubmit(onColumnSubmit)}
        isSubmitting={isColumnSubmitting}
        errors={columnErrors}
        titleField={titleField}
        titleRef={titleRef}
        colorField={colorField}
        colorRef={colorRef}
        iconField={iconField}
        iconRef={iconRef}
        iconValue={currentColumnIcon}
        onPickIcon={(value) =>
          setColumnValue("icon", value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        isEdit={!!editingColumn}
      />

      <ProjectAddMemberModal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        companyMembers={companyMembers}
        companyStatus={companyMembersStatus}
        companyError={companyMembersError}
        onReloadCompanyMembers={handleReloadCompanyMembers}
        onAddMember={handleAddProjectMember}
        projectMembers={members}
        addingByEmail={projectMemberAddingByEmail}
      />
    </section>
  );
};

export default ProjectBoard;
