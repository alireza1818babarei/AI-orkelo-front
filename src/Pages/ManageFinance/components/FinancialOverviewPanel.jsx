import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Row,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  financialOperationSummaryErrorSelector,
  financialOperationSummaryLoadingSelector,
  financialOperationSummaryRefreshKeySelector,
  financialOperationSummarySelector,
} from '../../../store/FileManager/operations/operations.selector';
import { getFinancialOperationSummary } from '../../../store/FileManager/operations/operations.thunk';
import { FinanceOverviewSkeleton } from '../../../Components/Common/LoadingSkeleton';

// Keep period values aligned with the backend summary request validation.
const PERIOD_OPTIONS = [
  { value: '6_months', label: '6M' },
  { value: '12_months', label: '12M' },
];

const formatFinancialAmount = (value) => {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

function OverviewMetric({ iconClass, label, value, helper, tone = 'primary' }) {
  return (
    <div className={`manage-finance__overview-metric is-${tone}`}>
      <div className='manage-finance__overview-metric-icon'>
        <i className={iconClass}></i>
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
    </div>
  );
}

export default function FinancialOverviewPanel({ enabled = true }) {
  const dispatch = useDispatch();
  const [period, setPeriod] = useState('12_months');

  const activeCompanyId = useSelector(
    (state) =>
      state.companyContext?.activeCompanyId ??
      state.companyContext?.activeCompany?.id ??
      null,
  );
  const summary = useSelector(financialOperationSummarySelector);
  const loading = useSelector(financialOperationSummaryLoadingSelector);
  const error = useSelector(financialOperationSummaryErrorSelector);
  const refreshKey = useSelector(financialOperationSummaryRefreshKeySelector);

  useEffect(() => {
    if (!enabled || !activeCompanyId) return;

    dispatch(getFinancialOperationSummary({ period }));
  }, [activeCompanyId, dispatch, enabled, period, refreshKey]);

  const totals = summary?.totals ?? {};
  const monthly = Array.isArray(summary?.monthly) ? summary.monthly : [];

  const chartSeries = useMemo(
    () => [
      {
        name: 'Income',
        type: 'column',
        data: monthly.map((item) => item.income),
      },
      {
        name: 'Outcome',
        type: 'column',
        data: monthly.map((item) => item.outcome),
      },
      {
        name: 'Net',
        type: 'line',
        data: monthly.map((item) => item.net),
      },
    ],
    [monthly],
  );

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ['#16a34a', '#f97316', '#2563eb'],
      dataLabels: { enabled: false },
      stroke: {
        width: [0, 0, 4],
        curve: 'smooth',
      },
      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: monthly.map((item) => item.label),
      },
      // All finance series use the same money unit, so one shared axis keeps
      // income, outcome, and net visually comparable.
      yaxis: {
        labels: {
          formatter: (value) => formatFinancialAmount(value),
        },
      },
      grid: {
        borderColor: 'rgba(var(--dark), 0.12)',
        strokeDashArray: 4,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value) => formatFinancialAmount(value),
        },
      },
    }),
    [monthly],
  );

  const netTone = Number(totals.netValue ?? 0) >= 0 ? 'success' : 'danger';
  const pendingCount = Number(totals.pendingCount ?? 0) || 0;

  return (
    <Card className='manage-finance__overview-card shadow-sm border-0'>
      <Card.Body>
        <div className='manage-finance__overview-header'>
          <div>
            <div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
              <h4 className='mb-0'>Financial Overview</h4>
              <Badge bg='light' text='dark'>
                Approved operations only
              </Badge>
            </div>
            <p className='text-muted mb-0'>
              Monthly income, outcome, and net movement for the active company.
            </p>
          </div>

          <ButtonGroup size='sm'>
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? 'primary' : 'outline-secondary'}
                onClick={() => setPeriod(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {error?.message ? (
          <Alert variant='danger' className='mb-3'>
            {error.message}
          </Alert>
        ) : null}

        {loading ? (
          <FinanceOverviewSkeleton />
        ) : (
          <>
            <Row className='g-3 mb-4'>
              <Col md={6} xl={3}>
                <OverviewMetric
                  iconClass='ph-duotone ph-arrow-circle-up-right'
                  label='Total Income'
                  value={formatFinancialAmount(totals.incomeValue)}
                  helper='Approved deposits'
                  tone='income'
                />
              </Col>
              <Col md={6} xl={3}>
                <OverviewMetric
                  iconClass='ph-duotone ph-arrow-circle-down-left'
                  label='Total Outcome'
                  value={formatFinancialAmount(totals.outcomeValue)}
                  helper='Approved withdrawals'
                  tone='outcome'
                />
              </Col>
              <Col md={6} xl={3}>
                <OverviewMetric
                  iconClass='ph-duotone ph-chart-line-up'
                  label='Net Balance'
                  value={formatFinancialAmount(totals.netValue)}
                  helper='Income minus outcome'
                  tone={netTone}
                />
              </Col>
              <Col md={6} xl={3}>
                <OverviewMetric
                  iconClass='ph-duotone ph-clock-countdown'
                  label='Pending Review'
                  value={formatFinancialAmount(totals.pendingAmountValue)}
                  helper={`${pendingCount} pending operation${pendingCount === 1 ? '' : 's'}`}
                  tone='pending'
                />
              </Col>
            </Row>

            <div className='manage-finance__overview-chart'>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type='line'
                height={350}
              />
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
