import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { leaveApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, fdateShort } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, Chip, DataTable, Pagination, EmployeeCell, useConfirm,
} from '@/components/ui';
import LeaveApplyModal from './LeaveApplyModal';

const BALANCE_CARDS = [
  ['Casual leave', 'CL', 'cal'],
  ['Sick leave', 'SL', 'clock'],
  ['Earned leave', 'EL', 'gift'],
];

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

export default function LeavesPage() {
  const { empId, can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const canApprove = can('approveLeave');

  const [filters, setFilters] = useState({ status: '', type: '', page: 1 });
  const [applyOpen, setApplyOpen] = useState(false);

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const balanceQ = useQuery({
    queryKey: ['leaves', 'balance'],
    queryFn: () => leaveApi.balance(),
    select: (r) => r.data,
  });

  const params = { status: filters.status, type: filters.type, page: filters.page, limit: 12 };
  const listQ = useQuery({
    queryKey: ['leaves', params],
    queryFn: () => leaveApi.list(params),
    placeholderData: keepPreviousData,
  });

  const rows = listQ.data?.data || [];
  const meta = listQ.data?.meta;

  const approve = useMutation({
    mutationFn: (id) => leaveApi.approve(id),
    onSuccess: () => { toast('Leave approved'); qc.invalidateQueries({ queryKey: ['leaves'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const reject = useMutation({
    mutationFn: (id) => leaveApi.reject(id),
    onSuccess: () => { toast('Leave rejected'); qc.invalidateQueries({ queryKey: ['leaves'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const withdraw = useMutation({
    mutationFn: (id) => leaveApi.remove(id),
    onSuccess: () => { toast('Leave withdrawn'); qc.invalidateQueries({ queryKey: ['leaves'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const askWithdraw = async (l) => {
    const ok = await confirm({
      title: 'Withdraw leave?',
      message: `Withdraw your ${l.type} request ${l.code}? This can't be undone.`,
      okLabel: 'Withdraw',
      danger: true,
    });
    if (ok) withdraw.mutate(l._id);
  };

  const b = balanceQ.data || { CL: 0, SL: 0, EL: 0, used: {} };

  /* ── Compute overall stats ── */
  const pendingCount = rows.filter((r) => r.status === 'Pending').length;
  const approvedCount = rows.filter((r) => r.status === 'Approved').length;
  const rejectedCount = rows.filter((r) => r.status === 'Rejected').length;

  const columns = [
    { key: 'emp', header: 'Employee', render: (l) => <EmployeeCell employee={l.employee} empId={l.emp} /> },
    { key: 'type', header: 'Type', render: (l) => <b>{l.type}</b> },
    {
      key: 'dates',
      header: 'Dates',
      render: (l) => (
        <div>
          <div className="cell-main">{fdateShort(l.from)} → {fdateShort(l.to)}</div>
          <div className="cell-sub">applied {fdate(l.applied)}</div>
        </div>
      ),
    },
    { key: 'days', header: 'Days', render: (l) => <b>{l.days}</b> },
    {
      key: 'reason',
      header: 'Reason',
      width: 220,
      render: (l) => (
        <span className="cell-sub" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{l.reason || '—'}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (l) => <Chip status={l.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (l) => {
        const isPending = l.status === 'Pending';
        if (canApprove && isPending) {
          const busyA = approve.isPending && approve.variables === l._id;
          const busyR = reject.isPending && reject.variables === l._id;
          return (
            <div className="action-btns">
              <Button size="sm" icon="check" loading={busyA} onClick={() => approve.mutate(l._id)}>Approve</Button>
              <Button size="sm" variant="slate" loading={busyR} onClick={() => reject.mutate(l._id)}>Reject</Button>
            </div>
          );
        }
        if (isPending && l.emp === empId) {
          const busyW = withdraw.isPending && withdraw.variables === l._id;
          return (
            <div className="action-btns">
              <Button size="sm" variant="ghost" icon="trash" loading={busyW} onClick={() => askWithdraw(l)}>Withdraw</Button>
            </div>
          );
        }
        return <span className="cell-sub mono">{l.code}</span>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Leave Management"
        hint={canApprove
          ? 'Apply in three fields — type, dates, reason. Approvals happen right here with one tap.'
          : 'Check your balance and apply for leave in three fields — type, dates, reason.'}
        actions={<Button icon="plus" onClick={() => setApplyOpen(true)}>Apply for leave</Button>}
      />

      {/* ── Balance cards with gradient progress ── */}
      {balanceQ.isLoading ? (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[...Array(3)].map((_, i) => (
            <div className="card stat" key={i}>
              <div className="lbl"><Skeleton width={100} height={12} /></div>
              <div className="num" style={{ marginTop: 8 }}><Skeleton width={80} height={28} radius={6} /></div>
              <div style={{ marginTop: 10 }}><Skeleton height={8} radius={6} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {BALANCE_CARDS.map(([label, key, iconName], i) => {
            const remaining = b[key] || 0;
            const used = b.used?.[key] || 0;
            const quota = remaining + used;
            const width = quota ? Math.round((remaining / quota) * 100) : 0;
            return (
              <div key={key} className="card stat balance-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="lbl"><Icon name={iconName} width={14} height={14} />{label}</div>
                <div className="num">{remaining}<small> / {quota} left</small></div>
                <div className="progress balance-progress" style={{ marginTop: 10 }}>
                  <i style={{
                    width: `${width}%`,
                    background: width > 50
                      ? 'linear-gradient(90deg, var(--blue), #3e86f2)'
                      : width > 20
                        ? 'linear-gradient(90deg, #f0b429, #f59e0b)'
                        : 'linear-gradient(90deg, #e04a4a, #c0392b)',
                  }} />
                </div>
                <div className="trend" style={{ marginTop: 4, fontSize: 11 }}>
                  {used > 0 ? `${used} used` : 'none used yet'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Summary strip ── */}
      {!listQ.isLoading && rows.length > 0 && (
        <div className="leave-summary-strip">
          <div className="leave-summary-item">
            <span className="leave-summary-dot" style={{ background: 'var(--line-2)' }} />
            <span>Pending: <b>{pendingCount}</b></span>
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
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
              <select className="input" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
                <option value="">All types</option>
                <option>Casual</option>
                <option>Sick</option>
                <option>Earned</option>
              </select>
              <div className="spacer" />
            </div>
          </div>

          {listQ.isLoading ? (
            <div style={{ padding: '16px 20px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-row" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--line)' : 'none' }}>
                  <Skeleton width={32} height={32} radius={10} />
                  <div style={{ flex: 1.5 }}><Skeleton width={100 + i * 10} height={14} radius={4} /></div>
                  <div style={{ flex: 0.8 }}><Skeleton width={50} height={14} radius={4} /></div>
                  <div style={{ flex: 1.5 }}><Skeleton width={110} height={14} radius={4} /></div>
                  <div style={{ flex: 0.5 }}><Skeleton width={30} height={14} radius={4} /></div>
                  <div style={{ flex: 1.2 }}><Skeleton width={80} height={14} radius={4} /></div>
                  <div style={{ flex: 0.8 }}><Skeleton width={60} height={14} radius={4} /></div>
                  <div style={{ flex: 1.2, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <Skeleton width={68} height={28} radius={8} />
                    <Skeleton width={56} height={28} radius={8} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              loading={false}
              minWidth={820}
              emptyLabel="Nothing here yet"
              emptyHint={canApprove ? 'New applications will appear here.' : 'Your leave applications will appear here.'}
            />
          )}
        </Card>
        <Pagination meta={meta} onPage={(page) => setFilter({ page })} />
      </div>

      <LeaveApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </>
  );
}

