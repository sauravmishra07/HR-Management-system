import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { expenseApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, money } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, DataTable, Pagination, StatCard, Chip, EmployeeCell, useConfirm,
} from '@/components/ui';
import ExpenseFormModal from './ExpenseFormModal';

const CATS = ['Travel', 'Client Meeting', 'Hardware', 'Marketing', 'Other'];

export default function ExpensesPage() {
  const { can, empId, isEmployee } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [filters, setFilters] = useState({ status: '', cat: '', page: 1 });
  const [formOpen, setFormOpen] = useState(false);

  const params = { status: filters.status, cat: filters.cat, page: filters.page, limit: 12 };
  const { data, isLoading } = useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseApi.list(params),
    placeholderData: keepPreviousData,
  });

  const summary = useQuery({
    queryKey: ['expenses', 'summary'],
    queryFn: expenseApi.summary,
    select: (r) => r.data,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['expenses'] });
  const mutOpts = (msg) => ({
    onSuccess: () => { toast(msg); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const approve = useMutation({ mutationFn: (id) => expenseApi.approve(id), ...mutOpts('Claim approved') });
  const reject = useMutation({ mutationFn: (id) => expenseApi.reject(id), ...mutOpts('Claim rejected') });
  const pay = useMutation({ mutationFn: (id) => expenseApi.pay(id), ...mutOpts('Claim cleared for payout') });
  const remove = useMutation({ mutationFn: (id) => expenseApi.remove(id), ...mutOpts('Claim deleted') });

  const rows = data?.data || [];
  const meta = data?.meta;
  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const st = summary.data?.byStatus || {};
  const cell = (s) => st[s] || { count: 0, amount: 0 };

  const askDelete = async (x) => {
    const ok = await confirm({
      title: 'Delete this claim?',
      message: `Reimbursement ${x.code} (${x.title}) will be removed. This cannot be undone.`,
      okLabel: 'Delete claim',
      danger: true,
    });
    if (ok) remove.mutate(x._id);
  };

  const columns = [
    { key: 'employee', header: 'Employee', render: (x) => <EmployeeCell employee={x.employee} empId={x.emp} /> },
    {
      key: 'title',
      header: 'Claim',
      render: (x) => (
        <div style={{ maxWidth: 220 }}>
          <div className="cell-main" style={{ whiteSpace: 'normal' }}>{x.title}</div>
          <div className="cell-sub mono">{x.code}</div>
        </div>
      ),
    },
    { key: 'cat', header: 'Category' },
    { key: 'amt', header: 'Amount', render: (x) => <span className="amt" style={{ fontWeight: 800 }}>{money(x.amt)}</span> },
    { key: 'date', header: 'Date', render: (x) => fdate(x.date) },
    { key: 'status', header: 'Status', render: (x) => <Chip status={x.status} /> },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (x) => {
        const canApprove = can('approveExpense') && x.status === 'Pending';
        const canClear = can('clearExpense') && x.status === 'Approved';
        const canDelete = x.emp === empId && x.status === 'Pending';
        if (!canApprove && !canClear && !canDelete) {
          return <span className="cell-sub mono">{x.code}</span>;
        }
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {canApprove && (
              <>
                <Button size="sm" icon="check" loading={approve.isPending && approve.variables === x._id} onClick={() => approve.mutate(x._id)}>Approve</Button>
                <Button size="sm" variant="slate" loading={reject.isPending && reject.variables === x._id} onClick={() => reject.mutate(x._id)}>Reject</Button>
              </>
            )}
            {canClear && (
              <Button size="sm" variant="soft" icon="banknote" loading={pay.isPending && pay.variables === x._id} onClick={() => pay.mutate(x._id)}>Mark paid</Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" icon="trash" onClick={() => askDelete(x)}>Delete</Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Reimbursements"
        hint={isEmployee
          ? 'Submit a reimbursement claim and track it through approval and payout.'
          : 'Team submits a claim, you approve it, accounts pays it. Three states, nothing more.'}
        actions={<Button icon="plus" onClick={() => setFormOpen(true)}>New claim</Button>}
      />

      <div className="info-note">
        <span className="info-ico"><Icon name="inbox" /></span>
        <div><b>Employee reimbursements only.</b> Project-related expenses are tracked separately on the <b>PEPSI</b> platform and are not raised here.</div>
      </div>

      <div className="grid-stats" style={{ marginTop: 14 }}>
        <StatCard label={isEmployee ? 'My pending' : 'Pending approval'} icon="inbox" value={money(cell('Pending').amount)} trend={`${cell('Pending').count} ${cell('Pending').count === 1 ? 'claim' : 'claims'} waiting`} />
        <StatCard label="Approved" icon="check" value={money(cell('Approved').amount)} trend={`${cell('Approved').count} awaiting payout`} />
        <StatCard label="Paid out" icon="banknote" value={money(cell('Paid').amount)} trend={`${cell('Paid').count} cleared`} />
        <StatCard label={isEmployee ? 'My claims' : 'Total claims'} icon="file" value={summary.data?.totalCount ?? 0} trend={`${money(summary.data?.totalAmount || 0)} all time`} />
      </div>

      <div style={{ marginTop: 18 }}>
        <Card pad={false}>
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <div className="filter-bar">
              <select className="input" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
                <option value="">All statuses</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Paid</option>
                <option>Rejected</option>
              </select>
              <select className="input" value={filters.cat} onChange={(e) => setFilter({ cat: e.target.value })}>
                <option value="">All categories</option>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="spacer" />
              <span className="chip chip-sky">{meta?.total ?? rows.length} claim{(meta?.total ?? rows.length) === 1 ? '' : 's'}</span>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            minWidth={820}
            emptyLabel="No claims yet"
            emptyHint={isEmployee ? 'Your reimbursement claims will show here.' : 'New claims will appear here.'}
          />
        </Card>
      </div>
      <Pagination meta={meta} onPage={(page) => setFilter({ page })} />

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
