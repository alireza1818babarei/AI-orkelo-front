import { useEffect, useMemo, useState } from "react";
import Scrollbar from "simplebar-react";
import { Link } from "react-router-dom";
import MenuItem from "./MenuItem";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProjectSchema, PROJECT_STATUS } from "../../validation/project/updateProject.schema";
import { createProjectThunk } from "../../store/projects/projectsSlice";
import { alertSuccess, toastError } from "../../utils/sweetAlert";

export default function Sidebar({ sidebarOpen, setIsSidebarOpen }) {
  const dispatch = useDispatch();

  const projects = useSelector((s) => s.projects.items);
  const loading = useSelector((s) => s.projects.loading);

  const [createModalOpen, setCreateModalOpen] = useState(false);

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

  const buildFormValues = () => ({
    name: "",
    description: "",
    status: "active",
    image: null,
  });

  useEffect(() => {
    if (!createModalOpen) return;
    reset(buildFormValues());
  }, [createModalOpen, reset]);

  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => setCreateModalOpen(false);

  const onCreateSubmit = async (values) => {
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

      await dispatch(createProjectThunk(payload)).unwrap();
      alertSuccess();
      closeCreateModal();
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Create failed";
      toastError(msg);
    }
  };

  const projectLinks = useMemo(() => {
    return (projects || []).map((p) => ({
      name: p.name,
      path: `/projects/${p.id}`,
    }));
  }, [projects]);

  const projectMenuItems = useMemo(() => {
    return [
      {
        name: "Add Project",
        onClick: openCreateModal,
        className: "add-project-item",
      },
      ...projectLinks,
    ];
  }, [projectLinks]);

  const sidebarConfig = useMemo(() => {
    return [
      {
        type: "single",
        name: "Home",
        iconClass: "ph-duotone ph-house-line",
        path: "/",
      },
      {
        type: "dropdown",
        name: "Projects",
        iconClass: "ph-duotone ph-rocket-launch",
        collapseId: "projects-collapse",
        badgeCount: loading ? (<iconify-icon icon="line-md:loading-loop" />) : projectLinks.length,
        children: projectMenuItems,
      },
    ];
  }, [projectLinks, projectMenuItems, loading]);

  return (
    <nav className={`vertical-sidebar ${sidebarOpen ? "semi-nav" : ""}`}>
      <div className="app-logo">
        <Link className="logo d-inline-block" to="/dashboard/ecommerce">
          {/* logo */}
        </Link>

        <span
          className="bg-light-light toggle-semi-nav"
          role="button"
          tabIndex={0}
          onClick={() => setIsSidebarOpen(!sidebarOpen)}
        >
          <i className="ti ti-chevrons-right f-s-20"></i>
        </span>
      </div>
      <Scrollbar className="app-nav simplebar-scrollable-y" id="app-simple-bar">
        <ul className="main-nav p-0 mt-2">
          {sidebarConfig.map((config, index) => (
            <MenuItem key={config.collapseId || config.path || index} {...config} />
          ))}
        </ul>
      </Scrollbar>

      <div className="menu-navs">
        <span className="menu-previous">
          <i className="ti ti-chevron-left" />
        </span>
        <span className="menu-next">
          <i className="ti ti-chevron-right" />
        </span>
      </div>

      <Modal isOpen={createModalOpen} toggle={closeCreateModal} centered>
        <ModalHeader toggle={closeCreateModal}>Add Project</ModalHeader>

        <Form className="app-form" onSubmit={handleSubmit(onCreateSubmit)}>
          <ModalBody>
            <FormGroup>
              <Label for="name">Project Name</Label>
              <Input
                id="name"
                type="text"
                {...nameField}
                innerRef={nameRef}
                invalid={!!errors.name}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label for="status">Status</Label>
              <Input
                id="status"
                type="select"
                {...statusField}
                innerRef={statusRef}
                invalid={!!errors.status}
                disabled={isSubmitting}
              >
                {PROJECT_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label for="logo">Image</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue("image", file, { shouldValidate: true });
                }}
                invalid={!!errors.image}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label for="description">Project Description</Label>
              <Input
                id="description"
                type="textarea"
                rows="4"
                {...descriptionField}
                innerRef={descriptionRef}
                invalid={!!errors.description}
                disabled={isSubmitting}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              color="secondary"
              type="button"
              onClick={closeCreateModal}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button color="primary" type="submit" disabled={isSubmitting}>
              Save Project
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </nav>
  );
}
