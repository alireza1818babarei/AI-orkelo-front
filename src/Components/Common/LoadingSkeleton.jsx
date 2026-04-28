import { Card, Col, Row, Table } from 'react-bootstrap';

const buildItems = (count) => Array.from({ length: count }, (_, index) => index);

function SkeletonLine({ width = '100%', size = '', className = '' }) {
  // Mirrors text length with Bootstrap placeholder utilities.
  return (
    <span
      className={`placeholder ${size ? `placeholder-${size}` : ''} ${className}`.trim()}
      style={{ width }}
      aria-hidden='true'
    />
  );
}

function SkeletonCircle({ size = 40, className = '' }) {
  // Represents avatars, icons, and circular image placeholders.
  return (
    <span
      className={`placeholder rounded-circle ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden='true'
    />
  );
}

function SkeletonBox({
  width = '100%',
  height = 16,
  radius = '0.5rem',
  className = '',
}) {
  // Provides fixed-size blocks for charts, buttons, and media areas.
  return (
    <span
      className={`placeholder ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden='true'
    />
  );
}

function SkeletonStatus({ label }) {
  // Keeps loading feedback available for assistive technology without visual spinners.
  return (
    <span className='visually-hidden' role='status'>
      {label}
    </span>
  );
}

export function ProjectCardsSkeleton({ count = 6 }) {
  return (
    <>
      <SkeletonStatus label='Loading projects' />
      {buildItems(count).map((item) => (
        <Col key={item} xs={6} md={4} xxl={2} className='d-flex'>
          <Card
            className='card project-app-card w-100 placeholder-glow'
            aria-hidden='true'
          >
            <Card.Header>
              <div className='d-flex flex-column align-items-center justify-content-center'>
                <SkeletonCircle size={110} />
                <div className='mt-3 w-100 text-center'>
                  <SkeletonLine width='65%' />
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <SkeletonLine width='90%' />
              <SkeletonLine width='70%' />
            </Card.Body>
          </Card>
        </Col>
      ))}
    </>
  );
}

export function MemberCardsSkeleton({ count = 6 }) {
  return (
    <Row className='g-4 placeholder-glow'>
      <SkeletonStatus label='Loading members' />
      {buildItems(count).map((item) => (
        <Col key={item} xs={6} sm={4} md={3} lg={2} xxl={1} className='d-flex'>
          <Card
            className='w-100 h-100 project-app-card box-shadow-10 border-0'
            aria-hidden='true'
          >
            <Card.Body className='d-flex flex-column align-items-center justify-content-center text-center'>
              <SkeletonCircle size={70} className='mb-3' />
              <SkeletonLine width='75%' />
              <SkeletonLine width='55%' size='sm' />
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export function MemberListSkeleton({ count = 5 }) {
  return (
    <ul className='messages-list mt-3 placeholder-glow'>
      <li className='visually-hidden' role='status'>
        Loading project members
      </li>
      {buildItems(count).map((item) => (
        <li key={item} className='messages-list-item' aria-hidden='true'>
          <SkeletonCircle size={40} className='messages-list-avtar' />
          <div className='messages-list-content'>
            <SkeletonLine width='70%' />
            <SkeletonLine width='45%' size='sm' />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TableRowsSkeleton({
  rows = 5,
  columns = 5,
  firstColumn = 'text',
}) {
  return (
    <>
      <tr className='visually-hidden'>
        <td colSpan={columns} role='status'>
          Loading table rows
        </td>
      </tr>
      {buildItems(rows).map((row) => (
        <tr key={row} className='placeholder-glow' aria-hidden='true'>
          {buildItems(columns).map((column) => (
            <td key={column}>
              {column === 0 && firstColumn !== 'text' ? (
                <div className='d-flex align-items-center gap-2'>
                  <SkeletonCircle size={firstColumn === 'avatar' ? 36 : 22} />
                  <SkeletonLine width='70%' />
                </div>
              ) : (
                <SkeletonLine width={column % 2 === 0 ? '70%' : '50%'} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  firstColumn = 'text',
  wrapperClassName = '',
  tableClassName = 'table table-bottom-border align-middle mb-0',
}) {
  return (
    <div className={`table-responsive ${wrapperClassName}`.trim()}>
      <Table className={tableClassName}>
        <tbody>
          <TableRowsSkeleton
            rows={rows}
            columns={columns}
            firstColumn={firstColumn}
          />
        </tbody>
      </Table>
    </div>
  );
}

export function StateScreenSkeleton({ label = 'Loading content' }) {
  return (
    <div className='manage-finance__state-screen placeholder-glow'>
      <SkeletonStatus label={label} />
      <SkeletonLine width='220px' size='lg' />
      <SkeletonLine width='160px' />
    </div>
  );
}

export function FinanceOverviewSkeleton() {
  return (
    <>
      <Row className='g-3 mb-4 placeholder-glow'>
        <SkeletonStatus label='Loading financial overview' />
        {buildItems(4).map((item) => (
          <Col key={item} md={6} xl={3}>
            <div className='manage-finance__overview-metric' aria-hidden='true'>
              <SkeletonBox width='2.9rem' height='2.9rem' radius='0.75rem' />
              <div className='w-100'>
                <SkeletonLine width='55%' />
                <SkeletonLine width='75%' size='lg' />
                <SkeletonLine width='45%' size='sm' />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div className='manage-finance__overview-chart placeholder-glow'>
        <div className='d-flex justify-content-end gap-3 mb-4'>
          <SkeletonLine width='70px' />
          <SkeletonLine width='80px' />
          <SkeletonLine width='55px' />
        </div>
        <div
          className='d-flex align-items-end gap-3 px-4'
          style={{ minHeight: '18rem' }}
        >
          {buildItems(12).map((item) => (
            <SkeletonBox
              key={item}
              width='6%'
              height={`${70 + (item % 5) * 28}px`}
              radius='0.35rem'
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function FinanceOperationListSkeleton({ count = 5 }) {
  return (
    <div className='manage-finance__operation-list placeholder-glow'>
      <SkeletonStatus label='Loading operations' />
      {buildItems(count).map((item) => (
        <div
          key={item}
          className='manage-finance__operation-item'
          aria-hidden='true'
        >
          <div className='d-flex justify-content-between gap-2 mb-2'>
            <SkeletonLine width='55%' />
            <SkeletonBox width='72px' height='22px' radius='999px' />
          </div>
          <div className='d-flex gap-2 mb-2'>
            <SkeletonBox width='74px' height='22px' radius='999px' />
            <SkeletonBox width='88px' height='22px' radius='999px' />
          </div>
          <div className='manage-finance__operation-item-meta'>
            <SkeletonLine width='45%' />
            <SkeletonLine width='28%' />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FinanceOperationDetailSkeleton() {
  return (
    <div className='manage-finance__operation-detail placeholder-glow'>
      <SkeletonStatus label='Loading operation details' />
      <div className='manage-finance__operation-detail-header'>
        <div className='w-100'>
          <SkeletonLine width='35%' size='lg' />
          <SkeletonLine width='70%' />
        </div>
      </div>
      <div className='manage-finance__operation-stats'>
        {buildItems(4).map((item) => (
          <div
            key={item}
            className='manage-finance__operation-stat'
            aria-hidden='true'
          >
            <SkeletonLine width='45%' size='sm' />
            <SkeletonLine width='75%' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceAccessMembersSkeleton({ count = 5 }) {
  return (
    <div className='manage-finance__member-list placeholder-glow'>
      <SkeletonStatus label='Loading finance access members' />
      {buildItems(count).map((item) => (
        <div
          key={item}
          className='manage-finance__member-row'
          aria-hidden='true'
        >
          <div className='manage-finance__member-user'>
            <SkeletonCircle size={48} />
            <div className='manage-finance__member-copy w-100'>
              <SkeletonLine width='60%' />
              <SkeletonLine width='80%' size='sm' />
            </div>
          </div>
          <div className='manage-finance__member-meta'>
            <SkeletonBox width='90px' height='24px' radius='999px' />
            <SkeletonBox width='70px' height='24px' radius='999px' />
          </div>
          <div className='manage-finance__member-access'>
            <SkeletonBox width='96px' height='26px' radius='999px' />
          </div>
        </div>
      ))}
    </div>
  );
}
