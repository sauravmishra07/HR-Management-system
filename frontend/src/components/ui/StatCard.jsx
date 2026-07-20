import Icon from './Icon';

/** Dashboard stat tile. */
export default function StatCard({ label, icon, value, unit, trend }) {
  return (
    <div className="card stat">
      <div className="lbl">
        {icon && <Icon name={icon} width={14} height={14} />}
        {label}
      </div>
      <div className="num">
        {value}
        {unit && <small> {unit}</small>}
      </div>
      {trend && <div className="trend">{trend}</div>}
    </div>
  );
}
