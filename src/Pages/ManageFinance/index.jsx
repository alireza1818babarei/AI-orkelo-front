import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Card, Col, Row, Spinner } from 'react-bootstrap';
import {
  fileManagementAccessErrorSelector,
  fileManagementAccessMembersSelector,
  fileManagementAccessProbeErrorSelector,
  fileManagementAccessProbeStatusSelector,
  fileManagementAccessSaveStatusSelector,
  fileManagementAccessSelectedUserIdsSelector,
  fileManagementAccessStatusSelector,
  fileManagementCanViewSelector,
} from '../../store/FileManager/access/access.selector';
import {
  getFileManagementAccessUsers,
  probeFileManagementSectionAccess,
  updateFileManagementAccessUsers,
} from '../../store/FileManager/access/access.thunk';
import { toastError, toastSuccess } from '../../utils/sweetAlert';
import FileManagementAccessPanel from './components/FileManagementAccessPanel';
import FinancialCounterpartiesPanel from './components/FinancialCounterpartiesPanel';
import FinancialOverviewPanel from './components/FinancialOverviewPanel';
import FinancialOperationsPanel from './components/FinancialOperationsPanel';
import './manageFinance.css';

const FINANCE_CENTER_TAB = 'finance-center';
const SECTION_ACCESS_TAB = 'section-access';
const COUNTERPARTIES_TAB = 'counterparties';

const FINANCE_TABS = [
  { id: FINANCE_CENTER_TAB, label: 'Finance Center', iconClass: 'ph-duotone ph-wallet' },
  { id: SECTION_ACCESS_TAB, label: 'Section Access', iconClass: 'ph-duotone ph-lock-key', ownerOnly: true },
  { id: COUNTERPARTIES_TAB, label: 'Counterparties', iconClass: 'ph-duotone ph-address-book' },
];

const normalizeRole = (role) => String(role ?? '').trim().toLowerCase();

const getRoleLabel = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'company_owner') return 'Company Owner';
  if (normalized === 'company_supervisor') return 'Company Supervisor';
  if (normalized === 'project_manager') return 'Project Manager';
  return 'Member';
};

