import Icon from './Icon';

export default function Spinner({ size = 22, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)' }}>
      <Icon name="refresh" width={size} height={size} className="animate-spin" />
      {label && <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>}
    </div>
  );
}

/** Full-page centered loader. */
export function PageLoader({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Spinner size={26} label={label} />
    </div>
  );
}
