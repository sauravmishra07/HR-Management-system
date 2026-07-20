import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi, employeeApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import {
  PageHeader, Card, Button, Icon, Tabs, Spinner, EmployeeCell, Chip, useConfirm,
} from '@/components/ui';
import GoalFormModal from './GoalFormModal';
import ReviewFormModal from './ReviewFormModal';

function Stars({ rating = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }} title={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? 'var(--blue)' : 'var(--sky-2)', display: 'inline-flex' }}>
          <Icon name="star" width={15} height={15} />
        </span>
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const manage = can('manageGoals');

  const [tab, setTab] = useState('goals');
  const [goalOpen, setGoalOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [progressDraft, setProgressDraft] = useState({});

  const goals = useQuery({ queryKey: ['performance', 'goals'], queryFn: () => performanceApi.goals(), select: (r) => r.data });
  const reviews = useQuery({ queryKey: ['performance', 'reviews'], queryFn: () => performanceApi.reviews(), select: (r) => r.data });
  const directory = useQuery({ queryKey: ['employees', 'directory'], queryFn: employeeApi.directory, select: (r) => r.data, enabled: manage });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['performance'] });

  const bump = useMutation({
    mutationFn: ({ id, progress }) => performanceApi.bumpGoal(id, progress != null ? { progress } : undefined),
    onSuccess: (row) => { toast(row?.progress >= 100 ? 'Goal completed' : 'Progress updated'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const removeGoal = useMutation({
    mutationFn: (id) => performanceApi.removeGoal(id),
    onSuccess: () => { toast('Goal removed'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });
  const removeReview = useMutation({
    mutationFn: (id) => performanceApi.removeReview(id),
    onSuccess: () => { toast('Review removed'); invalidate(); },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const askRemoveGoal = async (g) => {
    if (await confirm({ title: 'Remove goal?', message: `“${g.title}” will be permanently removed.`, okLabel: 'Remove', danger: true })) {
      removeGoal.mutate(g._id);
    }
  };
  const askRemoveReview = async (r) => {
    if (await confirm({ title: 'Remove review?', message: `Review ${r.cycle} for ${r.employee?.name || r.emp} will be removed.`, okLabel: 'Remove', danger: true })) {
      removeReview.mutate(r._id);
    }
  };

  const setProgress = (g) => {
    const raw = progressDraft[g._id];
    const val = Math.max(0, Math.min(100, Number(raw)));
    if (raw === '' || Number.isNaN(val)) return;
    bump.mutate({ id: g._id, progress: val });
    setProgressDraft((d) => ({ ...d, [g._id]: '' }));
  };

  return (
    <>
      <PageHeader
        title="Performance"
        hint="Simple goals with a progress bar, and quarterly reviews with a 5-point rating."
        actions={manage && (
          <>
            <Button variant="ghost" icon="plus" onClick={() => setReviewOpen(true)}>Add review</Button>
            <Button icon="plus" onClick={() => setGoalOpen(true)}>Add goal</Button>
          </>
        )}
      />

      <Tabs
        tabs={[
          { key: 'goals', label: `Goals${goals.data ? ` · ${goals.data.length}` : ''}` },
          { key: 'reviews', label: `Reviews${reviews.data ? ` · ${reviews.data.length}` : ''}` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'goals' && (
        <div style={{ marginTop: 16 }}>
          {goals.isLoading ? (
            <Card><Spinner label="Loading goals…" /></Card>
          ) : !goals.data?.length ? (
            <Card>
              <div className="empty"><Icon name="target" width={38} height={38} /><b>No goals yet</b><p>Set a goal and track it with a simple progress bar.</p></div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {goals.data.map((g) => {
                const done = g.progress >= 100;
                return (
                  <Card key={g._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <EmployeeCell employee={g.employee} empId={g.emp} />
                      {done ? <Chip variant="solid">Done</Chip> : <span className="chip chip-sky">{g.progress}%</span>}
                    </div>
                    <div className="cell-main" style={{ marginTop: 12, whiteSpace: 'normal' }}>{g.title}</div>
                    <div className="cell-sub" style={{ marginTop: 3 }}>Due {fdate(g.due)}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12 }}>
                      <div className="mini-prog" style={{ flex: 1 }}><i style={{ width: `${g.progress}%` }} /></div>
                      <b className="mono" style={{ fontSize: 11.5 }}>{g.progress}%</b>
                    </div>

                    {manage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                        {!done && (
                          <Button size="sm" variant="soft" icon="plus" loading={bump.isPending && bump.variables?.id === g._id && bump.variables?.progress == null} onClick={() => bump.mutate({ id: g._id })}>
                            10%
                          </Button>
                        )}
                        <div className="search-inline" style={{ flex: 1, minWidth: 120 }}>
                          <input
                            className="input"
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Set %"
                            value={progressDraft[g._id] ?? ''}
                            onChange={(e) => setProgressDraft((d) => ({ ...d, [g._id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && setProgress(g)}
                          />
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setProgress(g)}>Set</Button>
                        <Button size="sm" variant="ghost" icon="trash" onClick={() => askRemoveGoal(g)} />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div style={{ marginTop: 16 }}>
          <Card title="Reviews" sub="quarterly notes with a 5-point rating">
            {reviews.isLoading ? (
              <Spinner label="Loading reviews…" />
            ) : !reviews.data?.length ? (
              <div className="empty"><Icon name="star" width={38} height={38} /><b>No reviews yet</b><p>Add a quarterly review to capture how someone is doing.</p></div>
            ) : (
              <div style={{ marginTop: 6 }}>
                {reviews.data.map((r) => (
                  <div className="list-row" key={r._id}>
                    <EmployeeCell employee={r.employee} empId={r.emp} />
                    <div className="lr-main" style={{ marginLeft: 4 }}>
                      <b>{r.cycle}</b>
                      <span>{r.note || 'No note'}</span>
                    </div>
                    <Stars rating={r.rating} />
                    {manage && (
                      <Button size="sm" variant="ghost" icon="trash" onClick={() => askRemoveReview(r)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {manage && (
        <>
          <GoalFormModal open={goalOpen} onClose={() => setGoalOpen(false)} directory={directory.data || []} />
          <ReviewFormModal open={reviewOpen} onClose={() => setReviewOpen(false)} directory={directory.data || []} />
        </>
      )}
    </>
  );
}
