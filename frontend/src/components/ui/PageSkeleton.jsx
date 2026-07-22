function PageSkeletonHeader() {
  return (
    <div className="page-skeleton-head">
      <div className="page-skeleton-line page-skeleton-title" />
      <div className="page-skeleton-line page-skeleton-action" />
    </div>
  );
}

function PageSkeletonCards({ count = 4 }) {
  return (
    <div className="page-skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="page-skeleton-card" />
      ))}
    </div>
  );
}

function PageSkeletonTable({ rows = 5 }) {
  return (
    <div className="page-skeleton-table">
      <div className="page-skeleton-table-head">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="page-skeleton-line page-skeleton-table-header" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="page-skeleton-table-row">
          <div className="page-skeleton-line page-skeleton-table-cell" />
          <div className="page-skeleton-line page-skeleton-table-cell" />
          <div className="page-skeleton-line page-skeleton-table-cell" />
          <div className="page-skeleton-line page-skeleton-table-cell" />
        </div>
      ))}
    </div>
  );
}

function PageSkeletonForm() {
  return (
    <div className="page-skeleton-form">
      <PageSkeletonHeader />
      <div className="page-skeleton-form-grid">
        <div className="page-skeleton-line page-skeleton-field" />
        <div className="page-skeleton-line page-skeleton-field" />
        <div className="page-skeleton-line page-skeleton-field" />
        <div className="page-skeleton-line page-skeleton-field" />
        <div className="page-skeleton-line page-skeleton-field" />
      </div>
      <div className="page-skeleton-action-row">
        <div className="page-skeleton-line page-skeleton-action-sm" />
        <div className="page-skeleton-line page-skeleton-action-sm" />
      </div>
    </div>
  );
}

function PageSkeletonList({ rows = 6 }) {
  return (
    <div className="page-skeleton-list">
      <PageSkeletonHeader />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="page-skeleton-list-row">
          <div className="page-skeleton-line page-skeleton-list-cell" />
          <div className="page-skeleton-line page-skeleton-list-cell" />
          <div className="page-skeleton-line page-skeleton-list-cell" />
        </div>
      ))}
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className="page-skeleton">
      <PageSkeletonHeader />
      <PageSkeletonCards />
      <div className="page-skeleton-content">
        <div className="page-skeleton-block page-skeleton-block-tall" />
        <div className="page-skeleton-block page-skeleton-block-wide" />
      </div>
    </div>
  );
}

const analyticsPages = new Set(['dashboard', 'reports', 'performance', 'attendance']);
const tablePages = new Set([
  'employees',
  'departments',
  'documents',
  'assets',
  'holidays',
  'leaves',
  'eveningreport',
  'expenses',
  'recruitment',
  'exit',
  'payroll',
]);
const listPages = new Set(['announcements']);
const formPages = new Set(['settings']);

export default function PageSkeleton({ view = 'generic' }) {
  if (analyticsPages.has(view)) {
    return (
      <div className="page-skeleton">
        <PageSkeletonHeader />
        <PageSkeletonCards count={4} />
        <div className="page-skeleton-content">
          <div className="page-skeleton-block page-skeleton-block-tall" />
          <div className="page-skeleton-block page-skeleton-block-wide" />
        </div>
      </div>
    );
  }

  if (tablePages.has(view)) {
    return (
      <div className="page-skeleton page-skeleton-table-page">
        <PageSkeletonHeader />
        <PageSkeletonTable rows={6} />
      </div>
    );
  }

  if (listPages.has(view)) {
    return <PageSkeletonList rows={6} />;
  }

  if (formPages.has(view)) {
    return <PageSkeletonForm />;
  }

  return <GenericSkeleton />;
}
