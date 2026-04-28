import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Alert,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  fileManagerProjectsErrorSelector,
  fileManagerProjectsLoadingSelector,
  fileManagerProjectsSelector,
} from '../../store/FileManager/projects/projects.selector';
import { getFileManagerProjects } from '../../store/FileManager/projects/projects.thunk';
import { resolvePublicMediaUrl } from '../../utils/mediaUrl';
import { useNavigate } from 'react-router-dom';
import { getCompanyMembersThunk } from '../../store/company/companyMembersSlice';
import {
  MemberCardsSkeleton,
  ProjectCardsSkeleton,
} from '../../Components/Common/LoadingSkeleton';

const normalizeRole = (role) =>
  String(role ?? '')
    .trim()
    .toLowerCase();

const getReadableErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error?.message || fallback;
};

const formatCompanyRole = (role) => {
  switch (normalizeRole(role)) {
    case 'company_supervisor':
      return 'Company Supervisor';
    case 'company_owner':
      return 'Company Owner';
    case 'member':
      return 'Member';
    default:
      return '-';
  }
};

function ManageProjects() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth?.user ?? null);
  const activeCompanyRole = useSelector(
    (s) => s.companyContext?.activeCompany?.membership?.role ?? null,
  );
  const projects = useSelector(fileManagerProjectsSelector) || [];
  const projectsLoading = useSelector(fileManagerProjectsLoadingSelector);
  const projectsError = useSelector(fileManagerProjectsErrorSelector);

  const {
    items: members,
    status: membersStatus,
    error: membersError,
  } = useSelector((s) => s.companyMembers);

  const companyRole = normalizeRole(
    activeCompanyRole ?? user?.company_role ?? user?.user_type,
  );
  const canLoadCompanyMembers =
    companyRole === 'company_owner' || companyRole === 'company_supervisor';

  useEffect(() => {
    dispatch(getFileManagerProjects());
  }, [dispatch]);

  useEffect(() => {
    if (!canLoadCompanyMembers) return;
    dispatch(getCompanyMembersThunk());
  }, [dispatch, canLoadCompanyMembers]);

  return (
    <>
      <Row className='g-4'>
        <Col xs={12}>
          <h2 className='mb-0'>Manage Projects</h2>
        </Col>

        {projectsLoading ? (
          <ProjectCardsSkeleton count={6} />
        ) : projectsError ? (
          <Col xs={12}>
            <Alert variant='danger' className='mb-0'>
              {getReadableErrorMessage(projectsError, 'Error loading projects')}
            </Alert>
          </Col>
        ) : projects.length === 0 ? (
          <Col xs={12}>
            <div className='px-2 py-2 text-muted small'>No projects found</div>
          </Col>
        ) : (
          projects.map((p) => (
            <Col key={p.project_id} xs={6} md={4} xxl={2} className='d-flex'>
              <Card
                className='card hover-effect project-app-card cursor-pointer w-100'
                onClick={() => navigate(`/manage-projects/${p.project_id}`)}
              >
                <CardHeader>
                  <div className='d-flex flex-column align-items-center justify-content-center'>
                    <div className='w-110 h-110 b-r-100 overflow-hidden'>
                      {p.image ? (
                        <img
                          className='w-100 h-100 object-fit-cover'
                          src={resolvePublicMediaUrl(p.image)}
                          alt={p.name}
                        />
                      ) : (
                        <div className='d-flex align-items-center justify-content-center w-100 h-100 b-r-100 border fs-2 text-light-primary'>
                          {p.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className='mt-2'>{p.name}</div>
                  </div>
                </CardHeader>

                <CardBody className='text-break'>
                  {p.description || '-'}
                </CardBody>
              </Card>
            </Col>
          ))
        )}
      </Row>
      {canLoadCompanyMembers ? (
        <Row className='mt-4'>
          <Col xs={12}>
            <div className='bg-body text-body b-r-20 p-3'>
              <div className='text-center pt-2 mb-1'>
                <h2>Members</h2>
                <p>
                  Click on a member to view their{' '}
                  <span className='text-light-primary p-1 b-r-10'>
                    Reports
                  </span>
                  .
                </p>
              </div>

              {membersStatus === 'loading' && members.length === 0 ? (
                <MemberCardsSkeleton count={6} />
              ) : null}

              {membersError && (
                <Alert variant='danger'>
                  {getReadableErrorMessage(
                    membersError,
                    'Error loading members',
                  )}
                </Alert>
              )}

              {!membersError &&
                members.length === 0 &&
                membersStatus !== 'loading' && (
                  <div className='text-muted small'>No members found</div>
                )}

              <Row className='g-4'>
                {members.length > 0 &&
                  members.map((m) => (
                    <Col
                      key={m.id}
                      xs={6}
                      sm={4}
                      md={3}
                      lg={2}
                      xxl={1}
                      className='d-flex'
                    >
                      <Card
                        className='w-100 h-100 hover-effect project-app-card box-shadow-10 border-0 cursor-pointer'
                        onClick={() =>
                          navigate(`/manage-projects/user/${m.id}`, {
                            state: { memberName: m.name },
                          })
                        }
                      >
                        <CardBody className='d-flex flex-column align-items-center justify-content-center text-center'>
                          <div
                            className='overflow-hidden rounded-circle border mb-3'
                            style={{ width: '70px', height: '70px' }}
                          >
                            {m.avatar ? (
                              <img
                                src={resolvePublicMediaUrl(m.avatar)}
                                alt={m.name}
                                className='w-100 h-100 object-fit-cover'
                              />
                            ) : (
                              <div className='d-flex align-items-center justify-content-center w-100 h-100 fs-2 text-light-primary'>
                                {m.name?.slice(0, 1)}
                              </div>
                            )}
                          </div>

                          <p className='fw-semibold mb-1 one-line-ellipsis w-100 text-capitalize'>
                            {m.name}
                          </p>
                          <p className='text-muted f-s-11 mb-0'>
                            {formatCompanyRole(m.role || m.membership?.role)}
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </div>
          </Col>
        </Row>
      ) : null}
    </>
  );
}

export default ManageProjects;
