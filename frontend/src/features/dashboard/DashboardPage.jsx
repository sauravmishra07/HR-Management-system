import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi, attendanceApi, leaveApi, announcementApi, holidayApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, fdateShort, DOW } from '@/utils/format';
import { Card, StatCard, Button, Icon, EmployeeCell, Spinner } from '@/components/ui';

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
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const today = new Date();

  const overview = useQuery({ queryKey: ['reports', 'overview'], queryFn: reportApi.overview, select: (r) => r.data });
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

  const week = [...WEEK, ['Sun', pp(s.present)]];

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
            <span><i style={{ background: '#9EC2FF', width: 9, height: 9, borderRadius: 3, display: 'inline-block', marginRight: 6 }} />On leave {s.leave}</span>
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

      {/* Two-column */}
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginTop: 18 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Card title="This week's attendance" sub="% present per day">
            <div className="bars-v" style={{ marginTop: 18 }}>
              {week.map(([d, v]) => (
                <div className="bv" key={d}>
                  <div className="bar" style={{ height: `${v}%` }}>
                    <span className="val">{v}</span>
                  </div>
                  <span className="lbl">{d}</span>
                </div>
              ))}
            </div>
          </Card>

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
        </div>

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
