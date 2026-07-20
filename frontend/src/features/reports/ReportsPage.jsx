import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api';
import { money, fdateShort, DOW } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import {
  PageHeader, Card, Button, StatCard, Spinner, Icon,
} from '@/components/ui';

const GENDER = [
  ['M', 'Male', '#1465E0'],
  ['F', 'Female', '#0A3D91'],
  ['O', 'Other', '#9EC2FF'],
];

/* ─── Skeleton placeholder for loading state ─── */
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

/* ─── Mini sparkline bar for attendance ─── */
function SparkBar({ value, max, color }) {
  return (
    <div style={{
      width: 4, height: `${(value / max) * 100}%`, minHeight: 3,
      borderRadius: 3, background: color,
      transition: 'height 0.5s ease',
    }} />
  );
}

export default function ReportsPage() {
  const overview = useQuery({ queryKey: ['reports', 'overview'], queryFn: reportApi.overview, select: (r) => r.data });
  const headcount = useQuery({ queryKey: ['reports', 'headcount'], queryFn: reportApi.headcount, select: (r) => r.data });
  const salaryBands = useQuery({ queryKey: ['reports', 'salaryBands'], queryFn: reportApi.salaryBands, select: (r) => r.data });
  const trend = useQuery({ queryKey: ['reports', 'attendanceTrend'], queryFn: reportApi.attendanceTrend, select: (r) => r.data });

  const o = overview.data;
  const hc = headcount.data || [];
  const bands = salaryBands.data || [];
  const days = trend.data || [];

  const maxHead = Math.max(1, ...hc.map((d) => d.count));
  const maxBand = Math.max(1, ...bands.map((b) => b.count));
  const maxTrend = Math.max(1, ...days.map((d) => Math.max(d.present, d.absent, d.leave)));

  const byGender = o?.byGender || { M: 0, F: 0, O: 0 };
  const genderTotal = byGender.M + byGender.F + byGender.O;
  const C = 2 * Math.PI * 40;
  let acc = 0;
  const donutSegs = GENDER.filter(([k]) => byGender[k] > 0).map(([k, , color]) => {
    const len = genderTotal ? (byGender[k] / genderTotal) * C : 0;
    const seg = (
      <circle
        key={k}
        cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc}
        transform="rotate(-90 50 50)"
        className="donut-seg"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    );
    acc += len;
    return seg;
  });

  const exportHeadcount = () => {
    downloadCSV('headcount-by-department', hc.map((d) => ({ Department: d.dept, Headcount: d.count })));
  };

  const loading = overview.isLoading || headcount.isLoading || salaryBands.isLoading || trend.isLoading;

  return (
    <>
      <PageHeader
        title="Reports"
        hint="The numbers that matter, ready-made. Export the headcount table as CSV for Excel."
        actions={
          <Button
            variant="primary"
            icon="download"
            onClick={exportHeadcount}
            disabled={!hc.length}
            className={hc.length ? 'btn-pulse' : ''}
          >
            Export CSV
          </Button>
        }
      />

      {loading ? (
        <>
          {/* ── Loading skeleton ── */}
          <div className="reports-grid reports-grid-stats">
            {[...Array(6)].map((_, i) => (
              <div className="card stat" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="lbl"><Skeleton width={80} height={12} /></div>
                <div className="num" style={{ marginTop: 8 }}>
                  <Skeleton width={i === 0 ? 70 : i === 3 ? 90 : 50} height={28} radius={6} />
                </div>
                <div className="trend" style={{ marginTop: 8 }}>
                  <Skeleton width={i % 2 === 0 ? 100 : 120} height={11} radius={4} />
                </div>
              </div>
            ))}
          </div>

          <div className="reports-grid reports-grid-charts" style={{ marginTop: 18 }}>
            {[...Array(4)].map((_, i) => (
              <div className="card card-pad" key={i}>
                <div className="card-title" style={{ marginBottom: 14 }}>
                  <Skeleton width={140 + i * 20} height={16} radius={6} />
                </div>
                {i === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...Array(5)].map((_, j) => (
                      <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Skeleton width={80 + j * 15} height={12} radius={4} />
                          <Skeleton width={24} height={12} radius={4} />
                        </div>
                        <Skeleton height={9} radius={6} />
                      </div>
                    ))}
                  </div>
                ) : i === 1 ? (
                  <div className="bars-v" style={{ height: 150 }}>
                    {[...Array(4)].map((_, j) => (
                      <div className="bv" key={j} style={{ justifyContent: 'flex-end' }}>
                        <div className="bar shimmer" style={{ height: `${30 + j * 18}%`, background: 'var(--sky-2)' }} />
                        <Skeleton width={30} height={10} radius={4} style={{ marginTop: 7 }} />
                      </div>
                    ))}
                  </div>
                ) : i === 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...Array(3)].map((_, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Skeleton width={80} height={12} radius={4} />
                        <Skeleton width={40} height={12} radius={4} />
                        <Skeleton width={40} height={12} radius={4} />
                        <Skeleton width={50} height={12} radius={4} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <Skeleton width={110} height={110} radius="50%" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[...Array(3)].map((_, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Skeleton width={14} height={14} radius={4} />
                          <Skeleton width={50} height={12} radius={4} />
                          <Skeleton width={24} height={12} radius={4} style={{ marginLeft: 'auto' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* ── Stat cards row ── */}
          <div className="reports-grid reports-grid-stats">
            <div className="stat-card-anim" style={{ animationDelay: '0s' }}>
              <StatCard label="Headcount" icon="users" value={o?.headcount ?? '—'} trend={`${o?.deptCount ?? 0} departments`} />
            </div>
            <div className="stat-card-anim" style={{ animationDelay: '0.06s' }}>
              <StatCard label="Departments" icon="building" value={o?.deptCount ?? '—'} />
            </div>
            <div className="stat-card-anim" style={{ animationDelay: '0.12s' }}>
              <StatCard label="Average salary" icon="banknote" value={o ? money(o.avgSalary) : '—'} trend="monthly gross" />
            </div>
            <div className="stat-card-anim" style={{ animationDelay: '0.18s' }}>
              <StatCard label="Payroll / month" icon="banknote" value={o ? money(o.payrollMonthly) : '—'} trend="active employees" />
            </div>
            <div className="stat-card-anim" style={{ animationDelay: '0.24s' }}>
              <StatCard label="Leaves pending" icon="cal" value={o?.leavePending ?? '—'} trend="awaiting approval" />
            </div>
            <div className="stat-card-anim" style={{ animationDelay: '0.3s' }}>
              <StatCard label="Expenses pending" icon="receipt" value={o?.expensePending?.count ?? '—'} trend={o ? money(o.expensePending?.amount || 0) : ''} />
            </div>
          </div>

          {/* ── Charts grid ── */}
          <div className="reports-grid reports-grid-charts" style={{ marginTop: 18, alignItems: 'start' }}>
            {/* ── Headcount by department ── */}
            <Card title="Headcount by department" sub="active employees">
              {hc.length ? (
                <div className="bars-h" style={{ marginTop: 14 }}>
                  {hc.map((d, i) => (
                    <div className="bh" key={d.dept} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="bh-top">
                        <span className="bh-label">{d.dept}</span>
                        <span className="bh-count">{d.count}</span>
                      </div>
                      <div className="track">
                        <div
                          className="fill"
                          style={{
                            width: `${(d.count / maxHead) * 100}%`,
                            background: i % 2 === 0
                              ? 'linear-gradient(90deg, var(--blue), #3e86f2)'
                              : 'linear-gradient(90deg, var(--blue-deep), var(--blue))',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Icon name="users" width={34} height={34} />
                  <b>No headcount data</b>
                  <p>Headcount distribution will appear once employees are added to departments.</p>
                </div>
              )}
            </Card>

            {/* ── Salary bands ── */}
            <Card title="Salary bands" sub="monthly gross buckets">
              {bands.length ? (
                <div className="bars-v" style={{ marginTop: 18, height: 170 }}>
                  {bands.map((b, i) => (
                    <div className="bv" key={b.band} style={{ animationDelay: `${i * 0.08}s` }}>
                      <div
                        className="bar"
                        style={{
                          height: `${(b.count / maxBand) * 100}%`,
                          background: `linear-gradient(180deg, ${i % 2 === 0 ? 'var(--blue)' : '#3e86f2'}, var(--blue-deep))`,
                          transitionDelay: `${i * 0.08}s`,
                        }}
                      >
                        <span className="val">{b.count}</span>
                      </div>
                      <span className="lbl">{b.band}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Icon name="banknote" width={34} height={34} />
                  <b>No salary data</b>
                  <p>Employee salary information is needed to generate band distribution.</p>
                </div>
              )}
            </Card>

            {/* ── Attendance trend ── */}
            <Card
              title="Attendance trend"
              sub="last 7 days"
              action={
                days.length > 0 && (
                  <div className="attendance-sparkline">
                    {days.map((d, i) => (
                      <div className="spark-group" key={d.date} title={`${fdateShort(d.date)} — ${d.present} present, ${d.absent} absent, ${d.leave} on leave`}>
                        <SparkBar value={d.present} max={maxTrend} color="var(--blue)" />
                        <SparkBar value={d.absent} max={maxTrend} color="#e04a4a" />
                        <SparkBar value={d.leave} max={maxTrend} color="#f0b429" />
                      </div>
                    ))}
                  </div>
                )
              }
            >
              {days.length ? (
                <div className="tbl-wrap" style={{ marginTop: 10 }}>
                  <table className="data reports-table">
                    <thead>
                      <tr><th>Day</th><th>Present</th><th>Absent</th><th>On leave</th></tr>
                    </thead>
                    <tbody>
                      {days.map((d) => (
                        <tr key={d.date}>
                          <td>
                            <div className="cell-main">{fdateShort(d.date)}</div>
                            <div className="cell-sub">{DOW[new Date(d.date).getDay()]}</div>
                          </td>
                          <td>
                            <span className="status-badge status-present">{d.present}</span>
                          </td>
                          <td>
                            <span className="status-badge status-absent">{d.absent}</span>
                          </td>
                          <td>
                            <span className="status-badge status-leave">{d.leave}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">
                  <Icon name="clock" width={34} height={34} />
                  <b>No attendance yet</b>
                  <p>Marked attendance will show up here. Start by recording today's attendance.</p>
                </div>
              )}
            </Card>

            {/* ── Gender diversity ── */}
            <Card title="Gender diversity" sub="active employees">
              <div className="gender-diversity">
                <svg width="130" height="130" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                  {genderTotal ? (
                    <g className="donut-anim">
                      {donutSegs}
                    </g>
                  ) : (
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--sky-2)" strokeWidth="14" />
                  )}
                  <text x="50" y="47" textAnchor="middle" fontFamily="var(--font-disp)" fontWeight="800" fontSize="19" fill="var(--ink)">{genderTotal}</text>
                  <text x="50" y="61" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="var(--ink-3)">PEOPLE</text>
                </svg>
                <div className="gender-legend">
                  {GENDER.map(([k, label, color]) => (
                    <span key={k} className="gender-legend-item">
                      <i style={{ background: color }} />
                      <span className="gender-legend-label">{label}</span>
                      <span className="gender-legend-count">{byGender[k]}</span>
                      <span className="gender-legend-pct">
                        {genderTotal ? Math.round((byGender[k] / genderTotal) * 100) : 0}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

