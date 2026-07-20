import Avatar from './Avatar';

/**
 * Employee identity cell (avatar + name + "EMPID · Dept").
 * Accepts either an `employee` object or explicit name/empId/dept.
 */
export default function EmployeeCell({ employee, name, empId, dept, seed }) {
  const n = name || employee?.name || '—';
  const id = empId || employee?.empId || '';
  const d = dept ?? employee?.dept ?? '';
  return (
    <div className="emp-cell">
      <Avatar name={n} seed={seed} />
      <div>
        <div className="cell-main">{n}</div>
        <div className="cell-sub mono">
          {id}
          {d ? ` · ${d}` : ''}
        </div>
      </div>
    </div>
  );
}
