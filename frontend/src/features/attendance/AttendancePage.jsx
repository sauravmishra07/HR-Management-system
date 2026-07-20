import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, employeeApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, fmonth, currentMonth, todayISO, DOW } from '@/utils/format';
import {
  PageHeader, Card, Button, Chip, StatCard, DataTable, EmployeeCell, Spinner, Icon,
} from '@/components/ui';

const WEEK_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COUNT_LABELS = { P: 'Present', A: 'Absent', L: 'On leave', W: 'Week off', H: 'Holiday' };

const LEGEND = [
  { label: 'Present', style: { background: 'var(--blue)' } },
  { label: 'On leave', style: { background: 'var(--blue-deep)' } },
  { label: 'Absent', style: { background: 'var(--slate)' } },
  { label: 'Week off', style: { border: '1px solid var(--line-2)', background: 'transparent' } },
  { label: 'Holiday', style: { background: 'var(--blue-deep)' } },
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

export default function AttendancePage() {
  const { user, empId, can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const canManage = can('manageEmployee');
  const today = new Date();

  const [month, setMonth] = useState(currentMonth());
  const [selEmp, setSelEmp] = useState(empId || '');

  const todayQ = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: attendanceApi.today,
    select: (r) => r.data,
  });
  const directory = useQuery({
    queryKey: ['employees', 'directory'],
    queryFn: employeeApi.directory,
    select: (r) => r.data,
    enabled: canManage,
  });
  const monthQ = useQuery({
    queryKey: ['attendance', 'month', { empId: selEmp, month }],
    queryFn: () => attendanceApi.month({ empId: selEmp, month }),
    select: (r) => r.data,
    enabled: Boolean(selEmp && month),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['attendance'] });
    qc.invalidateQueries({ queryKey: ['reports'] });
  };

  const checkIn = useMutation({
    mutationFn: (emp) => attendanceApi.checkIn({ empId: emp }),
    onSuccess: () => { toast('Checked in'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const checkOut = useMutation({
    mutationFn: (emp) => attendanceApi.checkOut({ empId: emp }),
    onSuccess: () => { toast('Checked out'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const mark = useMutation({
    mutationFn: ({ emp, status }) => attendanceApi.mark({ empId: emp, status }),
    onSuccess: () => { toast('Attendance updated'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const rows = todayQ.data?.rows || [];
  const s = todayQ.data?.summary || { present: 0, absent: 0, leave: 0, notMarked: 0, total: 0 };
  const total = s.total || 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const columns = [
    { key: 'emp', header: 'Employee', render: (r) => <EmployeeCell employee={r.employee} empId={r.emp} /> },
    {
      key: 'st',
      header: 'Status',
      render: (r) => (r.st ? <Chip status={r.st} /> : <span className="chip chip-line">Not marked</span>),
    },
    { key: 'in', header: 'Check-in', render: (r) => <span className="mono">{r.in || '—'}</span> },
    { key: 'out', header: 'Check-out', render: (r) => <span className="mono">{r.out || '—'}</span> },
  ];

  if (canManage) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => {
        const busyIn = checkIn.isPending && checkIn.variables === r.emp;
        const busyOut = checkOut.isPending && checkOut.variables === r.emp;
        const busyMark = mark.isPending && mark.variables?.emp === r.emp;
        return (
          <div className="action-btns">
            {!r.st && (
              <>
                <Button size="sm" icon="login" loading={busyIn} onClick={() => checkIn.mutate(r.emp)}>Check in</Button>
                <Button size="sm" variant="slate" loading={busyMark} onClick={() => mark.mutate({ emp: r.emp, status: 'A' })}>Absent</Button>
              </>
            )}
            {r.st === 'P' && !r.out && (
              <Button size="sm" variant="soft" icon="logout" loading={busyOut} onClick={() => checkOut.mutate(r.emp)}>Check out</Button>
            )}
            {r.st === 'A' && (
              <Button size="sm" variant="ghost" loading={busyMark} onClick={() => mark.mutate({ emp: r.emp, status: 'P' })}>Mark present</Button>
            )}
            {r.st === 'L' && (
              <Button size="sm" variant="ghost" loading={busyMark} onClick={() => mark.mutate({ emp: r.emp, status: 'P' })}>Mark present</Button>
            )}
            {r.st === 'P' && r.out && <span className="chip chip-sky">day done</span>}
          </div>
        );
      },
    });
  }

  const days = monthQ.data?.days || [];
  const counts = monthQ.data?.counts || {};
  const [my, mm] = month.split('-').map(Number);
  const firstOffset = my && mm ? new Date(my, mm - 1, 1).getDay() : 0;

  return (
    <>
      <PageHeader
        title="Attendance"
        hint={canManage
          ? "Mark today's in and out with one tap. The month view shows the full register for any employee."
          : 'Mark your in and out with one tap and review your month at a glance.'}
        actions={<span className="chip chip-sky">{DOW[today.getDay()]}, {fdate(todayISO())}</span>}
      />

      {/* ── Today's summary stats with animated progress bars ── */}
      {todayQ.isLoading ? (
        <div className="reports-grid reports-grid-stats">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card stat">
              <div className="lbl"><Skeleton width={70} height={12} /></div>
              <div className="num" style={{ marginTop: 8 }}><Skeleton width={50} height={28} radius={6} /></div>
              <div className="trend" style={{ marginTop: 8 }}><Skeleton width={90} height={11} radius={4} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="reports-grid reports-grid-stats">
          <div className="stat-card-anim" style={{ animationDelay: '0s' }}>
            <div className="card stat">
              <div className="lbl"><Icon name="login" width={14} height={14} />Present</div>
              <div className="num" style={{ color: 'var(--blue)' }}>{s.present}<small> / {total}</small></div>
              <div className="trend"><b>{pct(s.present)}%</b> of team</div>
              <div className="mini-prog" style={{ marginTop: 8 }}><i style={{ width: `${pct(s.present)}%` }} /></div>
            </div>
          </div>
          <div className="stat-card-anim" style={{ animationDelay: '0.06s' }}>
            <div className="card stat">
              <div className="lbl"><Icon name="cal" width={14} height={14} />On leave</div>
              <div className="num">{s.leave}</div>
              <div className="trend">approved leaves today</div>
              <div className="mini-prog" style={{ marginTop: 8 }}><i style={{ width: `${pct(s.leave)}%`, background: 'var(--blue-deep)' }} /></div>
            </div>
          </div>
          <div className="stat-card-anim" style={{ animationDelay: '0.12s' }}>
            <div className="card stat">
              <div className="lbl"><Icon name="logout" width={14} height={14} />Absent</div>
              <div className="num">{s.absent}</div>
              <div className="trend">no leave applied</div>
              <div className="mini-prog" style={{ marginTop: 8 }}><i style={{ width: `${pct(s.absent)}%`, background: 'var(--slate)' }} /></div>
            </div>
          </div>
          <div className="stat-card-anim" style={{ animationDelay: '0.18s' }}>
            <div className="card stat">
              <div className="lbl"><Icon name="clock" width={14} height={14} />Not marked</div>
              <div className="num">{s.notMarked}</div>
              <div className="trend">waiting for check-in</div>
              <div className="mini-prog" style={{ marginTop: 8 }}><i style={{ width: `${pct(s.notMarked)}%`, background: 'var(--line-2)' }} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="attendance-grid" style={{ marginTop: 18, alignItems: 'start' }}>
        <Card pad={false}>
          <div className="card-pad" style={{ paddingBottom: 10 }}>
            <div className="card-title">
              <span>Today&apos;s register <span className="sub" style={{ marginLeft: 8 }}>one tap to check in or out</span></span>
            </div>
          </div>
          {todayQ.isLoading ? (
            <div style={{ padding: '16px 20px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-row" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 0', borderBottom: i < 3 ? '1px solid var(--line)' : 'none' }}>
                  <Skeleton width={32} height={32} radius={10} />
                  <div style={{ flex: 2 }}><Skeleton width={100 + i * 15} height={14} radius={4} /></div>
                  <div style={{ flex: 1 }}><Skeleton width={60} height={14} radius={4} /></div>
                  <div style={{ flex: 0.8 }}><Skeleton width={50} height={14} radius={4} /></div>
                  <div style={{ flex: 0.8 }}><Skeleton width={50} height={14} radius={4} /></div>
                  <div style={{ flex: 1.2, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <Skeleton width={72} height={28} radius={8} />
                    <Skeleton width={60} height={28} radius={8} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              loading={false}
              minWidth={640}
              emptyLabel="Nobody to show"
              emptyHint="No active employees found for today."
            />
          )}
        </Card>

        <Card title="Month view" sub={fmonth(month)}>
          <div className="filter-bar" style={{ margin: '4px 0 14px' }}>
            <input
              type="month"
              className="input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <select
              className="input"
              style={{ flex: 1 }}
              value={selEmp}
              disabled={!canManage}
              onChange={(e) => setSelEmp(e.target.value)}
            >
              {canManage
                ? (directory.data || []).map((emp) => (
                    <option key={emp.empId} value={emp.empId}>{emp.name}</option>
                  ))
                : <option value={empId}>{user?.name || empId}</option>}
            </select>
          </div>

          {monthQ.isLoading ? (
            <div style={{ padding: '20px 0' }}>
              <div className="minical">
                {WEEK_HEADERS.map((h) => <div className="mc-h" key={h}>{h}</div>)}
                {Array.from({ length: firstOffset }).map((_, i) => <div key={`blank-${i}`} />)}
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="mc-d" style={{ borderColor: 'var(--line)', background: 'var(--sky-3)' }}>
                    <Skeleton width={14} height={14} radius="50%" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="minical">
                {WEEK_HEADERS.map((h) => <div className="mc-h" key={h}>{h}</div>)}
                {Array.from({ length: firstOffset }).map((_, i) => <div key={`blank-${i}`} />)}
                {days.map((d) => (
                  <div
                    key={d.date}
                    className={`mc-d mc-${d.st || 'F'}`}
                    title={`${fdate(d.date)} — ${COUNT_LABELS[d.st] || d.st || 'Future'}`}
                  >
                    {Number(d.date.slice(8, 10))}<i />
                  </div>
                ))}
              </div>

              <div className="legend-row">
                {LEGEND.map((l) => (
                  <span key={l.label} className="legend-item">
                    <i style={{ width: 10, height: 10, borderRadius: 3, display: 'inline-block', ...l.style }} />
                    {l.label}
                  </span>
                ))}
              </div>

              {Object.entries(counts).length > 0 && (
                <div className="count-chips">
                  {Object.entries(counts).map(([k, v]) => (
                    <span key={k} className="chip chip-line">{COUNT_LABELS[k] || k}: {v}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}

