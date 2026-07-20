import Icon from './Icon';
import Spinner from './Spinner';

/**
 * Reusable table. `columns` = [{ key, header, render?(row), align?, width? }].
 * Shows a loading spinner or empty-state when appropriate.
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  emptyLabel = 'Nothing here yet',
  emptyHint = '',
  minWidth = 640,
  rowKey = (r, i) => r._id || r.code || r.id || i,
}) {
  return (
    <div className="tbl-wrap">
      <table className="data" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || 'left', width: c.width }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <div style={{ padding: '40px 0', display: 'grid', placeItems: 'center' }}>
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty">
                  <Icon name="inbox" width={38} height={38} />
                  <b>{emptyLabel}</b>
                  {emptyHint && <p>{emptyHint}</p>}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row, i)}>
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align || 'left' }}>
                    {c.render ? c.render(row, i) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
