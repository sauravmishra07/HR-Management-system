/** Surface card. `pad` adds default padding; `title`/`sub`/`action` render a header row. */
export default function Card({ children, className = '', pad = true, title, sub, action }) {
  return (
    <div className={`card ${pad ? 'card-pad' : ''} ${className}`}>
      {(title || action) && (
        <div className="card-title" style={{ marginBottom: 14 }}>
          <span>
            {title}
            {sub && <span className="sub" style={{ marginLeft: 8 }}>{sub}</span>}
          </span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
