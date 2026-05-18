import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Card, Col, Row } from 'react-bootstrap';
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
import { StateScreenSkeleton } from '../../Components/Common/LoadingSkeleton';

const FINANCE_CENTER_TAB = 'finance-center';
const SECTION_ACCESS_TAB = 'section-access';
const COUNTERPARTIES_TAB = 'counterparties';

const FINANCE_TABS = [
  { id: FINANCE_CENTER_TAB, label: 'Finance Center', iconClass: 'ph-duotone ph-wallet' },
  { id: SECTION_ACCESS_TAB, label: 'Section Access', iconClass: 'ph-duotone ph-lock-key', ownerOnly: true },
  { id: COUNTERPARTIES_TAB, label: 'Counterparties', iconClass: 'ph-duotone ph-address-book' },
];

const normalizeRole = (role) => String(role ?? '').trim().toLowerCase();

function FinanceTabs({ activeTab, isCompanyOwner, onChange }) {
  return (
    <Card className='manage-finance__tabs-card border-0'>
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
  const companyContextStatus = useSelector(
    (state) => state.companyContext?.status ?? 'idle',
  );
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
  const financeAccessFromContext =
    activeCompany?.membership?.has_finance_center_access ??
    activeCompany?.membership?.hasFinanceCenterAccess;
  const hasFinanceAccessInContext =
    financeAccessFromContext !== undefined && financeAccessFromContext !== null;
  const canOpenSection =
    isCompanyOwner ||
    Boolean(financeAccessFromContext) ||
    (!hasFinanceAccessInContext && canView);

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

    if (hasFinanceAccessInContext) {
      return;
    }

    // Fallback for older company-context payloads that do not include finance access.
    dispatch(probeFileManagementSectionAccess());
  }, [
    activeCompanyId,
    activeTab,
    dispatch,
    hasFinanceAccessInContext,
    isCompanyOwner,
  ]);

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

  if (!activeCompany && ['idle', 'loading'].includes(companyContextStatus)) {
    return <StateScreenSkeleton label='Loading your company access' />;
  }

  if (
    !isCompanyOwner &&
    !hasFinanceAccessInContext &&
    accessProbeStatus === 'loading' &&
    !canOpenSection
  ) {
    return <StateScreenSkeleton label='Checking your finance access' />;
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
