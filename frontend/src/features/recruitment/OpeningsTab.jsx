import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import { Card, Button, Chip, Icon, Spinner, useConfirm } from '@/components/ui';
import OpeningFormModal from './OpeningFormModal';

export default function OpeningsTab() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['recruitment', 'openings'],
    queryFn: () => recruitmentApi.openings({ limit: 100 }),
    select: (r) => r.data,
  });
  const candidates = useQuery({
    queryKey: ['recruitment', 'candidates', 'all'],
    queryFn: () => recruitmentApi.candidates({ limit: 100 }),
    select: (r) => r.data,
  });

  const openings = data || [];
  const cands = candidates.data || [];

  const toggle = useMutation({
    mutationFn: (id) => recruitmentApi.toggleOpening(id),
    onSuccess: () => { toast('Opening updated'); qc.invalidateQueries({ queryKey: ['recruitment', 'openings'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const remove = useMutation({
    mutationFn: (id) => recruitmentApi.removeOpening(id),
    onSuccess: () => { toast('Opening removed'); qc.invalidateQueries({ queryKey: ['recruitment', 'openings'] }); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const askRemove = async (o) => {
    if (await confirm({ title: 'Remove opening?', message: `"${o.title}" will be removed.`, okLabel: 'Remove', danger: true })) {
      remove.mutate(o._id);
    }
  };

  const pipeline = (title) => cands.filter((c) => c.job === title && !['Hired', 'Rejected'].includes(c.stage)).length;

  return (
    <>
      {can('recruit') && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button icon="plus" onClick={() => setFormOpen(true)}>Post opening</Button>
        </div>
      )}

      {isLoading ? (
        <Card><div style={{ padding: '40px 0', display: 'grid', placeItems: 'center' }}><Spinner /></div></Card>
      ) : openings.length === 0 ? (
        <Card>
          <div className="empty">
            <Icon name="briefcase" width={38} height={38} />
            <b>No openings yet</b>
            <p>Post a job opening to start building a pipeline.</p>
          </div>
        </Card>
      ) : (
        <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {openings.map((o) => (
            <div className="card card-pad" key={o._id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <h4 style={{ fontFamily: 'var(--font-disp)', fontWeight: 700, fontSize: 15 }}>{o.title}</h4>
                <Chip status={o.status} />
              </div>
              <div className="cell-sub">{o.dept} · {o.positions} position{o.positions > 1 ? 's' : ''} · {o.exp || '—'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                <span className="cell-sub">Posted {fdate(o.posted)}</span>
                <span className="chip chip-sky">{pipeline(o.title)} in pipeline</span>
              </div>
              {can('recruit') && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="ghost" icon="refresh" onClick={() => toggle.mutate(o._id)}>
                    {o.status === 'Open' ? 'Close' : 'Reopen'}
                  </Button>
                  <Button size="sm" variant="ghost" icon="trash" onClick={() => askRemove(o)}>Remove</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <OpeningFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
