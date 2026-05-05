import { useEffect, useMemo, useState } from 'react';
import Scrollbar from 'simplebar-react';
import { Link } from 'react-router-dom';
import MenuItem from './MenuItem';
import CompanySwitcher from './CompanySwitcher';
import { useDispatch, useSelector } from 'react-redux';
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
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  updateProjectSchema,
  PROJECT_STATUS,
  PROJECT_VISIBILITY,
} from '../../validation/project/updateProject.schema';
import { createProjectThunk } from '../../store/projects/projectsSlice';
import { resolvePublicMediaUrl } from '../../utils/mediaUrl';
import { toastError, toastSuccess } from '../../utils/sweetAlert';
import {
  fileManagementCanViewSelector,
} from '../../store/FileManager/access/access.selector';
import { probeFileManagementSectionAccess } from '../../store/FileManager/access/access.thunk';

const DEFAULT_CREATE_PROJECT_VISIBILITY = 'private';

export default function Sidebar({ sidebarOpen, setIsSidebarOpen }) {
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth?.user ?? null);
  const activeCompanyRole = useSelector(
    (s) => s.companyContext?.activeCompany?.membership?.role ?? null
  );
  const projects = useSelector((s) => s.projects.items);
  const loading = useSelector((s) => s.projects.loading);
  const activeCompanyId = useSelector(
    (s) => s.companyContext?.activeCompanyId ?? s.companyContext?.activeCompany?.id ?? null,
  );
  const canViewFinanceCenter = useSelector(fileManagementCanViewSelector);

  const [createModalOpen, setCreateModalOpen] = useState(false);

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
      name: '',
      description: '',
      status: 'active',
      visibility: DEFAULT_CREATE_PROJECT_VISIBILITY,
      image: null,
    },
  });

  const { ref: nameRef, ...nameField } = register('name');
  const { ref: statusRef, ...statusField } = register('status');
  const { ref: descriptionRef, ...descriptionField } = register('description');

  const companyRole = String(
    activeCompanyRole ?? user?.company_role ?? user?.user_type ?? ''
  ).trim().toLowerCase();

  useEffect(() => {
    register('visibility');
  }, [register]);

  useEffect(() => {
    if (!user?.id || !activeCompanyId) return;
    if (companyRole === 'company_owner') return;

    dispatch(probeFileManagementSectionAccess());
  }, [activeCompanyId, companyRole, dispatch, user?.id]);

  const buildFormValues = () => ({
    name: '',
    description: '',
    status: 'active',
    visibility: DEFAULT_CREATE_PROJECT_VISIBILITY,
    image: null,
  });

  const selectedVisibility = watch('visibility');

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
        fd.append('name', values.name ?? '');
        fd.append('description', values.description ?? '');
        fd.append('status', values.status ?? 'active');
        fd.append(
          'visibility',
          values.visibility ?? DEFAULT_CREATE_PROJECT_VISIBILITY
        );
        fd.append('image', values.image);
        payload = fd;
      } else {
        payload = {
          name: values.name ?? '',
          description: values.description ?? '',
          status: values.status ?? 'active',
          visibility:
            values.visibility ?? DEFAULT_CREATE_PROJECT_VISIBILITY,
        };
      }

      await dispatch(createProjectThunk(payload)).unwrap();
      toastSuccess('Project Created');
      closeCreateModal();
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Create failed';
      toastError(msg);
    }
  };

  const resolveProjectImageSrc = (project) => {
    const raw = project?.image ?? null;

    const str = String(raw || '').trim();
    if (!str) return '';
    if (/^https?:\/\//i.test(str)) return str;
    return resolvePublicMediaUrl(str) || str;
  };

  const projectLinks = useMemo(() => {
    return (projects || []).map((p) => ({
      name: p.name,
      path: `/projects/${p.id}`,
      avatarSrc: resolveProjectImageSrc(p),
      className: 'project-submenu-item',
    }));
  }, [projects]);

  const projectMenuItems = useMemo(() => {
    return [
      {
        name: 'Add Project',
        onClick: openCreateModal,
        className: 'add-project-item',
      },
      ...projectLinks,
    ];
  }, [projectLinks]);

  const hasProjectManagerRole = Array.isArray(user?.project_roles)
    ? user.project_roles.some(
        (item) =>
          String(item?.role ?? '').trim().toLowerCase() === 'project_manager'
      )
    : false;

  const canSeeManageReports =
    companyRole === 'company_owner' ||
    companyRole === 'company_supervisor' ||
    hasProjectManagerRole;

  const canSeeActiveTrackers =
    companyRole === 'company_owner' ||
    companyRole === 'company_supervisor' ||
    hasProjectManagerRole;

  const canSeeFinanceSection =
    companyRole === 'company_owner' || canViewFinanceCenter;

  const sidebarConfig = useMemo(() => {
    const items = [
      {
        type: 'single',
        name: 'Home',
        iconClass: 'ph-duotone ph-house-line',
        path: '/',
      },
      {
        type: 'dropdown',
        name: 'Projects',
        iconClass: 'ph-duotone ph-rocket-launch',
        collapseId: 'projects-collapse',
        badgeCount: loading ? (
          <iconify-icon icon='line-md:loading-loop' />
        ) : (
          projectLinks.length
        ),
        children: projectMenuItems,
      },
    ];

    if (canSeeActiveTrackers) {
      items.push({
        type: 'single',
        name: 'Active Trackers',
        path: '/active-trackers',
        iconClass: 'ph-duotone ph-timer',
        collapseId: 'active-trackers-collapse',
      });
    }

    if (canSeeManageReports) {
      items.push({
        type: 'single',
        name: 'Manage Projects',
        path: '/manage-projects',
        iconClass: 'ti ti-ad-2',
        collapseId: 'reports-collapse',
      });
    }

    if (canSeeFinanceSection) {
      items.push({
        type: 'single',
        name: 'Finance Center',
        path: '/manage-finance',
        iconClass: 'ph-duotone ph-receipt',
        collapseId: 'finance-collapse',
      });
    }

    return items;
  }, [
    projectLinks,
    projectMenuItems,
    loading,
    canSeeActiveTrackers,
    canSeeManageReports,
    canSeeFinanceSection,
  ]);

  return (
    <nav className={`vertical-sidebar ${sidebarOpen ? 'semi-nav' : ''}`}>
      <div className='sidebar-brand pt-3 px-2 d-flex flex-column'>
        <Link
          className='orkelo-sidebar-logo d-inline-flex align-items-center overflow-hidden'
          to='/'
          aria-label='Orkelo home'
        >
          <img src='/assets/images/logo/orkelo.png' alt='' className='orkelo-sidebar-logo__icon' />
          <img src='/assets/images/logo/Orkelo2.png' alt='' className='orkelo-sidebar-logo__full orkelo-sidebar-logo__full--light' />
          <img src='/assets/images/logo/Orkelo-for-darkmode.png' alt='' className='orkelo-sidebar-logo__full orkelo-sidebar-logo__full--dark' />
        </Link>

        <span
          className='bg-light-light toggle-semi-nav align-self-end me-2'
          role='button'
          tabIndex={0}
          onClick={() => setIsSidebarOpen(!sidebarOpen)}
        >
          <i
            className={`ti ${sidebarOpen ? 'ti-chevrons-right' : 'ti-chevrons-left'} f-s-20`}
          ></i>
        </span>
      </div>

      <Scrollbar className='app-nav simplebar-scrollable-y' id='app-simple-bar'>
        <ul className='main-nav p-0 mt-2'>
          {sidebarConfig.map((config, index) => (
            <MenuItem
              key={config.collapseId || config.path || index}
              isSidebarCompact={sidebarOpen}
              {...config}
            />
          ))}
        </ul>
      </Scrollbar>

      <div className='sidebar-company-switcher-wrap'>
        <CompanySwitcher />
      </div>

      <Modal isOpen={createModalOpen} toggle={closeCreateModal} centered>
        <ModalHeader toggle={closeCreateModal}>Add Project</ModalHeader>

        <Form className='app-form' onSubmit={handleSubmit(onCreateSubmit)}>
          <ModalBody>
            <FormGroup>
              <Label for='name'>Project Name</Label>
              <Input
                id='name'
                type='text'
                {...nameField}
                innerRef={nameRef}
                invalid={!!errors.name}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label for='status'>Status</Label>
              <Input
                id='status'
                type='select'
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
              <Label for='logo'>Image</Label>
              <Input
                id='logo'
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue('image', file, { shouldValidate: true });
                }}
                invalid={!!errors.image}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label for='description'>Project Description</Label>
              <Input
                id='description'
                type='textarea'
                rows='4'
                {...descriptionField}
                innerRef={descriptionRef}
                invalid={!!errors.description}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup className='main-switch'>
              <div className='switch-info swich-size2 my-3'>
                <input
                  type='checkbox'
                  id='project-visibility-create'
                  className='toggle'
                  checked={selectedVisibility === 'private'}
                  onChange={(e) =>
                    setValue(
                      'visibility',
                      e.target.checked ? 'private' : 'public',
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }
                  disabled={isSubmitting}
                />
                <label htmlFor='project-visibility-create'>
                  {selectedVisibility === 'private'
                    ? 'Private Project'
                    : 'Public Project'}
                </label>
              </div>

              {errors.visibility ? (
                <div className='invalid-feedback d-block'>
                  {errors.visibility.message}
                </div>
              ) : null}
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              color='secondary'
              type='button'
              onClick={closeCreateModal}
              disabled={isSubmitting}
            >
              Close
            </Button>

            <Button color='primary' type='submit' disabled={isSubmitting}>
              Save Project
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </nav>
  );
}
