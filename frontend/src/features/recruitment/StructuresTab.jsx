import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { money } from '@/utils/format';
import { Card, Button, DataTable, Chip, useConfirm } from '@/components/ui';
import StructureFormModal from './StructureFormModal';

export default function StructuresTab() {
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['recruitment', 'structures'],
    queryFn: () => recruitmentApi.structures(),
    select: (r) => r.data,
  });
  const rows = data || [];

  const remove = useMutation({
    mutationFn: (id) => recruitmentApi.removeStructure(id),
    onSuccess: () => { toast('Structure removed'); qc.invalidateQueries({ queryKey: ['recruitment', 'structures'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const askRemove = async (s) => {
    if (await confirm({ title: 'Remove salary structure?', message: "Offers already generated won't be affected.", okLabel: 'Remove', danger: true })) {
      remove.mutate(s._id);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Structure',
      render: (s) => (
        <div>
          <div className="cell-main">{s.name}</div>
          <div className="cell-sub mono">{s.code}{s.gratuity ? ' · gratuity' : ''}</div>
        </div>
      ),
    },
    { key: 'basicPct', header: 'Basic', render: (s) => `${s.basicPct}%` },
    { key: 'hraPct', header: 'HRA', render: (s) => `${s.hraPct}%` },
    { key: 'specialPct', header: 'Special', render: (s) => `${s.specialPct}%` },
    { key: 'pf', header: 'PF', render: (s) => (s.pf ? <Chip status="Active">Yes</Chip> : '—') },
    { key: 'pt', header: 'Prof. Tax', render: (s) => (s.pt ? money(s.pt) : '—') },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="ghost" icon="edit" onClick={() => { setEditing(s); setFormOpen(true); }}>Edit</Button>
          <Button size="sm" variant="ghost" icon="trash" onClick={() => askRemove(s)}>Remove</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card pad={false}>
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="card-title">
            <span>Salary structures <span className="sub">templates HR picks while building an offer — percentages of monthly gross</span></span>
            <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>Add structure</Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          minWidth={740}
          emptyLabel="No salary structures yet"
          emptyHint="Add one so HR can build offers."
        />
      </Card>

      <StructureFormModal open={formOpen} onClose={() => setFormOpen(false)} structure={editing} />
    </>
  );
}
