import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import { Card, Button, Icon, DataTable, Pagination, Chip, Avatar, useConfirm } from '@/components/ui';
import { CANDIDATE_STAGES } from './offerUtils';
import CandidateFormModal from './CandidateFormModal';

export default function CandidatesTab({ onMakeOffer }) {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [filters, setFilters] = useState({ stage: '', job: '', search: '', page: 1 });
  const search = useDebounce(filters.search, 300);
  const [formOpen, setFormOpen] = useState(false);

  const params = { stage: filters.stage, job: filters.job, search, page: filters.page, limit: 12 };
  const { data, isLoading } = useQuery({
    queryKey: ['recruitment', 'candidates', params],
    queryFn: () => recruitmentApi.candidates(params),
    placeholderData: keepPreviousData,
  });
  const openings = useQuery({
    queryKey: ['recruitment', 'openings'],
    queryFn: () => recruitmentApi.openings({ limit: 100 }),
    select: (r) => r.data,
  });

  const rows = data?.data || [];
  const meta = data?.meta;
  const openingList = openings.data || [];

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const move = useMutation({
    mutationFn: ({ id, stage }) => recruitmentApi.moveStage(id, stage),
    onSuccess: (_r, v) => { toast(`Moved to ${v.stage}`); qc.invalidateQueries({ queryKey: ['recruitment', 'candidates'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const remove = useMutation({
    mutationFn: (id) => recruitmentApi.removeCandidate(id),
    onSuccess: () => { toast('Candidate removed'); qc.invalidateQueries({ queryKey: ['recruitment', 'candidates'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const askRemove = async (c) => {
    if (await confirm({ title: 'Remove candidate?', message: `${c.name} will be removed from the pipeline.`, okLabel: 'Remove', danger: true })) {
      remove.mutate(c._id);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Candidate',
      render: (c, i) => (
        <div className="emp-cell">
          <Avatar name={c.name} seed={i + 3} />
          <div>
            <div className="cell-main">{c.name}</div>
            <div className="cell-sub mono">{c.phone || c.code}</div>
          </div>
        </div>
      ),
    },
    { key: 'job', header: 'Applied for' },
    { key: 'exp', header: 'Experience', render: (c) => c.exp || '—' },
    { key: 'stage', header: 'Stage', render: (c) => <Chip status={c.stage} /> },
    { key: 'applied', header: 'Applied', render: (c) => fdate(c.applied) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
          {can('recruit') && (
            <select
              className="input"
              style={{ padding: '5px 26px 5px 9px', fontSize: 12, width: 'auto' }}
              value={c.stage}
              onChange={(e) => move.mutate({ id: c._id, stage: e.target.value })}
            >
              {CANDIDATE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {can('offer') && c.stage === 'Offer' && (
            <Button size="sm" variant="soft" icon="file" onClick={() => onMakeOffer(c)}>Make offer</Button>
          )}
          {can('recruit') && (
            <Button size="sm" variant="ghost" icon="trash" onClick={() => askRemove(c)}>Remove</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card pad={false}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <div className="search-inline">
              <Icon name="search" />
              <input
                className="input"
                placeholder="Search name, code, phone…"
                value={filters.search}
                onChange={(e) => setFilter({ search: e.target.value })}
              />
            </div>
            <select className="input" value={filters.stage} onChange={(e) => setFilter({ stage: e.target.value })}>
              <option value="">All stages</option>
              {CANDIDATE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input" value={filters.job} onChange={(e) => setFilter({ job: e.target.value })}>
              <option value="">All openings</option>
              {openingList.map((o) => <option key={o._id} value={o.title}>{o.title}</option>)}
            </select>
            <div className="spacer" />
            {can('recruit') && <Button icon="plus" onClick={() => setFormOpen(true)}>Add candidate</Button>}
            <span className="chip chip-sky">{meta?.total ?? rows.length} candidates</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          minWidth={860}
          emptyLabel="No candidates match your filter"
          emptyHint="Try a different stage or opening."
        />
      </Card>
      <Pagination meta={meta} onPage={(page) => setFilter({ page })} />

      <CandidateFormModal open={formOpen} onClose={() => setFormOpen(false)} openings={openingList} />
    </>
  );
}
