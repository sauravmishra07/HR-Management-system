import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { payrollApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { currentMonth, fmonth, fdate, money } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import {
  PageHeader, Card, Button, DataTable, StatCard, Chip, EmployeeCell, useConfirm,
} from '@/components/ui';
import PayslipModal from './PayslipModal';

/** Last `n` months (incl. current) as 'YYYY-MM', newest first. */
function recentMonths(n = 6) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i += 1) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export default function PayrollPage() {
  const { can, isEmployee } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [month, setMonth] = useState(currentMonth());
  const [payslipId, setPayslipId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', { month }],
    queryFn: () => payrollApi.get({ month }),
    placeholderData: keepPreviousData,
    select: (r) => r.data,
  });

  const monthsQ = useQuery({
    queryKey: ['payroll', 'months'],
    queryFn: payrollApi.months,
    select: (r) => r.data,
  });

  const run = useMutation({
    mutationFn: () => payrollApi.run({ month }),
    onSuccess: () => {
      toast('Payroll processed — everyone marked paid');
      qc.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const pay = useMutation({
    mutationFn: (empId) => payrollApi.pay({ month, empId }),
    onSuccess: () => {
      toast('Salary marked paid');
      qc.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const rows = data?.rows || [];
  const totals = data?.totals || { gross: 0, net: 0, count: 0 };
  const status = data?.status || 'Pending';
  const paidOn = data?.paidOn;
  const isPaidRun = status === 'Paid';
  const canRun = can('runPayroll');
  const label = fmonth(month);

  // Merge persisted payroll months with recent months so the picker always
  // offers the current month plus any historical runs.
  const monthOptions = [...new Set([...recentMonths(6), month, ...((monthsQ.data || []).map((m) => m.month))])]
    .sort()
    .reverse();

  const runPayroll = async () => {
    const ok = await confirm({
      title: `Run payroll for ${label}`,
      message: 'Salary will be marked as paid for all remaining active employees for this month. This mirrors the real bank-transfer step.',
      okLabel: 'Yes, run payroll',
    });
    if (ok) run.mutate();
  };

  const exportCsv = () => {
    downloadCSV(`payroll-${month}`, rows.map((r) => ({
      EmpID: r.empId,
      Name: r.name,
      Department: r.dept,
      Role: r.role,
      Gross: r.gross,
      Basic: r.basic,
      HRA: r.hra,
      Special: r.special,
      PF: r.pf,
      PT: r.pt,
      TDS: r.tds,
      Deductions: r.ded,
      Net: r.net,
      Status: r.paid ? 'Paid' : 'Pending',
    })));
  };

  const columns = [
    { key: 'employee', header: 'Employee', render: (r) => <EmployeeCell employee={r} empId={r.empId} /> },
    { key: 'gross', header: 'Gross', render: (r) => <span className="amt">{money(r.gross)}</span> },
    { key: 'ded', header: 'Deductions', render: (r) => <span className="amt" style={{ color: 'var(--slate)' }}>− {money(r.ded)}</span> },
    { key: 'net', header: 'Net pay', render: (r) => <span className="amt" style={{ fontWeight: 800, color: 'var(--blue-ink)' }}>{money(r.net)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Chip status={r.paid ? 'Paid' : 'Pending'} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="soft" icon="file" onClick={() => setPayslipId(r.empId)}>Payslip</Button>
          {canRun && !r.paid && (
            <Button size="sm" icon="banknote" loading={pay.isPending && pay.variables === r.empId} onClick={() => pay.mutate(r.empId)}>
              Mark paid
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payroll"
        hint={isEmployee
          ? 'Your monthly salary breakup and payslips — open and download anytime.'
          : 'Pick a month, check the amounts, press one button. Payslips open instantly for every employee.'}
        actions={
          <>
            <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthOptions.map((m) => <option key={m} value={m}>{fmonth(m)}</option>)}
            </select>
            <Button variant="ghost" icon="download" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
            {canRun && !isPaidRun && (
              <Button icon="banknote" loading={run.isPending} onClick={runPayroll}>Run payroll · {label}</Button>
            )}
          </>
        }
      />

      <div className="grid-stats">
        <StatCard label={`Total gross — ${label}`} icon="file" value={money(totals.gross)} trend={`${totals.count} active ${totals.count === 1 ? 'employee' : 'employees'}`} />
        <StatCard label="Total net payout" icon="banknote" value={money(totals.net)} trend="after PF + PT + TDS" />
        <StatCard label="Headcount" icon="users" value={totals.count} trend="on this payroll run" />
        <StatCard
          label="Run status"
          icon="check"
          value={<Chip status={isPaidRun ? 'Paid' : 'Pending'} />}
          trend={isPaidRun && paidOn ? `Paid on ${fdate(paidOn)}` : 'Not run yet'}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <Card pad={false}>
          <DataTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            minWidth={780}
            rowKey={(r) => r.empId}
            emptyLabel="No payroll for this month"
            emptyHint="No active employees found for the selected month."
          />
        </Card>
      </div>

      <PayslipModal empId={payslipId} month={month} onClose={() => setPayslipId(null)} />
    </>
  );
}
