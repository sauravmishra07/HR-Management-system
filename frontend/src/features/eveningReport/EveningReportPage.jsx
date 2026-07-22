import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { eveningReportApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { fdate, todayISO } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, Chip, DataTable, Pagination, EmployeeCell,
} from '@/components/ui';
import EveningReportModal from './EveningReportModal';

/* ─── Skeleton helper ─── */
function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="shimmer"
      style={{
        width, height, borderRadius: radius,
        background: 'var(--sky-2)',
        opacity: 0.5,
        animation: 'shimmer 1.4s ease-in-out infinite alternate',
        ...style,
      }}
    />
  );
}

const excerpt = (s, n = 90) => {
  const t = (s || '').trim();
  if (!t) return '—';
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
};

export default function EveningReportPage() {
  const { empId, can } = useAuth();
  const seesAll = can('viewAllEveningReports');

  const [filters, setFilters] = useState({ status: '', date: '', search: '', page: 1 });
  const [modalOpen, setModalOpen] = useState(false);

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  // The caller's own report for today — drives the submit/update button + modal prefill.
  const todayQ = useQuery({
    queryKey: ['evening-reports', 'today', empId],
    queryFn: () => eveningReportApi.list({ date: todayISO(), emp: empId, limit: 1 }),
    enabled: Boolean(empId),
  });
  const todayReport = todayQ.data?.data?.[0] || null;

  const params = {
    status: filters.status,
    date: filters.date,
    search: seesAll ? filters.search : '',
    page: filters.page,
    limit: 12,
  };
  const listQ = useQuery({
    queryKey: ['evening-reports', params],
    queryFn: () => eveningReportApi.list(params),
    placeholderData: keepPreviousData,
  });

  const rows = listQ.data?.data || [];
  const meta = listQ.data?.meta;

  /* ── Compute overall stats ── */
  const submittedCount = rows.filter((r) => r.status === 'Submitted').length;
  const approvedCount = rows.filter((r) => r.status === 'Approved').length;
  const rejectedCount = rows.filter((r) => r.status === 'Rejected').length;

  const columns = [
    ...(seesAll
      ? [{ key: 'emp', header: 'Employee', render: (r) => <EmployeeCell employee={r.employee} empId={r.emp} /> }]
      : []),
    {
      key: 'date',
      header: 'Date',
      render: (r) => (
        <div>
          <div className="cell-main">{fdate(r.date)}</div>
          <div className="cell-sub mono">{r.code}</div>
        </div>
      ),
    },
    {
      key: 'work',
      header: 'Work done',
      width: 280,
      render: (r) => (
        <div>
          <div className="cell-main" style={{ whiteSpace: 'normal' }}>{excerpt(r.work)}</div>
          {r.blockers ? (
            <div className="cell-sub" style={{ whiteSpace: 'normal' }}>Blockers: {excerpt(r.blockers, 60)}</div>
          ) : null}
        </div>
      ),
    },
    { key: 'hours', header: 'Hours', render: (r) => <b>{r.hours}h</b> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <div>
          <Chip status={r.status} variant={r.status === 'Submitted' ? 'line' : undefined} />
          {r.status === 'Rejected' && r.response?.reason ? (
            <div className="cell-sub" style={{ marginTop: 4, maxWidth: 220, whiteSpace: 'normal' }}>
              “{r.response.reason}”
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Evening Report"
        hint={seesAll
          ? 'Daily wrap-ups from the whole team. The owner reviews and decides in the command center.'
          : 'One minute before you log off — what you did, what is next, what is in the way.'}
        actions={(
          <Button icon={todayReport ? 'refresh' : 'plus'} onClick={() => setModalOpen(true)}>
            {todayReport ? "Update today's report" : "Submit today's report"}
          </Button>
        )}
      />

      {/* ── Summary strip ── */}
      {!listQ.isLoading && rows.length > 0 && (
        <div className="leave-summary-strip">
          <div className="leave-summary-item">
            <span className="leave-summary-dot" style={{ background: 'var(--line-2)' }} />
            <span>Submitted: <b>{submittedCount}</b></span>
          </div>
          <div className="leave-summary-item">
            <span className="leave-summary-dot" style={{ background: 'var(--blue)' }} />
            <span>Approved: <b>{approvedCount}</b></span>
          </div>
          <div className="leave-summary-item">
            <span className="leave-summary-dot" style={{ background: 'var(--slate)' }} />
            <span>Rejected: <b>{rejectedCount}</b></span>
          </div>
          <div className="chip chip-sky" style={{ marginLeft: 'auto' }}>
            {meta?.total ?? rows.length} total
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Card pad={false}>
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <div className="filter-bar">
              <div className="search-inline" style={{ position: 'relative' }}>
                <Icon name="filter" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--ink-3)' }} />
                <select className="input" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })} style={{ paddingLeft: 33 }}>
                  <option value="">All statuses</option>
                  <option>Submitted</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
              <input
                type="date"
                className="input"
                value={filters.date}
                onChange={(e) => setFilter({ date: e.target.value })}
                style={{ width: 160 }}
              />
              {seesAll && (
                <input
                  className="input"
                  placeholder="Search name, code, work…"
                  value={filters.search}
                  onChange={(e) => setFilter({ search: e.target.value })}
                  style={{ width: 220 }}
                />
              )}
              <div className="spacer" />
            </div>
          </div>

          {listQ.isLoading ? (
            <div style={{ padding: '16px 20px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-row" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--line)' : 'none' }}>
                  <Skeleton width={32} height={32} radius={10} />
                  <div style={{ flex: 1 }}><Skeleton width={90 + i * 8} height={14} radius={4} /></div>
                  <div style={{ flex: 2 }}><Skeleton width={180} height={14} radius={4} /></div>
                  <div style={{ flex: 0.5 }}><Skeleton width={34} height={14} radius={4} /></div>
                  <div style={{ flex: 0.8 }}><Skeleton width={70} height={22} radius={11} /></div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              loading={false}
              minWidth={seesAll ? 820 : 640}
              emptyLabel="No reports yet"
              emptyHint={seesAll
                ? "Team reports will land here as people wrap up their day."
                : "Hit “Submit today's report” to log your first one."}
            />
          )}
        </Card>
        <Pagination meta={meta} onPage={(page) => setFilter({ page })} />
      </div>

      <EveningReportModal open={modalOpen} onClose={() => setModalOpen(false)} existing={todayReport} />
    </>
  );
}
