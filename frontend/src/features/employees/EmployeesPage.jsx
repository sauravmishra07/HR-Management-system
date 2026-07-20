import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { employeeApi, departmentApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';
import {
  PageHeader, Card, Button, Icon, DataTable, Pagination, EmployeeCell, Chip,
} from '@/components/ui';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeProfileModal from './EmployeeProfileModal';

const ROLES = ['Employee', 'HR Representative', 'Finance Representative', 'HR Admin'];

/* ─── Skeleton row helper ─── */
function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="shimmer"
      style={{
        width, height, borderRadius: radius,
        background: 'var(--sky-2)',
        opacity: 0.5,
        animation: 'shimmer 1.4s ease-in-out infinite alternate',
        ...style,
      }}
    />
  );
}

export default function EmployeesPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ search: '', dept: '', status: '', page: 1 });
  const search = useDebounce(filters.search, 300);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const params = { search, dept: filters.dept, status: filters.status, page: filters.page, limit: 12 };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApi.list(params),
    placeholderData: keepPreviousData,
  });
  const depts = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list, select: (r) => r.data });

  const toggle = useMutation({
    mutationFn: (id) => employeeApi.toggleStatus(id),
    onSuccess: () => { toast('Status updated'); qc.invalidateQueries({ queryKey: ['employees'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const rows = data?.data || [];
  const meta = data?.meta;

  /* ── Compute summary counts ── */
  const totalActive = rows.filter((r) => r.status === 'Active').length;
  const totalInactive = rows.filter((r) => r.status === 'Inactive').length;
  const uniqueDepts = [...new Set(rows.map((r) => r.dept).filter(Boolean))].length;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const columns = [
    { key: 'name', header: 'Employee', render: (e) => <span className="link" onClick={() => setProfileId(e._id)}><EmployeeCell employee={e} /></span> },
    { key: 'role', header: 'Role' },
    { key: 'dept', header: 'Department' },
    { key: 'join', header: 'Joined', render: (e) => fdate(e.join) },
    { key: 'phone', header: 'Phone', render: (e) => <span className="mono">{e.phone || '—'}</span> },
    { key: 'status', header: 'Status', render: (e) => <Chip status={e.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (e) => (
        <div className="action-btns">
          <Button size="sm" variant="soft" icon="eye" onClick={() => setProfileId(e._id)}>View</Button>
          {can('manageEmployee') && (
            <Button size="sm" variant="ghost" icon="edit" onClick={() => { setEditing(e); setFormOpen(true); }}>Edit</Button>
          )}
        </div>
      ),
    },
  ];

  const exportCsv = () => {
    downloadCSV('employees', rows.map((e) => ({
      EmpID: e.empId, Name: e.name, Department: e.dept, Role: e.role, Email: e.email, Phone: e.phone, Joined: e.join, Salary: e.salary, Status: e.status, Access: e.access,
    })));
  };

  return (
    <>
      <PageHeader
        title="Employees"
        hint="Everyone in the company, in one list. Click a person to see their full profile."
        actions={
          <>
            <Button variant="ghost" icon="download" onClick={exportCsv} className={rows.length ? 'btn-pulse' : ''}>Export CSV</Button>
            {can('manageEmployee') && (
              <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>Add employee</Button>
            )}
          </>
        }
      />

      {/* ── Summary stat cards ── */}
      <div className="reports-grid reports-grid-stats" style={{ marginBottom: 18 }}>
        <div className="stat-card-anim" style={{ animationDelay: '0s' }}>
          <div className="card stat">
            <div className="lbl"><Icon name="users" width={14} height={14} />Total on this page</div>
            <div className="num">{rows.length}</div>
            <div className="trend">{meta?.total ?? '—'} across all pages</div>
          </div>
        </div>
        <div className="stat-card-anim" style={{ animationDelay: '0.06s' }}>
          <div className="card stat">
            <div className="lbl"><Icon name="check" width={14} height={14} />Active</div>
            <div className="num" style={{ color: 'var(--blue)' }}>{totalActive}</div>
            <div className="trend">currently employed</div>
          </div>
        </div>
        <div className="stat-card-anim" style={{ animationDelay: '0.12s' }}>
          <div className="card stat">
            <div className="lbl"><Icon name="building" width={14} height={14} />Departments</div>
            <div className="num">{uniqueDepts}</div>
            <div className="trend">represented on this page</div>
          </div>
        </div>
        <div className="stat-card-anim" style={{ animationDelay: '0.18s' }}>
          <div className="card stat">
            <div className="lbl"><Icon name="x" width={14} height={14} />Inactive</div>
            <div className="num">{totalInactive}</div>
            <div className="trend">inactive accounts</div>
          </div>
        </div>
      </div>

      <Card pad={false}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <div className="search-inline">
              <Icon name="search" />
              <input
                className="input"
                placeholder="Search name, ID, role…"
                value={filters.search}
                onChange={(e) => setFilter({ search: e.target.value })}
              />
            </div>
            <select className="input" value={filters.dept} onChange={(e) => setFilter({ dept: e.target.value })}>
              <option value="">All departments</option>
              {(depts.data || []).map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
            <select className="input" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <div className="spacer" />
            <span className="chip chip-sky">{meta?.total ?? rows.length} people</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '16px 20px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--line)' : 'none' }}>
                <Skeleton width={32} height={32} radius={10} />
                <div style={{ flex: 2 }}><Skeleton width={120 + i * 10} height={14} radius={4} /></div>
                <div style={{ flex: 1 }}><Skeleton width={70} height={14} radius={4} /></div>
                <div style={{ flex: 1 }}><Skeleton width={80} height={14} radius={4} /></div>
                <div style={{ flex: 1 }}><Skeleton width={60} height={14} radius={4} /></div>
                <div style={{ flex: 0.5 }}><Skeleton width={50} height={14} radius={4} /></div>
                <div style={{ flex: 0.8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Skeleton width={56} height={28} radius={8} />
                  <Skeleton width={48} height={28} radius={8} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            loading={false}
            minWidth={780}
            emptyLabel="No one matches"
            emptyHint="Try a different search or clear the filters."
          />
        )}
      </Card>
      <Pagination meta={meta} onPage={(page) => setFilter({ page })} />

      {/* ── Background refresh indicator ── */}
      {isFetching && !isLoading && (
        <div className="fetching-indicator">
          <Icon name="refresh" className="animate-spin" />
          <span>Refreshing…</span>
        </div>
      )}

      <EmployeeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employee={editing}
        departments={depts.data || []}
        roles={ROLES}
      />
      <EmployeeProfileModal
        id={profileId}
        onClose={() => setProfileId(null)}
        onEdit={(e) => { setProfileId(null); setEditing(e); setFormOpen(true); }}
        onToggle={(id) => toggle.mutate(id)}
      />
    </>
  );
}

