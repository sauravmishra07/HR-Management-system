import { useQuery } from '@tanstack/react-query';
import { payrollApi, settingsApi } from '@/api';
import { fmonth, money, inWords } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import { Modal, Button, Spinner } from '@/components/ui';

const amtCell = { textAlign: 'right' };

/** Read-only payslip for one employee / month, matching the reference layout. */
export default function PayslipModal({ empId, month, onClose }) {
  const open = Boolean(empId);

  const { data: p, isLoading } = useQuery({
    queryKey: ['payslip', empId, month],
    queryFn: () => payrollApi.payslip(empId, { month }),
    enabled: open,
    select: (r) => r.data,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    select: (r) => r.data,
  });

  const company = settings?.company || 'RAMP HRMS';
  const address = settings?.address;

  const exportPayslip = () => {
    if (!p) return;
    downloadCSV(`payslip-${p.employee.empId}-${p.month}`, [{
      Employee: p.employee.name,
      EmpID: p.employee.empId,
      Month: p.month,
      Basic: p.basic,
      HRA: p.hra,
      Special: p.special,
      Gross: p.gross,
      PF: p.pf,
      PT: p.pt,
      TDS: p.tds,
      Deductions: p.ded,
      Net: p.net,
      Status: p.status,
    }]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Payslip — ${fmonth(month)}`}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button icon="download" onClick={exportPayslip} disabled={!p}>Download CSV</Button>
        </>
      }
    >
      {isLoading || !p ? (
        <Spinner label="Loading payslip…" />
      ) : (
        <div style={{ border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: 'var(--sky-3)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-disp)', fontWeight: 800, fontSize: 16 }}>{company}</div>
              {address && <div style={{ fontSize: 11.5, color: 'var(--ink-2)', maxWidth: 360 }}>{address}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 11 }}>PAYSLIP · {p.month}</div>
              <div style={{ fontWeight: 800 }}>{p.employee.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>
                {p.employee.empId} · {p.employee.role} · {p.employee.dept}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <table className="data">
              <thead><tr><th>Earnings</th><th style={amtCell}>Amount</th></tr></thead>
              <tbody>
                <tr><td>Basic (50%)</td><td className="amt" style={amtCell}>{money(p.basic)}</td></tr>
                <tr><td>HRA (20%)</td><td className="amt" style={amtCell}>{money(p.hra)}</td></tr>
                <tr><td>Special allowance</td><td className="amt" style={amtCell}>{money(p.special)}</td></tr>
                <tr style={{ fontWeight: 800 }}><td>Gross</td><td className="amt" style={amtCell}>{money(p.gross)}</td></tr>
              </tbody>
            </table>
            <table className="data" style={{ borderLeft: '1px solid var(--line)' }}>
              <thead><tr><th>Deductions</th><th style={amtCell}>Amount</th></tr></thead>
              <tbody>
                <tr><td>Provident Fund</td><td className="amt" style={amtCell}>{money(p.pf)}</td></tr>
                <tr><td>Professional Tax</td><td className="amt" style={amtCell}>{money(p.pt)}</td></tr>
                <tr><td>TDS</td><td className="amt" style={amtCell}>{money(p.tds)}</td></tr>
                <tr style={{ fontWeight: 800 }}><td>Total deductions</td><td className="amt" style={amtCell}>{money(p.ded)}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ padding: '14px 18px', background: 'var(--sky)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--blue-ink)', fontWeight: 700 }}>
              Rupees {p.netInWords || inWords(p.net)} only
            </div>
            <div style={{ fontFamily: 'var(--font-disp)', fontWeight: 800, fontSize: 20, color: 'var(--blue-deep)' }}>
              Net pay: {money(p.net)}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
