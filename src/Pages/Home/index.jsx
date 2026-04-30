import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toastError, toastSuccess } from '../../utils/sweetAlert';
import HomePanel from './components/HomePanel';
import './home.css';
import TrackingTasks from './components/TrackingTasks';
import { formatFullDate } from '../../utils/date';
import {
  fetchNotificationsThunk,
  markNotificationAsReadThunk,
} from '../../store/notifications/notificationsSlice';
import { resolveNotificationTarget } from '../../utils/notificationNavigation';
import api from '../../api/axios';

const HOME_ITEMS_LIMIT = 3;
const PROJECT_SCAN_LIMIT = 6;

const normalizeArrayPayload = (payload) => {
  const root = payload?.data ?? payload ?? [];
  const data = root?.data ?? root;

  return Array.isArray(data) ? data : [];
};

const encodePathId = (value) => encodeURIComponent(String(value));

const buildProjectPath = (projectId) => `/projects/${encodePathId(projectId)}`;

const buildTaskPath = (projectId, taskId) =>
  `/projects/${encodePathId(projectId)}/task/${encodePathId(taskId)}`;

const sortColumnsByPosition = (columns) =>
  [...(Array.isArray(columns) ? columns : [])].sort((a, b) => {
    const firstPosition = Number(a?.position ?? Number.MAX_SAFE_INTEGER);
    const secondPosition = Number(b?.position ?? Number.MAX_SAFE_INTEGER);

    return firstPosition - secondPosition;
  });

const resolveProjectColumns = async (project) => {
  if (Array.isArray(project?.columns) && project.columns.length > 0) {
    return sortColumnsByPosition(project.columns);
  }

  // The projects list usually includes columns, but this fallback keeps Home stable if that changes.
  const res = await api.get(`/projects/${project.id}`);
  const root = res?.data?.data ?? res?.data ?? null;
  const data = root?.data ?? root ?? null;

  return sortColumnsByPosition(data?.columns ?? data?.project?.columns ?? []);
};

const buildTaskMeta = (task, project, column) => {
  const projectName = project?.name || 'Project';
  const statusOrColumn = task?.status || column?.title || 'Task';

  return `${projectName} - ${statusOrColumn}`;
};

