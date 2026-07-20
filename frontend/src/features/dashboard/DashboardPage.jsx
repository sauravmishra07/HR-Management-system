import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi, attendanceApi, leaveApi, announcementApi, holidayApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useTheme } from '@/hooks/useTheme';
import { apiError } from '@/lib/axios';
import { fdate, fdateShort, DOW } from '@/utils/format';
import { BRAND, SERIES, alpha, chartTheme } from '@/lib/charts';
import { Card, StatCard, Button, Icon, EmployeeCell, Spinner, Chart } from '@/components/ui';

// Representative weekly attendance %, used only as a graceful fallback until
// real attendance records exist (the trend endpoint returns [] when empty).
const WEEK = [['Mon', 94], ['Tue', 96], ['Wed', 89], ['Thu', 92], ['Fri', 95], ['Sat', 83]];

function LiveClock() {
  const [now, setNow] = useState('--:--:--');
  useEffect(() => {
    const f = () => setNow(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    f();
    const t = setInterval(f, 1000);
    return () => clearInterval(t);
  }, []);
  return <div className="clock" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>{now}</div>;
}

export default function DashboardPage() {
  const { user, empId, can } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const today = new Date();
  const [trendType, setTrendType] = useState('line'); // 'line' | 'bar'

  const overview = useQuery({ queryKey: ['reports', 'overview'], queryFn: reportApi.overview, select: (r) => r.data });
  const trend = useQuery({ queryKey: ['reports', 'attendance-trend'], queryFn: reportApi.attendanceTrend, select: (r) => r.data });
  const attendance = useQuery({ queryKey: ['attendance', 'today'], queryFn: attendanceApi.today, select: (r) => r.data });
  const pending = useQuery({
    queryKey: ['leaves', { status: 'Pending', limit: 4 }],
    queryFn: () => leaveApi.list({ status: 'Pending', limit: 4 }),
    enabled: can('approveLeave'),
    select: (r) => r.data,
  });
  const announcements = useQuery({ queryKey: ['announcements', 'top'], queryFn: () => announcementApi.list({ limit: 3 }), select: (r) => r.data });
  const holidays = useQuery({ queryKey: ['holidays', 'upcoming'], queryFn: holidayApi.upcoming, select: (r) => r.data });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['attendance'] });
    qc.invalidateQueries({ queryKey: ['reports'] });
  };

  const checkIn = useMutation({ mutationFn: () => attendanceApi.checkIn({}), onSuccess: () => { toast('Attendance marked'); invalidate(); }, onError: (e) => toast(apiError(e), 'error') });
  const checkOut = useMutation({ mutationFn: () => attendanceApi.checkOut({}), onSuccess: () => { toast('Checked out'); invalidate(); }, onError: (e) => toast(apiError(e), 'error') });
  const approve = useMutation({ mutationFn: (id) => leaveApi.approve(id), onSuccess: () => { toast('Leave approved'); qc.invalidateQueries({ queryKey: ['leaves'] }); }, onError: (e) => toast(apiError(e), 'error') });
  const reject = useMutation({ mutationFn: (id) => leaveApi.reject(id), onSuccess: () => { toast('Leave rejected'); qc.invalidateQueries({ queryKey: ['leaves'] }); }, onError: (e) => toast(apiError(e), 'error') });

  const s = attendance.data?.summary || { present: 0, absent: 0, leave: 0, notMarked: 0, total: 0 };
  const total = s.total || overview.data?.headcount || 0;
  const pp = (n) => (total ? Math.round((n / total) * 100) : 0);
  const myRow = attendance.data?.rows?.find((r) => r.emp === empId);
  const myIn = myRow?.in;
  const myOut = myRow?.out;

  const theme = chartTheme(isDark);

  /* ----- Attendance trend (real 7-day data, sample fallback) ----- */
  const trendRows = useMemo(() => {
    if (trend.data?.length) {
      return trend.data.map((d) => ({ label: DOW[new Date(d.date).getDay()].slice(0, 3), present: d.present, leave: d.leave }));
    }
    const week = [...WEEK, ['Sun', pp(s.present)]];
    return week.map(([label, pct]) => ({
      label,
      present: Math.round((total * pct) / 100),
      leave: Math.max(0, Math.round((total * (100 - pct)) / 100 / 3)),
    }));
  }, [trend.data, total, s.present]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBar = trendType === 'bar';
  const trendData = useMemo(() => ({
    labels: trendRows.map((r) => r.label),
    datasets: [
      {
        label: 'Present',
        data: trendRows.map((r) => r.present),
        borderColor: BRAND.blue,
        backgroundColor: isBar ? alpha(BRAND.blue, 0.9) : alpha(BRAND.blue, 0.16),
        borderWidth: 2,
        fill: !isBar,
        tension: 0.38,
        pointRadius: isBar ? 0 : 3,
        pointBackgroundColor: BRAND.blue,
        borderRadius: 6,
        maxBarThickness: 26,
      },
      {
        label: 'On leave',
        data: trendRows.map((r) => r.leave),
        borderColor: BRAND.cyan,
        backgroundColor: isBar ? alpha(BRAND.cyan, 0.85) : alpha(BRAND.cyan, 0.3),
        borderWidth: 2,
        fill: !isBar,
        tension: 0.38,
        pointRadius: isBar ? 0 : 3,
        pointBackgroundColor: BRAND.cyan,
        borderRadius: 6,
        maxBarThickness: 26,
      },
    ],
  }), [trendRows, isBar]);

  const trendOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { position: 'top', align: 'end', labels: { color: theme.text, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 16, font: { weight: '600' } } },
      tooltip: { backgroundColor: theme.tooltipBg, titleColor: '#fff', bodyColor: '#fff', padding: 10, cornerRadius: 8, displayColors: true, boxPadding: 4 },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: theme.text, font: { weight: '600' } } },
      y: { beginAtZero: true, grid: { color: theme.grid }, border: { display: false }, ticks: { color: theme.text, precision: 0, maxTicksLimit: 5 } },
    },
  }), [theme]);

  /* ----- Headcount by department (bar) ----- */
  const byDept = overview.data?.byDept || [];
  const deptData = useMemo(() => ({
    labels: byDept.map((d) => d.dept),
    datasets: [{
      label: 'Employees',
      data: byDept.map((d) => d.count),
      backgroundColor: byDept.map((_, i) => alpha(SERIES[i % SERIES.length], 0.9)),
      borderRadius: 7,
      maxBarThickness: 34,
    }],
  }), [byDept]);

  const deptOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: theme.tooltipBg, titleColor: '#fff', bodyColor: '#fff', padding: 10, cornerRadius: 8, callbacks: { label: (c) => ` ${c.parsed.y} employees` } },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: theme.text, font: { weight: '600' }, autoSkip: false, maxRotation: 40, minRotation: 0 } },
      y: { beginAtZero: true, grid: { color: theme.grid }, border: { display: false }, ticks: { color: theme.text, precision: 0, maxTicksLimit: 6 } },
    },
  }), [theme]);

  /* ----- Workforce split (doughnut) ----- */
  const g = overview.data?.byGender || { M: 0, F: 0, O: 0 };
  const genderTotal = (g.M || 0) + (g.F || 0) + (g.O || 0);
  const genderData = useMemo(() => ({
    labels: ['Male', 'Female', 'Other'],
    datasets: [{
      data: [g.M || 0, g.F || 0, g.O || 0],
      backgroundColor: [BRAND.blue, BRAND.cyan, BRAND.navy],
      borderColor: isDark ? '#151e30' : '#ffffff',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }), [g.M, g.F, g.O, isDark]);

  const genderOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: { position: 'bottom', labels: { color: theme.text, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 14, font: { weight: '600' } } },
      tooltip: { backgroundColor: theme.tooltipBg, titleColor: '#fff', bodyColor: '#fff', padding: 10, cornerRadius: 8, callbacks: { label: (c) => ` ${c.label}: ${c.parsed} (${genderTotal ? Math.round((c.parsed / genderTotal) * 100) : 0}%)` } },
    },
  }), [theme, genderTotal]);

  return (
    <>
      {/* Today strip */}
      <div className="today-strip">
        <div className="ts-date">
          <div className="dow" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.8 }}>
            {DOW[today.getDay()]}
          </div>
          <div className="dt" style={{ fontFamily: 'var(--font-disp)', fontWeight: 800, fontSize: 26, letterSpacing: '-.5px', lineHeight: 1.15 }}>
            {today.getDate()} {today.toLocaleString('en', { month: 'long' })} {today.getFullYear()}
          </div>
          <LiveClock />
        </div>

        <div className="pulse-wrap" style={{ minWidth: 0 }}>
          <div className="pulse-lbls" style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 700, marginBottom: 8, flexWrap: 'wrap' }}>
            <span><i style={{ background: '#fff', width: 9, height: 9, borderRadius: 3, display: 'inline-block', marginRight: 6 }} />Present {s.present}</span>
            <span><i style={{ background: '#95CCDD', width: 9, height: 9, borderRadius: 3, display: 'inline-block', marginRight: 6 }} />On leave {s.leave}</span>
            <span><i style={{ background: 'rgba(13,42,88,.55)', width: 9, height: 9, borderRadius: 3, display: 'inline-block', marginRight: 6 }} />Absent {s.absent}</span>
          </div>
          <div className="pulse-bar">
            <div className="pb-present" style={{ width: `${pp(s.present)}%` }} />
            <div className="pb-leave" style={{ width: `${pp(s.leave)}%` }} />
            <div className="pb-absent" style={{ width: `${pp(s.absent)}%` }} />
          </div>
          <div className="pulse-sub" style={{ fontSize: 11.5, opacity: 0.8, marginTop: 7, fontWeight: 600 }}>
            Company pulse — {pp(s.present)}% of {total} people are in today
          </div>
        </div>

        <div className="ts-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1 }}>
          {myIn && !myOut ? (
            <Button variant="white" icon="logout" loading={checkOut.isPending} onClick={() => checkOut.mutate()}>
              Check out · in at {myIn}
            </Button>
          ) : myOut ? (
            <Button variant="white" icon="check" disabled>
              Day done · {myIn}–{myOut}
            </Button>
          ) : (
            <Button variant="white" icon="login" loading={checkIn.isPending} onClick={() => checkIn.mutate()}>
              Mark my attendance
            </Button>
          )}
          <Button variant="glass" icon="cal" onClick={() => navigate('/leaves')}>
            Apply for leave
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-stats">
        <StatCard label="Total employees" icon="users" value={total} trend={<><b>+2</b> this quarter</>} />
        <StatCard label="Present today" icon="login" value={s.present} unit={`/ ${total}`} trend={`${pp(s.present)}% attendance`} />
        <StatCard
          label="Pending approvals"
          icon="inbox"
          value={(overview.data?.leavePending || 0) + (overview.data?.expensePending?.count || 0)}
          trend={`${overview.data?.leavePending || 0} leave · ${overview.data?.expensePending?.count || 0} expense`}
        />
        <StatCard label="Payroll / month" icon="banknote" value={`₹${((overview.data?.payrollMonthly || 0) / 100000).toFixed(1)}L`} trend={`${overview.data?.deptCount || 0} departments`} />
      </div>

      {/* Analytics row — Chart.js */}
      <div className="dash-charts">
        <Card
          title="Attendance trend"
          sub="last 7 days"
          action={
            <div className="seg" role="tablist" aria-label="Chart type">
              <button className={`seg-btn ${!isBar ? 'on' : ''}`} onClick={() => setTrendType('line')} aria-selected={!isBar}>
                <Icon name="chart" width={13} height={13} /> Line
              </button>
              <button className={`seg-btn ${isBar ? 'on' : ''}`} onClick={() => setTrendType('bar')} aria-selected={isBar}>
                <Icon name="grid" width={13} height={13} /> Bar
              </button>
            </div>
          }
        >
          <Chart type={trendType} data={trendData} options={trendOptions} height={288} ariaLabel="Attendance trend over the last seven days" />
        </Card>

        <Card title="Workforce split" sub="by gender">
          {overview.isLoading ? (
            <Spinner />
          ) : genderTotal ? (
            <div className="doughnut-wrap">
              <Chart type="doughnut" data={genderData} options={genderOptions} height={230} ariaLabel="Workforce split by gender" />
              <div className="doughnut-center">
                <b>{genderTotal}</b>
                <span>people</span>
              </div>
            </div>
          ) : (
            <div className="empty"><Icon name="users" width={34} height={34} /><b>No data yet</b><p>Add employees to see the split.</p></div>
          )}
        </Card>
      </div>

      {/* Headcount by department — Chart.js bar */}
      <Card title="Headcount by department" sub="active employees" className="dash-dept">
        {overview.isLoading ? (
          <Spinner />
        ) : byDept.length ? (
          <Chart type="bar" data={deptData} options={deptOptions} height={260} ariaLabel="Employee headcount by department" />
        ) : (
          <div className="empty"><Icon name="building" width={34} height={34} /><b>No departments yet</b><p>Headcount will appear once employees are added.</p></div>
        )}
      </Card>

      {/* Two-column — approvals + org feed */}
      <div className="dash-lower">
        {can('approveLeave') && (
          <Card title="Leave requests waiting for you" action={<span className="link" onClick={() => navigate('/leaves')}>View all</span>}>
            {pending.isLoading ? (
              <Spinner />
            ) : pending.data?.length ? (
              <div className="tbl-wrap" style={{ marginTop: 8 }}>
                <table className="data" style={{ minWidth: 520 }}>
                  <tbody>
                    {pending.data.map((l) => (
                      <tr key={l._id}>
                        <td><EmployeeCell employee={l.employee} empId={l.emp} /></td>
                        <td>
                          <div className="cell-main">{l.type} · {l.days}d</div>
                          <div className="cell-sub">{fdateShort(l.from)} → {fdateShort(l.to)}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <Button size="sm" icon="check" onClick={() => approve.mutate(l._id)}>Approve</Button>
                            <Button size="sm" variant="slate" onClick={() => reject.mutate(l._id)}>Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty"><Icon name="check" width={38} height={38} /><b>Nothing pending</b><p>All leave requests are cleared.</p></div>
            )}
          </Card>
        )}

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Card title="Announcements" action={<span className="link" onClick={() => navigate('/announcements')}>All</span>}>
            <div style={{ marginTop: 6 }}>
              {(announcements.data || []).map((a) => (
                <div className="list-row" key={a._id}>
                  <span className="lr-ico"><Icon name="mega" width={16} height={16} /></span>
                  <div className="lr-main">
                    <b>{a.title}</b>
                    <span>{fdate(a.date)} · {a.by}</span>
                  </div>
                  {a.pin && <span className="chip chip-sky">Pinned</span>}
                </div>
              ))}
              {!announcements.data?.length && <p style={{ color: 'var(--ink-3)', fontSize: 12.5, padding: '8px 0' }}>No announcements yet.</p>}
            </div>
          </Card>

          <Card title="Upcoming holidays">
            <div style={{ marginTop: 6 }}>
              {(holidays.data || []).map((h) => (
                <div className="list-row" key={h._id || h.date}>
                  <span className="lr-ico"><Icon name="sun" width={16} height={16} /></span>
                  <div className="lr-main">
                    <b>{h.name}</b>
                    <span>{fdate(h.date)} · {DOW[new Date(h.date).getDay()]}</span>
                  </div>
                </div>
              ))}
              {!holidays.data?.length && <p style={{ color: 'var(--ink-3)', fontSize: 12.5, padding: '8px 0' }}>No upcoming holidays.</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
