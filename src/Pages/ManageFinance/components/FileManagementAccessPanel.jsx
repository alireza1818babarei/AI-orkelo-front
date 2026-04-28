import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
} from 'react-bootstrap';
import { resolveUserAvatarWithFallback } from '../../../utils/mediaUrl';
import { FinanceAccessMembersSkeleton } from '../../../Components/Common/LoadingSkeleton';

const ROLE_LABELS = {
  company_owner: 'Company Owner',
  company_supervisor: 'Company Supervisor',
  member: 'Member',
};

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const areIdSetsEqual = (first, second) => {
  const firstSet = new Set((first || []).map(String));
  const secondSet = new Set((second || []).map(String));

  if (firstSet.size !== secondSet.size) return false;

  return [...firstSet].every((id) => secondSet.has(id));
};

const orderSelectedUserIds = (members, selectedIdSet) =>
  (members || [])
    .filter(
      (member) =>
        member?.role !== 'company_owner' &&
        selectedIdSet.has(String(member?.id ?? '')),
    )
    .map((member) => member.id);

const getRoleLabel = (role) => ROLE_LABELS[normalizeText(role)] || 'Member';

const getStatusLabel = (status) => {
  const normalized = normalizeText(status);
  if (normalized === 'active') return 'Active';
  if (normalized) return normalized;
  return 'Unknown';
};

const getStatusVariant = (status) =>
  normalizeText(status) === 'active' ? 'success' : 'secondary';

