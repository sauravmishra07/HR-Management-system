import { money } from '@/utils/format';

/**
 * Salary annexure table shared by the offer builder preview and the offer letter.
 * `b` is the result of `structBreakup`.
 */
export default function SalaryBreakup({ b }) {
  if (!b) return null;

  const row = (label, m, { bold = false, neg = false } = {}) => (
    <tr key={label} style={bold ? { fontWeight: 700, background: 'var(--sky-3)' } : undefined}>
      <td>{label}</td>
      <td className="amt" style={{ textAlign: 'right', color: neg ? 'var(--slate)' : undefined }}>{money(m)}</td>
      <td className="amt" style={{ textAlign: 'right', color: neg ? 'var(--slate)' : undefined }}>{money(m * 12)}</td>
    </tr>
  );

  return (
    <div className="tbl-wrap">
      <table className="data" style={{ minWidth: 440 }}>
        <thead>
          <tr>
            <th>Component</th>
            <th style={{ textAlign: 'right' }}>Monthly</th>
            <th style={{ textAlign: 'right' }}>Annual</th>
          </tr>
        </thead>
        <tbody>
          {row('Basic', b.basic)}
          {row('HRA', b.hra)}
          {row('Special Allowance', b.special)}
          {row('Gross Salary', b.gm, { bold: true })}
          {b.pf ? row('Less: Provident Fund', b.pf, { neg: true }) : null}
          {b.pt ? row('Less: Professional Tax', b.pt, { neg: true }) : null}
          {row('Net Take-home', b.netM, { bold: true })}
        </tbody>
      </table>
    </div>
  );
}
