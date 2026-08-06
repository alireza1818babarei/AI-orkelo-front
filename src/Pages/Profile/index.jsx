import { useEffect } from 'react';
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import { useDispatch, useSelector } from 'react-redux';
import ProfileAppTabs from '@/Components/Profileapp/profileAppTabs';
import { Col, Container, Row } from 'reactstrap';
import AppPagination from '../../Components/Common/AppPagination';
import ProfileCard from '../../Components/Profileapp/ProfileCard';
import LightFileupload from '../../Components/Fileupload/LightFileupload';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  selectMyProjectsItems,
  selectMyProjectsLoading,
  selectMyProjectsMeta,
} from '../../store/Profile/MyProjects/myProjects.selectors';
import { getMyProjects } from '../../store/Profile/MyProjects/myProjects.thunk';
import { resolvePublicMediaUrl } from '../../utils/mediaUrl';
import { formatFullDate } from '../../utils/date';
import TelegramConnection from '../../Components/Profileapp/TelegramConnection';
import { hasTelegramConnection } from '../../services/telegram';

const Profile = () => {
  const dispatch = useDispatch();
  const myProjectsItems = useSelector(selectMyProjectsItems);
  const myProjectsLoading = useSelector(selectMyProjectsLoading);
  const myProjectsMeta = useSelector(selectMyProjectsMeta);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user ?? null);
  const profile = useSelector(
    (state) => state.auth?.profile ?? state.auth?.user?.profile ?? null,
  );
  const activeTab =
    location.pathname === '/profile/projects'
      ? 'tab3'
      : location.pathname === '/profile/integrations'
        ? 'tab5'
        : 'tab1';
  const telegramConnected = hasTelegramConnection(profile, user);
  const projectsStart = myProjectsMeta.total
    ? (myProjectsMeta.currentPage - 1) * myProjectsMeta.perPage + 1
    : 0;
  const projectsEnd = myProjectsMeta.total
    ? Math.min(
        myProjectsMeta.currentPage * myProjectsMeta.perPage,
        myProjectsMeta.total,
      )
    : 0;
  const projectsSummary = myProjectsMeta.total
    ? `Showing ${projectsStart} to ${projectsEnd} of ${myProjectsMeta.total} projects`
    : 'No projects found.';

  useEffect(() => {
    GLightbox({
      selector: '.glightbox',
    });
    dispatch(getMyProjects({ page: 1 }));
  }, [dispatch]);

  const handleTabChange = (nextTab) => {
    if (nextTab === 'tab3') {
      navigate('/profile/projects');
      return;
    }

    if (nextTab === 'tab5') {
      navigate('/profile/integrations');
      return;
    }

    navigate('/profile');
  };

  const progressBarColor = (progress) => {
    if (progress <= 30) return 'bg-danger';
    if (progress <= 60) return 'bg-warning';
    if (progress <= 99) return 'bg-info';
    return 'bg-success';
  };

  return (
    <Container fluid>
      <Row className='m-1 '>
        <Col xs={12}>
          <div className='gap-1 mb-3 d-flex align-items-center'>
            <i className='ph-duotone ph-user fs-3 text-primary'></i>
            <h4 className='main-title'>Profile</h4>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <ProfileAppTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </Col>
        <div className='col-lg-9'>
          {activeTab === 'tab1' && <ProfileCard />}

          {activeTab === 'tab3' && (
            <>
              <h2 className='card p-2 text-center text-primary'>Select a project to upload a report</h2>
              <Row>
                {myProjectsLoading && !myProjectsItems.length ? (
                  <Col xs={12}>
                    <div className='card'>
                      <div className='card-body text-center text-muted py-5'>
                        Loading projects...
                      </div>
                    </div>
                  </Col>
                ) : myProjectsItems.length ? (
                  myProjectsItems.map((project) => {
                    const visibleAvatars = project.members?.slice(0, 3) ?? [];
                    const extraAvatarsCount = Math.max(
                      (project.members?.length ?? 0) - 3,
                      0,
                    );
                    return (
                      <Col
                        key={project.id}
                        md={6}
                        xxl={4}
                        onClick={() => navigate(`/my-projects/${project.id}`)}
                        className='mb-4'
                      >
                        <div className='card hover-effect project-app-card h-100'>
                          <div className='card-header'>
                            <div className='d-flex align-items-center'>
                              {project.image && (
                                <div className='w-40 h-40 overflow-hidden d-flex-center b-r-50'>
                                  <img
                                    src={resolvePublicMediaUrl(project.image)}
                                    alt={project.title}
                                    className='img-fluid'
                                  />
                                </div>
                              )}
                              <div className='flex-grow-1 ps-2'>
                                <h6 className='m-0 fs-6 f-w-600'>
                                  {project.title}
                                </h6>
                              </div>
                            </div>
                          </div>
                          <div className='card-body d-flex flex-column justify-content-between'>
                            <div className='d-flex'>
                              <div className='d-flex gap-2'>
                                <h6 className='f-w-500'>
                                  <span>Start Date :</span>
                                </h6>
                                <span className=' f-s-14 text-secondary'>
                                  {formatFullDate(project.createdAt)}
                                </span>
                              </div>
                            </div>
                            <p className='text-muted f-s-14 text-secondary u-truncate'>
                              {project.description}
                            </p>
                            <div
                              className='progress w-100 mt-3 h-15'
                              role='progressbar'
                              aria-valuenow={project.progress}
                              aria-valuemin='0'
                              aria-valuemax='100'
                            >
                              <div
                                className={`progress-bar ${progressBarColor(project.progress)}`}
                                style={{ width: `${project.progress}%` }}
                              >
                                {project.progress === 100
                                  ? 'Completed'
                                  : `${project.progress}%`}
                              </div>
                            </div>
                          </div>
                          <div className='card-footer'>
                            <Row>
                              <Col xs={6}>
                                <span>
                                  <i className='ti ti-brand-wechat'></i>{' '}
                                  {project.membersCount} Members
                                </span>
                              </Col>
                              <Col xs={6}>
                                <ul className='avatar-group float-end breadcrumb-start'>
                                  {visibleAvatars.map((avatar, index) => (
                                    <li
                                      key={`${project.id}-${index}`}
                                      className='h-25 w-25 d-flex-center b-r-50 text-bg-danger b-2-light position-relative'
                                      data-bs-toggle='tooltip'
                                      data-bs-title={`Member ${index + 1}`}
                                    >
                                      <img
                                        src={resolvePublicMediaUrl(
                                          avatar.avatarUrl,
                                        )}
                                        alt={`Member ${index + 1}`}
                                        className='overflow-hidden img-fluid b-r-50'
                                      />
                                    </li>
                                  ))}
                                  {extraAvatarsCount > 0 && (
                                    <li
                                      className='text-bg-primary h-25 w-25 d-flex-center b-r-50'
                                      data-bs-toggle='tooltip'
                                      data-bs-title={`${extraAvatarsCount} More`}
                                    >
                                      {`${extraAvatarsCount}+`}
                                    </li>
                                  )}
                                </ul>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Col>
                    );
                  })
                ) : (
                  <Col xs={12}>
                    <div className='card'>
                      <div className='card-body text-center text-muted py-5'>
                        No projects found.
                      </div>
                    </div>
                  </Col>
                )}
              </Row>

              <AppPagination
                className='mt-2'
                currentPage={myProjectsMeta.currentPage}
                lastPage={myProjectsMeta.lastPage}
                summary={projectsSummary}
                disabled={myProjectsLoading}
                onPageChange={(page) => dispatch(getMyProjects({ page }))}
              />
            </>
          )}
          {activeTab === 'tab5' && (
            <TelegramConnection connected={telegramConnected} />
          )}
          {activeTab === 'tab4' && (
            <Row>
              <Col>
                <div className='card project-app-card h-100"'>
                  <div className='card-header'>
                    <h3 className='text-center'>Upload your daily reports</h3>
                    <LightFileupload />
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      </Row>
    </Container>
  );
};

export default Profile;
