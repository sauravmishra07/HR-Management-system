import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { documentApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, DataTable, Pagination, EmployeeCell, Chip, useConfirm,
} from '@/components/ui';
import DocumentUploadModal from './DocumentUploadModal';

const TYPES = ['Identity', 'Education', 'Employment', 'Other'];

export default function DocumentsPage() {
  const { can, empId, isEmployee } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const canVerify = can('verifyDoc');

  const [filters, setFilters] = useState({ status: '', type: '', page: 1 });
  const [uploadOpen, setUploadOpen] = useState(false);

  const params = { status: filters.status, type: filters.type, page: filters.page, limit: 12 };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentApi.list(params),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data || [];
  const meta = data?.meta;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const verify = useMutation({
    mutationFn: (id) => documentApi.verify(id),
    onSuccess: () => { toast('Document verified'); qc.invalidateQueries({ queryKey: ['documents'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const reject = useMutation({
    mutationFn: (id) => documentApi.reject(id),
    onSuccess: () => { toast('Document rejected'); qc.invalidateQueries({ queryKey: ['documents'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const remove = useMutation({
    mutationFn: (id) => documentApi.remove(id),
    onSuccess: () => { toast('Document deleted'); qc.invalidateQueries({ queryKey: ['documents'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onDelete = async (d) => {
    const ok = await confirm({
      title: 'Delete document',
      message: `Delete "${d.name}"? This cannot be undone.`,
      okLabel: 'Delete',
      danger: true,
    });
    if (ok) remove.mutate(d._id);
  };

  const columns = [
    { key: 'emp', header: 'Employee', render: (d) => <EmployeeCell employee={d.employee} empId={d.emp} /> },
    {
      key: 'name',
      header: 'Document',
      render: (d) => (
        <div>
          <div className="cell-main">{d.name}</div>
          <div className="cell-sub mono">{d.code}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Type' },
    { key: 'date', header: 'Date', render: (d) => fdate(d.date) },
    { key: 'size', header: 'Size', render: (d) => <span className="mono">{d.size || '—'}</span> },
    { key: 'status', header: 'Status', render: (d) => <Chip status={d.status} /> },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (d) => {
        const isOwner = d.emp === empId;
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {canVerify && d.status === 'Pending' && (
              <>
                <Button size="sm" variant="primary" icon="check" loading={verify.isPending} onClick={() => verify.mutate(d._id)}>Verify</Button>
                <Button size="sm" variant="slate" loading={reject.isPending} onClick={() => reject.mutate(d._id)}>Reject</Button>
              </>
            )}
            {d.filePath && (
              <a className="btn btn-ghost btn-sm" href={d.filePath} target="_blank" rel="noreferrer">
                <Icon name="eye" width={13} height={13} />View
              </a>
            )}
            {isOwner && d.status === 'Pending' && (
              <Button size="sm" variant="ghost" icon="trash" loading={remove.isPending} onClick={() => onDelete(d)}>Delete</Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Documents"
        hint={isEmployee
          ? 'Upload your ID proofs, degrees and letters — HR verifies them here.'
          : 'ID proofs, degrees, letters — everything against each employee. Upload a file and verify with one tap.'}
        actions={<Button icon="upload" onClick={() => setUploadOpen(true)}>Upload document</Button>}
      />

      <Card pad={false}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <select className="input" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All statuses</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <select className="input" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
              <option value="">All types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="spacer" />
            <span className="chip chip-sky">{meta?.total ?? rows.length} documents</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          minWidth={820}
          emptyLabel="No documents yet"
          emptyHint={isEmployee ? 'Upload your first document above.' : 'Documents appear here once uploaded.'}
        />
      </Card>
      <Pagination meta={meta} onPage={(page) => setFilter({ page })} />

      <DocumentUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {isFetching && !isLoading && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, opacity: 0.6 }}>
          <Icon name="refresh" className="animate-spin" />
        </div>
      )}
    </>
  );
}
