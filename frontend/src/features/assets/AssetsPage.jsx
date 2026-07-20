import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { assetApi, settingsApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, DataTable, Pagination, EmployeeCell, Chip, StatCard, useConfirm,
} from '@/components/ui';
import AssetFormModal from './AssetFormModal';
import AssignAssetModal from './AssignAssetModal';

export default function AssetsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const manage = can('assignAsset');

  const [filters, setFilters] = useState({ search: '', type: '', status: '', page: 1 });
  const search = useDebounce(filters.search, 300);
  const [addOpen, setAddOpen] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [types, setTypes] = useState([]);

  const params = { search, type: filters.type, status: filters.status, page: filters.page, limit: 12 };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetApi.list(params),
    placeholderData: keepPreviousData,
  });
  const summary = useQuery({ queryKey: ['assets', 'summary'], queryFn: assetApi.summary, select: (r) => r.data });
  const settings = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, select: (r) => r.data });

  const rows = data?.data || [];
  const meta = data?.meta;
  const s = summary.data || {};
  const api = settings.data?.assetApi || {};

  // Accumulate the universe of asset types so the filter keeps every option
  // even after a filter narrows the current page to a single type.
  useEffect(() => {
    if (!rows.length) return;
    setTypes((prev) => {
      const next = new Set(prev);
      rows.forEach((a) => a.type && next.add(a.type));
      const merged = [...next].sort();
      return merged.length === prev.length ? prev : merged;
    });
  }, [rows]);

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const sync = useMutation({
    mutationFn: () => assetApi.sync(),
    onSuccess: (r) => {
      toast(`Synced — ${r.data?.count ?? 0} assets from the Asset API`);
      qc.invalidateQueries({ queryKey: ['assets'] });
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const returnAsset = useMutation({
    mutationFn: (id) => assetApi.returnAsset(id),
    onSuccess: () => { toast('Asset returned to store'); qc.invalidateQueries({ queryKey: ['assets'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const repairDone = useMutation({
    mutationFn: (id) => assetApi.repairDone(id),
    onSuccess: () => { toast('Asset back in store'); qc.invalidateQueries({ queryKey: ['assets'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onReturn = async (a) => {
    const ok = await confirm({
      title: 'Return asset',
      message: `Take ${a.name} back from ${a.employee?.name || 'the employee'} and return it to the store?`,
      okLabel: 'Take back',
      danger: true,
    });
    if (ok) returnAsset.mutate(a._id);
  };

  const columns = [
    {
      key: 'name',
      header: 'Asset',
      render: (a) => (
        <div>
          <div className="cell-main">{a.name}</div>
          <div className="cell-sub mono">{a.tag || a.code}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Type' },
    {
      key: 'emp',
      header: 'Assigned to',
      render: (a) => (a.emp ? <EmployeeCell employee={a.employee} empId={a.emp} /> : <span className="cell-sub">—</span>),
    },
    { key: 'since', header: 'Since', render: (a) => (a.since ? fdate(a.since) : <span className="cell-sub">in store</span>) },
    {
      key: 'src',
      header: 'Source',
      render: (a) => <Chip variant={a.src === 'api' ? 'sky' : 'slate'}>{a.src === 'api' ? 'API' : 'Manual'}</Chip>,
    },
    { key: 'status', header: 'Status', render: (a) => <Chip status={a.status} /> },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (a) => {
        if (!manage) return <span className="cell-sub">view only</span>;
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {a.status === 'Available' && (
              <Button size="sm" variant="soft" icon="login" onClick={() => setAssigning(a)}>Assign</Button>
            )}
            {a.status === 'Assigned' && (
              <Button size="sm" variant="slate" loading={returnAsset.isPending} onClick={() => onReturn(a)}>Take back</Button>
            )}
            {a.status === 'In Repair' && (
              <Button size="sm" variant="ghost" icon="check" loading={repairDone.isPending} onClick={() => repairDone.mutate(a._id)}>Back to store</Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Assets"
        hint="Laptops, monitors, kits, SIMs — who has what. The master list syncs from your Asset Management app over API."
        actions={manage && <Button icon="plus" onClick={() => setAddOpen(true)}>Add asset</Button>}
      />

      <div className="info-note">
        <span className="info-ico"><Icon name="plug" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>
            Asset Management API{' '}
            {api.enabled ? <Chip variant="sky">connected</Chip> : <Chip variant="slate">off</Chip>}
          </b>
          <div className="mono" style={{ marginTop: 3, wordBreak: 'break-all' }}>{api.url || 'Not configured'}</div>
          <div style={{ marginTop: 2 }}>
            {s.total ?? 0} assets in the register · last sync {api.lastSync || 'never'}
          </div>
        </div>
        {manage && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <Button variant="white" icon="refresh" loading={sync.isPending} onClick={() => sync.mutate()}>Sync now</Button>
            <Button variant="ghost" icon="gear" onClick={() => navigate('/settings')}>Configure</Button>
          </div>
        )}
      </div>

      <div className="grid-stats">
        <StatCard label="Total assets" icon="monitor" value={s.total ?? 0} trend="across all types" />
        <StatCard label="Assigned" icon="users" value={s.Assigned ?? 0} trend="with employees right now" />
        <StatCard label="Available" icon="gear" value={s.Available ?? 0} trend="ready in the store" />
        <StatCard label="In repair" icon="gear" value={s['In Repair'] ?? 0} trend="being serviced" />
      </div>

      <div style={{ marginTop: 18 }}>
      <Card pad={false}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <div className="search-inline">
              <Icon name="search" />
              <input
                className="input"
                placeholder="Search asset, tag…"
                value={filters.search}
                onChange={(e) => setFilter({ search: e.target.value })}
              />
            </div>
            <select className="input" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
              <option value="">All types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">All status</option>
              <option>Assigned</option>
              <option>Available</option>
              <option>In Repair</option>
            </select>
            <div className="spacer" />
            <span className="chip chip-sky">{meta?.total ?? rows.length} shown</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          minWidth={860}
          emptyLabel="No assets match your filter"
          emptyHint="Try a different type or status."
        />
      </Card>
      </div>
      <Pagination meta={meta} onPage={(page) => setFilter({ page })} />

      <AssetFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AssignAssetModal asset={assigning} onClose={() => setAssigning(null)} />

      {isFetching && !isLoading && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, opacity: 0.6 }}>
          <Icon name="refresh" className="animate-spin" />
        </div>
      )}
    </>
  );
}