export default function FileManagementAccessPanel({
  members,
  selectedUserIds,
  loading,
  saving,
  error,
  onRefresh,
  onSave,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllowedOnly, setShowAllowedOnly] = useState(false);
  const [draftSelectedUserIds, setDraftSelectedUserIds] = useState([]);

  useEffect(() => {
    setDraftSelectedUserIds(Array.isArray(selectedUserIds) ? selectedUserIds : []);
  }, [selectedUserIds]);

  const draftSelectedIdSet = useMemo(
    () => new Set((draftSelectedUserIds || []).map(String)),
    [draftSelectedUserIds],
  );

  const ownerCount = useMemo(
    () =>
      (members || []).filter(
        (member) => normalizeText(member?.role) === 'company_owner',
      ).length,
    [members],
  );

  const filteredMembers = useMemo(() => {
    const query = normalizeText(searchTerm);

    return (members || [])
      .filter((member) => {
        const isOwner = normalizeText(member?.role) === 'company_owner';
        const isAllowed = isOwner || draftSelectedIdSet.has(String(member?.id ?? ''));

        if (showAllowedOnly && !isAllowed) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchable = [
          member?.name,
          member?.email,
          getRoleLabel(member?.role),
        ]
          .map(normalizeText)
          .join(' ');

        return searchable.includes(query);
      })
      .sort((first, second) => {
        const firstIsOwner = normalizeText(first?.role) === 'company_owner';
        const secondIsOwner = normalizeText(second?.role) === 'company_owner';

        if (firstIsOwner !== secondIsOwner) {
          return firstIsOwner ? -1 : 1;
        }

        const firstIsSelected = draftSelectedIdSet.has(String(first?.id ?? ''));
        const secondIsSelected = draftSelectedIdSet.has(String(second?.id ?? ''));

        if (firstIsSelected !== secondIsSelected) {
          return firstIsSelected ? -1 : 1;
        }

        return String(first?.name ?? '').localeCompare(String(second?.name ?? ''));
      });
  }, [draftSelectedIdSet, members, searchTerm, showAllowedOnly]);

  const hasChanges = useMemo(
    () => !areIdSetsEqual(draftSelectedUserIds, selectedUserIds),
    [draftSelectedUserIds, selectedUserIds],
  );

  const handleToggleMember = (memberId) => {
    setDraftSelectedUserIds((current) => {
      const nextSelectedIdSet = new Set((current || []).map(String));
      const memberKey = String(memberId ?? '');

      if (nextSelectedIdSet.has(memberKey)) {
        nextSelectedIdSet.delete(memberKey);
      } else {
        nextSelectedIdSet.add(memberKey);
      }

      return orderSelectedUserIds(members, nextSelectedIdSet);
    });
  };

  const handleReset = () => {
    setDraftSelectedUserIds(Array.isArray(selectedUserIds) ? selectedUserIds : []);
  };

  const handleSave = async () => {
    await onSave?.(draftSelectedUserIds);
  };

  return (
    <Card className='manage-finance__panel shadow-sm border-0'>
      <Card.Header className='bg-transparent border-0 d-flex flex-wrap gap-3 justify-content-between align-items-start'>
        <div>
          <div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
            <h4 className='mb-0'>Section Access</h4>
            <Badge bg='light' text='dark'>
              {draftSelectedUserIds.length} delegated
            </Badge>
            <Badge bg='success'>
              {ownerCount} owner{ownerCount === 1 ? '' : 's'} always allowed
            </Badge>
          </div>
          <p className='text-muted mb-0'>
            Select which active company members can open the financial section.
          </p>
        </div>

        <div className='d-flex flex-wrap gap-2'>
          <Button
            variant='outline-secondary'
            onClick={onRefresh}
            disabled={loading || saving}
          >
            Refresh
          </Button>
          <Button
            variant='outline-dark'
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? 'Saving...' : 'Save Access'}
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        <Alert variant='info' className='manage-finance__note mb-4'>
          Owners always keep access. Selected users can view this section, open
          records, and download files, but they still cannot manage financial
          data.
        </Alert>

        <div className='manage-finance__filters'>
          <Form.Group className='manage-finance__search'>
            <Form.Label className='small text-uppercase text-muted mb-2'>
              Search Members
            </Form.Label>
            <Form.Control
              type='search'
              placeholder='Search by name, email, or role'
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <div className='manage-finance__filter-actions'>
            <Button
              variant={showAllowedOnly ? 'dark' : 'outline-dark'}
              onClick={() => setShowAllowedOnly((current) => !current)}
              disabled={loading}
            >
              {showAllowedOnly ? 'Showing Allowed Only' : 'Show Allowed Only'}
            </Button>
            <span className='text-muted small'>
              {filteredMembers.length} of {(members || []).length} members
            </span>
          </div>
        </div>

        {error ? (
          <Alert variant='danger' className='mb-3'>
            {typeof error === 'string'
              ? error
              : error?.message || 'Failed to load access list'}
          </Alert>
        ) : null}

        {loading ? (
          <FinanceAccessMembersSkeleton count={5} />
        ) : filteredMembers.length > 0 ? (
          <div className='manage-finance__member-list'>
            {filteredMembers.map((member) => {
              const memberId = member?.id;
              const isOwner = normalizeText(member?.role) === 'company_owner';
              const isChecked =
                isOwner || draftSelectedIdSet.has(String(memberId ?? ''));

              return (
                <div
                  key={String(memberId)}
                  className='manage-finance__member-row'
                >
                  <div className='manage-finance__member-user'>
                    <img
                      src={resolveUserAvatarWithFallback(
                        member?.avatar,
                        member?.email || memberId,
                      )}
                      alt={member?.name || 'Member'}
                      className='manage-finance__member-avatar'
                    />
                    <div className='manage-finance__member-copy'>
                      <h6 className='mb-1'>{member?.name || 'Unnamed member'}</h6>
                      <p className='text-muted mb-0'>{member?.email || '-'}</p>
                    </div>
                  </div>

                  <div className='manage-finance__member-meta'>
                    <Badge bg='light' text='dark'>
                      {getRoleLabel(member?.role)}
                    </Badge>
                    <Badge bg={getStatusVariant(member?.status)}>
                      {getStatusLabel(member?.status)}
                    </Badge>
                  </div>

                  <div className='manage-finance__member-access'>
                    {isOwner ? (
                      <Badge bg='success'>Always allowed</Badge>
                    ) : (
                      <Form.Check
                        type='switch'
                        id={`finance-access-${memberId}`}
                        label={isChecked ? 'Allowed' : 'Hidden'}
                        checked={isChecked}
                        onChange={() => handleToggleMember(memberId)}
                        disabled={saving}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='manage-finance__state manage-finance__state--empty'>
            <i className='ph-duotone ph-users-three'></i>
            <span>No members matched your filters.</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

