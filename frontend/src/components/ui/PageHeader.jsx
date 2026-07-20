/** Page title + hint + action buttons row. */
export default function PageHeader({ title, hint, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {hint && <p className="hint">{hint}</p>}
      </div>
      {actions && <div className="head-actions">{actions}</div>}
    </div>
  );
}
