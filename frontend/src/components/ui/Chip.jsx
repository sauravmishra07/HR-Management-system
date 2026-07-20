/**
 * Status chip. Maps common domain statuses to the blue-family chip styles
 * from the reference. Falls back to a neutral sky chip.
 */
const STATUS_STYLE = {
  // generic
  Active: 'chip-sky',
  Inactive: 'chip-slate',
  Exited: 'chip-slate',
  // leave / expense / doc / approvals
  Approved: 'chip-solid',
  Pending: 'chip-line',
  Rejected: 'chip-slate',
  Paid: 'chip-deep',
  Verified: 'chip-solid',
  Settled: 'chip-solid',
  // attendance
  P: 'chip-sky',
  A: 'chip-slate',
  L: 'chip-deep',
  // jobs / assets
  Open: 'chip-solid',
  Closed: 'chip-slate',
  Assigned: 'chip-sky',
  Available: 'chip-line',
  'In Repair': 'chip-slate',
  // exit
  'In Progress': 'chip-sky',
  Clearance: 'chip-deep',
  Completed: 'chip-solid',
  Withdrawn: 'chip-slate',
};

const ATT_LABEL = { P: 'Present', A: 'Absent', L: 'On Leave' };

export default function Chip({ children, status, variant, className = '' }) {
  const cls = variant ? `chip-${variant}` : STATUS_STYLE[status] || 'chip-sky';
  const label = children ?? ATT_LABEL[status] ?? status;
  return <span className={`chip ${cls} ${className}`}>{label}</span>;
}
