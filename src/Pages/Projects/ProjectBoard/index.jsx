import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteProjectThunk,
  getProjectDetailsThunk,
  updateProjectThunk,
} from "../../../store/projects/singleProjectSlice";
import {
  createProjectColumnThunk,
  createProjectTaskThunk,
  deleteProjectColumnThunk,
  getProjectColumnsThunk,
  updateProjectColumnThunk,
} from "../../../store/projects/projectColumnsSlice";

import ProjectDetailsModal from "../../../Components/projectDetailModal";
import TaskDetailModal from "../../../Components/taskDetailModal";
import { alertConfirm, alertSuccess, toastError, toastInfo } from "../../../utils/sweetAlert";
import ProjectBoardHeader from "./partials/ProjectBoardHeader";
import ProjectEditModal from "./partials/ProjectEditModal";
import ProjectBoardColumns from "./partials/ProjectBoardColumns";
import ProjectColumnModal from "./partials/ProjectColumnModal";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProjectSchema } from "../../../validation/project/updateProject.schema";

const PROJECT_STATUS = ["active", "deactive"];

const ProjectBoard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigat = useNavigate();

  const [infoOpen, setInfoOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [taskInfoOpen, setTaskInfoOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const { data, error, loading } = useSelector((s) => s.projectDetails);
  const projectsList = useSelector((s) => s.projects?.items ?? []);
  const {
    items: projectColumns,
    status: columnsStatus,
    projectId: columnsProjectId,
  } = useSelector((s) => s.projectColumns);

  const fromList = useMemo(() => {
    const numId = Number(id);
    return projectsList.find((p) => p.id === numId) || null;
  }, [projectsList, id]);

  const details = useMemo(() => data?.data ?? data ?? null, [data]);
  const project =
    details?.project || (details?.name ? details : null) || fromList;
  const members = details?.members || [];
  const columnsFromSlice =
    columnsProjectId && String(columnsProjectId) === String(id)
      ? projectColumns
      : null;
  const columnsFromDetails = details?.columns || [];
  const columnsFromList = fromList?.columns || [];

  const baseColumns = columnsFromDetails.length
    ? columnsFromDetails
    : columnsFromList;

  const columns = useMemo(() => {
    if (!columnsFromSlice?.length) return baseColumns || [];

    const baseMap = new Map(
      (baseColumns || []).map((c) => [String(c.id), c]),
    );

    return columnsFromSlice.map((c) => {
      const base = baseMap.get(String(c.id));
      const next = { ...base, ...c };
      const baseTasks = Array.isArray(base?.tasks) ? base.tasks : null;
      const sliceTasks = Array.isArray(c?.tasks) ? c.tasks : null;
      if (baseTasks && !sliceTasks) {
        next.tasks = baseTasks;
      } else if (baseTasks && sliceTasks) {
        const merged = [...baseTasks];
        const seen = new Set(baseTasks.map((t) => String(t.id ?? t.task_id ?? t.uuid ?? t.text ?? "")));
        sliceTasks.forEach((t) => {
          const key = String(t.id ?? t.task_id ?? t.uuid ?? t.text ?? "");
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(t);
          }
        });
        next.tasks = merged;
      }
      return next;
    });
  }, [columnsFromSlice, baseColumns]);

  useEffect(() => {
    if (!id) return;
    dispatch(getProjectDetailsThunk(id));
    dispatch(getProjectColumnsThunk(id));
  }, [dispatch, id]);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(updateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      image: null,
    },
  });

  const { ref: nameRef, ...nameField } = register("name");
  const { ref: statusRef, ...statusField } = register("status");
  const { ref: descriptionRef, ...descriptionField } =
    register("description");

  const {
    handleSubmit: handleColumnSubmit,
    register: registerColumn,
    reset: resetColumn,
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


  const buildFormValues = (p) => ({
    name: p?.name || "",
    description: p?.description || "",
    status: p?.status || "active",
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
        fd.append("image", values.image);
        payload = fd;
      } else {
        payload = {
          name: values.name ?? "",
          description: values.description ?? "",
          status: values.status ?? "active",
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

  if (loading && !project)
    return (
      <div className="p-3">
        <iconify-icon icon="line-md:loading-loop" />
      </div>
    );
  if (error && !project) return <div className="p-3">Error: {error}</div>;
  if (!project) return <div className="p-3">Project not found!</div>;

  return (
    <section className="d-flex">
      <div className="flex-grow-1">
        <Container fluid>
          <ProjectBoardHeader
            projectName={project.name}
            onDelete={handleProjectDelete}
            onEdit={openEditModal}
            onInfo={() => project && setInfoOpen(true)}
            disableDelete={!project}
            disableEdit={!id}
            disableInfo={!project}
          >
            <button
              type="button"
              className="btn btn-primary ms-2"
              onClick={openCreateColumnModal}
              disabled={!project?.id}
            >
              Add Column
            </button>
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
              projectId={project?.id ?? id}
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
              isEdit={!!editingColumn}
            />
          </ProjectBoardHeader>

          <Row>
            <Col xs={12}>
              <div className="overflow-y-scroll app-scroll">
                <ProjectBoardColumns
                  columns={columns}
                  status={columnsStatus}
                  tasksLoading={loading}
                  onEditColumn={openEditColumnModal}
                  onDeleteColumn={handleColumnDelete}
                  onAddTask={handleAddTask}
                  onTaskClick={handleTaskClick}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
};

export default ProjectBoard;
