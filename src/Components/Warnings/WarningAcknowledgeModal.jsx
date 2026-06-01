import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { formatMonthDayTime } from '../../utils/date';
import { toastError } from '../../utils/sweetAlert';

const POLL_INTERVAL_MS = 60000;

const normalizeWarningsPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;

  if (Array.isArray(data?.warnings)) return data.warnings;
  if (Array.isArray(data)) return data;
  return [];
};

const getWarningLevelCopy = (level) => {
  switch (String(level ?? '').toLowerCase()) {
    case 'high':
      return 'High Priority Warning';
    case 'medium':
      return 'Medium Priority Warning';
    default:
      return 'Low Priority Warning';
  }
};

function WarningAcknowledgeModal() {
  const accessToken = useSelector((state) => state.auth?.accessToken);
  const userId = useSelector((state) => state.auth?.user?.id);
  const activeCompanyId = useSelector(
    (state) =>
      state.companyContext?.activeCompanyId ??
      state.companyContext?.activeCompany?.id,
  );

  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  const currentWarning = warnings[0] ?? null;
  const currentLevel = String(currentWarning?.level ?? 'low').toLowerCase();

  const canLoad = Boolean(accessToken && userId && activeCompanyId);

  const loadPendingWarnings = useCallback(async ({ silent = false } = {}) => {
    if (!canLoad) {
      setWarnings([]);
      return;
    }

    if (!silent) setLoading(true);

    try {
      const res = await api.get('/warnings/pending');
      setWarnings(normalizeWarningsPayload(res?.data));
    } catch (err) {
      if (!silent) {
        toastError(err?.message || 'Failed to load warnings');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [canLoad]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!canLoad) {
        setWarnings([]);
        return;
      }

      setLoading(true);

      try {
        const res = await api.get('/warnings/pending');
        if (!cancelled) setWarnings(normalizeWarningsPayload(res?.data));
      } catch (err) {
        if (!cancelled) {
          toastError(err?.message || 'Failed to load warnings');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    if (!canLoad) return undefined;

    const intervalId = window.setInterval(() => {
      loadPendingWarnings({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [canLoad, loadPendingWarnings]);

  const pendingSummary = useMemo(() => {
    if (warnings.length <= 1) return '';
    return `${warnings.length - 1} more warning(s) waiting`;
  }, [warnings.length]);

  const handleAcknowledge = async () => {
    if (!currentWarning?.id) return;

    setAcknowledgingId(currentWarning.id);

    try {
      await api.patch(`/warnings/${currentWarning.id}/acknowledge`);
      setWarnings((items) =>
        items.filter((item) => String(item?.id) !== String(currentWarning.id)),
      );
    } catch (err) {
      toastError(err?.message || 'Failed to acknowledge warning');
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <Modal
      show={Boolean(currentWarning)}
      backdrop='static'
      keyboard={false}
      centered
      className={`warning-ack-modal is-${currentLevel}`}
      contentClassName='warning-ack-modal__content'
    >
      <Modal.Body>
        <div className='warning-ack-modal__icon' aria-hidden='true'>
          <i className='ph-duotone ph-warning'></i>
        </div>

        <h2>Warning Received</h2>

        <span className='warning-ack-modal__level'>
          {currentWarning?.level_label || getWarningLevelCopy(currentLevel)}
        </span>

        <h3>{currentWarning?.title || 'Warning'}</h3>

        <p>{currentWarning?.description || '-'}</p>

        <div className='warning-ack-modal__meta'>
          <i className='ph ph-calendar-blank'></i>
          <span>{formatMonthDayTime(currentWarning?.created_at, { useUTC: false })}</span>
        </div>

        {pendingSummary ? (
          <div className='warning-ack-modal__queue'>{pendingSummary}</div>
        ) : null}

        <Button
          type='button'
          className='warning-ack-modal__button'
          onClick={handleAcknowledge}
          disabled={loading || acknowledgingId === currentWarning?.id}
        >
          {acknowledgingId === currentWarning?.id ? (
            <Spinner size='sm' animation='border' aria-hidden='true' />
          ) : (
            'I have read and agree'
          )}
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default WarningAcknowledgeModal;
