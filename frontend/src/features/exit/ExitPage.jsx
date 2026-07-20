import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { exitApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, DataTable, Pagination, EmployeeCell, Chip, useConfirm,
} from '@/components/ui';
import ExitInitiateModal from './ExitInitiateModal';
import ExitManageModal from './ExitManageModal';

export default function ExitPage() {
  const { can } = useAuth();
  const manage = can('manageExit');
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [filters, setFilters] = useState({ search: '', status: '', type: '', page: 1 });
  const search = useDebounce(filters.search, 300);
  const [initOpen, setInitOpen] = useState(false);
  const [manageId, setManageId] = useState(null);

  const params = { search, status: filters.status, type: filters.type, page: filters.page, limit: 12 };
  const { data, isLoading } = useQuery({
    queryKey: ['exit', 'list', params],
    queryFn: () => exitApi.list(params),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data || [];
  const meta = data?.meta;
  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const withdraw = useMutation({
    mutationFn: (id) => exitApi.withdraw(id),
    onSuccess: () => { toast('Exit withdrawn'); qc.invalidateQueries({ queryKey: ['exit'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const complete = useMutation({
    mutationFn: (id) => exitApi.complete(id),
    onSuccess: () => { toast('Exit completed'); qc.invalidateQueries({ queryKey: ['exit'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onWithdraw = async (x) => {
    if (await confirm({ title: 'Withdraw this exit?', message: `${x.employee?.name || x.emp} stays active and the offboarding is cancelled.`, okLabel: 'Withdraw', danger: true })) {
      withdraw.mutate(x._id);
    }
  };
  const onComplete = async (x) => {
    if (await confirm({ title: 'Complete this exit?', message: `${x.employee?.name || x.emp} will be marked Exited and their login deactivated. This cannot be undone.`, okLabel: 'Complete exit' })) {
      complete.mutate(x._id);
    }
  };

  const columns = [
    { key: 'employee', header: 'Employee', render: (x) => <EmployeeCell employee={x.employee} empId={x.emp} /> },
    { key: 'type', header: 'Type', render: (x) => <Chip>{x.type}</Chip> },
    { key: 'applied', header: 'Applied', render: (x) => fdate(x.applied) },
    { key: 'lastDay', header: 'Last day', render: (x) => fdate(x.lastDay) },
    {
      key: 'clearance',
      header: 'Clearance',
      width: 150,
      render: (x) => (
        <div style={{ minWidth: 130 }}>
          <div className="mini-prog"><i style={{ width: `${x.clearancePct || 0}%` }} /></div>
          <span className="cell-sub">{x.clearancePct || 0}% cleared</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (x) => <Chip status={x.status} /> },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (x) => {
        const active = x.status !== 'Completed' && x.status !== 'Withdrawn';
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button size="sm" variant={manage ? 'primary' : 'soft'} icon={manage ? 'edit' : 'eye'} onClick={() => setManageId(x._id)}>
              {manage ? 'Manage' : 'View'}
            </Button>
            {manage && active && (
              <>
                <Button size="sm" variant="slate" onClick={() => onWithdraw(x)}>Withdraw</Button>
                <Button size="sm" variant="ghost" icon="check" onClick={() => onComplete(x)}>Complete</Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Exit & Offboarding"
        hint="Track resignations end-to-end — notice, clearances, exit interview, full & final, and final letters."
        actions={manage && (
          <Button icon="plus" onClick={() => setInitOpen(true)}>Initiate exit</Button>
        )}
      />

      <Card pad={false}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <div className="search-inline">
              <Icon name="search" />
              <input
                className="input"
                placeholder="Search employee or exit ID…"
                value={filters.search}
                onChange={(e) => setFilter({ search: e.target.value })}
              />
            </div>
            <select className="input" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All statuses</option>
              <option>In Progress</option>
              <option>Clearance</option>
              <option>Completed</option>
              <option>Withdrawn</option>
            </select>
            <select className="input" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
              <option value="">All types</option>
              <option>Resignation</option>
              <option>Termination</option>
            </select>
            <div className="spacer" />
            <span className="chip chip-sky">{meta?.total ?? rows.length} exit{(meta?.total ?? rows.length) === 1 ? '' : 's'}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          minWidth={860}
          emptyLabel="No exits in progress"
          emptyHint={manage ? 'Initiate an exit to start the offboarding process.' : 'When you resign, your process will show here.'}
        />
      </Card>
      <Pagination meta={meta} onPage={(page) => setFilter({ page })} />

      <ExitInitiateModal open={initOpen} onClose={() => setInitOpen(false)} />
      <ExitManageModal id={manageId} onClose={() => setManageId(null)} />
    </>
  );
}