const loadHomeTasks = async (projects) => {
  const tasks = [];
  const projectCandidates = (Array.isArray(projects) ? projects : [])
    .filter((project) => project?.id)
    .slice(0, PROJECT_SCAN_LIMIT);

  for (const project of projectCandidates) {
    const columns = await resolveProjectColumns(project);

    for (const column of columns) {
      if (tasks.length >= HOME_ITEMS_LIMIT) return tasks;
      if (!column?.id) continue;

      const res = await api.get(
        `/projects/${project.id}/columns/${column.id}/tasks`,
      );
      const columnTasks = normalizeArrayPayload(res?.data);

      for (const task of columnTasks) {
        if (tasks.length >= HOME_ITEMS_LIMIT) break;
        if (!task?.id) continue;

        // Enrich backend task data with route context because TaskCardResource does not return project_id.
        tasks.push({
          id: `task-${project.id}-${task.id}`,
          title: task.text || `Task #${task.id}`,
          meta: buildTaskMeta(task, project, column),
          path: buildTaskPath(project.id, task.id),
        });
      }
    }
  }

  return tasks;
};

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth?.user ?? null);
  const projects = useSelector((s) => s.projects?.items ?? []);
  const projectsLoading = useSelector((s) => s.projects?.loading ?? false);
  const {
    items: notificationStoreItems = [],
    status: notificationsStatus = 'idle',
  } = useSelector((s) => s.notifications || {});

  const [taskState, setTaskState] = useState({
    items: [],
    loading: false,
    error: null,
  });

  const flash = location.state?.flash;

  useEffect(() => {
    if (!flash) return;

    toastSuccess(flash);
    navigate(location.pathname, { replace: true, state: null });
  }, [flash, location.pathname, navigate]);

  useEffect(() => {
    if (notificationsStatus !== 'idle') return;

    dispatch(fetchNotificationsThunk());
  }, [dispatch, notificationsStatus]);

  useEffect(() => {
    let cancelled = false;

    if (projectsLoading) return undefined;

    if (!projects.length) {
      setTaskState({ items: [], loading: false, error: null });
      return undefined;
    }

    const fetchTasks = async () => {
      setTaskState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const items = await loadHomeTasks(projects);

        if (!cancelled) {
          setTaskState({ items, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setTaskState({
            items: [],
            loading: false,
            error: err,
          });
        }
      }
    };

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, [projects, projectsLoading]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [],
  );

  const projectItems = useMemo(
    () =>
      projects.slice(0, HOME_ITEMS_LIMIT).map((project) => ({
        id: `project-${project.id}`,
        title: project.name ?? 'Untitled project',
        meta: project.status ?? 'Active',
        path: buildProjectPath(project.id),
      })),
    [projects],
  );

  const notificationItems = useMemo(
    () =>
      notificationStoreItems.slice(0, HOME_ITEMS_LIMIT).map((notification) => ({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        time: formatFullDate(notification.created_at),
        isRead: Boolean(notification.is_read),
        target: resolveNotificationTarget(notification),
      })),
    [notificationStoreItems],
  );

  const userName = String(user?.name || 'there').trim() || 'there';

  const handleNavigationClick = (path) => {
    if (!path) return;

    navigate(path);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.target?.path) return;

    // Keep unread counters accurate when users open a notification from Home.
    if (notification.id && !notification.isRead) {
      try {
        await dispatch(
          markNotificationAsReadThunk({ notificationId: notification.id }),
        ).unwrap();
      } catch (err) {
        toastError(err?.message || 'Failed to mark notification as seen');
        return;
      }
    }

    navigate(notification.target.path);
  };

  return (
    <section className='home-dashboard' aria-label='Home dashboard'>
      <header className='home-dashboard__header'>
        <p className='home-dashboard__date'>{todayLabel}</p>
        <h1 className='home-dashboard__welcome'>Welcome, {userName}</h1>
      </header>

      <TrackingTasks />

      <div className='home-dashboard__grid'>
        <section
          className='home-dashboard__primary'
          aria-label='Tasks and projects'
        >
          <HomePanel title='Tasks'>
            <ul className='home-list'>
              {taskState.loading ? (
                <li className='home-list__item'>
                  <span className='home-list__title'>Loading tasks...</span>
                </li>
              ) : taskState.error ? (
                <li className='home-list__item'>
                  <span className='home-list__title'>
                    {taskState.error?.message || 'Failed to load tasks.'}
                  </span>
                </li>
              ) : taskState.items.length > 0 ? (
                taskState.items.map((task) => (
                  <li key={task.id} className='home-list__item'>
                    <button
                      type='button'
                      className='home-list__button'
                      onClick={() => handleNavigationClick(task.path)}
                    >
                      <span className='home-list__title'>{task.title}</span>
                      <span className='home-list__meta'>{task.meta}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className='home-list__item'>
                  <span className='home-list__title'>
                    There are no tasks yet.
                  </span>
                </li>
              )}
            </ul>
          </HomePanel>

          <HomePanel title='Latest Notifications'>
            <ul className='home-list'>
              {notificationsStatus === 'loading' &&
              notificationItems.length === 0 ? (
                <li className='home-list__item'>
                  <span className='home-list__title'>
                    Loading notifications...
                  </span>
                </li>
              ) : notificationItems.length > 0 ? (
                notificationItems.map((notification) => (
                  <li
                    key={notification.id || notification.title}
                    className='home-list__item'
                  >
                    {notification.target ? (
                      <button
                        type='button'
                        className='home-list__button'
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <span className='home-list__title'>
                          {notification.title}
                        </span>
                        <span className='home-list__meta'>
                          {notification.time}
                        </span>
                      </button>
                    ) : (
                      <>
                        <span className='home-list__title'>
                          {notification.title}
                        </span>
                        <span className='home-list__meta'>
                          {notification.time}
                        </span>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <li className='home-list__item'>
                  <span className='home-list__title'>
                    You do not have any notification yet.
                  </span>
                </li>
              )}
            </ul>
          </HomePanel>
        </section>

        <aside
          className='home-dashboard__notifications'
          aria-label='Projects'
        >
          <HomePanel title='Projects'>
            <ul className='home-list'>
              {projectsLoading ? (
                <li className='home-list__item'>
                  <span className='home-list__title'>Loading projects...</span>
                </li>
              ) : projectItems.length > 0 ? (
                projectItems.map((project) => (
                  <li key={project.id} className='home-list__item'>
                    <button
                      type='button'
                      className='home-list__button'
                      onClick={() => handleNavigationClick(project.path)}
                    >
                      <span className='home-list__title'>{project.title}</span>
                      <span className='home-list__meta'>{project.meta}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className='home-list__item'>
                  <span className='home-list__title'>
                    There are no projects yet.
                  </span>
                </li>
              )}
            </ul>
          </HomePanel>
        </aside>
      </div>
    </section>
  );
};

export default Home;