function FinanceTabs({ activeTab, isCompanyOwner, onChange }) {
  return (
    <Card className='manage-finance__tabs-card shadow-sm border-0'>
      <Card.Body>
        <ul className='nav nav-tabs tab-light-primary manage-finance__tabs' role='tablist'>
          {FINANCE_TABS.map((tab) => {
            const isDisabled = tab.disabled || (tab.ownerOnly && !isCompanyOwner);

            return (
              <li className='nav-item' role='presentation' key={tab.id}>
                <button
                  type='button'
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  role='tab'
                  aria-selected={activeTab === tab.id}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  onClick={() => {
                    // Disabled tabs should not update the active finance view.
                    if (!isDisabled) onChange(tab.id);
                  }}
                >
                  <i className={tab.iconClass}></i>
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card.Body>
    </Card>
  );
}

export default function ManageFinance() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(FINANCE_CENTER_TAB);

  const user = useSelector((state) => state.auth?.user ?? null);
  const activeCompany = useSelector((state) => state.companyContext?.activeCompany);
  const activeCompanyId = useSelector(
    (state) =>
      state.companyContext?.activeCompanyId ??
      state.companyContext?.activeCompany?.id ??
      null,
  );

  const members = useSelector(fileManagementAccessMembersSelector);
  const selectedUserIds = useSelector(fileManagementAccessSelectedUserIdsSelector);
  const status = useSelector(fileManagementAccessStatusSelector);
  const error = useSelector(fileManagementAccessErrorSelector);
  const saveStatus = useSelector(fileManagementAccessSaveStatusSelector);
  const canView = useSelector(fileManagementCanViewSelector);
  const accessProbeStatus = useSelector(fileManagementAccessProbeStatusSelector);
  const accessProbeError = useSelector(fileManagementAccessProbeErrorSelector);

  const companyRole = normalizeRole(
    activeCompany?.membership?.role ?? user?.company_role ?? user?.user_type,
  );
  const isCompanyOwner = companyRole === 'company_owner';
  const canOpenSection = isCompanyOwner || canView;

  useEffect(() => {
    if (!isCompanyOwner && activeTab === SECTION_ACCESS_TAB) {
      setActiveTab(FINANCE_CENTER_TAB);
    }
  }, [activeTab, isCompanyOwner]);

  useEffect(() => {
    if (!activeCompanyId) return;

    if (isCompanyOwner) {
      // Access members are needed only when the owner opens the Section Access tab.
      if (activeTab === SECTION_ACCESS_TAB) {
        dispatch(getFileManagementAccessUsers());
      }
      return;
    }

    // Non-owner users must be checked before opening the finance workspace.
    dispatch(probeFileManagementSectionAccess());
  }, [activeCompanyId, activeTab, dispatch, isCompanyOwner]);

  const handleRefreshAccess = () => {
    dispatch(getFileManagementAccessUsers());
  };

  const handleSaveAccess = async (userIds) => {
    const resultAction = await dispatch(updateFileManagementAccessUsers({ userIds }));

    if (updateFileManagementAccessUsers.fulfilled.match(resultAction)) {
      toastSuccess('Financial section access updated');
      return;
    }

    toastError(resultAction.payload?.message || 'Failed to update financial access');
  };

  if (!isCompanyOwner && accessProbeStatus === 'loading' && !canOpenSection) {
    return (
      <div className='manage-finance__state-screen'>
        <Spinner animation='border' />
        <span>Checking your finance access...</span>
      </div>
    );
  }

  if (!canOpenSection) {
    return (
      <div className='manage-finance__state-screen'>
        <Alert variant={accessProbeStatus === 'failed' ? 'danger' : 'warning'}>
          {accessProbeStatus === 'failed'
            ? accessProbeError?.message || 'Failed to verify your financial section access.'
            : 'You do not have access to this section in the active company.'}
        </Alert>
      </div>
    );
  }

  return (
    <Row className='g-4 manage-finance'>
      <Col xs={12}>
        <FinanceTabs
          activeTab={activeTab}
          isCompanyOwner={isCompanyOwner}
          onChange={setActiveTab}
        />
      </Col>

      {activeTab === FINANCE_CENTER_TAB ? (
        <>
          <Col xs={12}>
            <Card className='manage-finance__hero shadow-sm border-0'>
              <Card.Body>
                <div className='manage-finance__hero-copy'>
                  <div className='d-flex flex-wrap gap-2 align-items-center mb-3'>
                    <Badge bg='dark'>Finance Center</Badge>
                    <Badge bg='primary'>
                      {isCompanyOwner ? 'Owner Controls Enabled' : 'Access Enabled'}
                    </Badge>
                    <Badge bg='light' text='dark'>
                      {activeCompany?.name || 'Active company'}
                    </Badge>
                  </div>

                  <h2 className='mb-2'>Financial Operations Workspace</h2>
                  <p className='mb-0'>
                    Create and manage financial operations, upload supporting files,
                    and work inside the active company finance workspace.
                  </p>
                </div>

                <div className='manage-finance__hero-meta'>
                  <span className='manage-finance__hero-meta-label'>Your role</span>
                  <strong>{getRoleLabel(companyRole)}</strong>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12}>
            <FinancialOverviewPanel enabled={canOpenSection} />
          </Col>

          <Col xs={12}>
            <FinancialOperationsPanel enabled={canOpenSection} />
          </Col>
        </>
      ) : null}

      {activeTab === SECTION_ACCESS_TAB && isCompanyOwner ? (
        <Col xs={12}>
          <FileManagementAccessPanel
            members={members}
            selectedUserIds={selectedUserIds}
            loading={status === 'loading'}
            saving={saveStatus === 'loading'}
            error={error}
            onRefresh={handleRefreshAccess}
            onSave={handleSaveAccess}
          />
        </Col>
      ) : null}

      {activeTab === COUNTERPARTIES_TAB ? (
        <Col xs={12}>
          <FinancialCounterpartiesPanel enabled={canOpenSection} />
        </Col>
      ) : null}
    </Row>
  );
}
