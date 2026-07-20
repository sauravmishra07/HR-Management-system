import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate } from '@/utils/format';
import { PageHeader, Card, Button, Icon, Spinner, useConfirm } from '@/components/ui';
import AnnouncementFormModal from './AnnouncementFormModal';

export default function AnnouncementsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementApi.list(),
    select: (r) => r.data,
  });

  const pin = useMutation({
    mutationFn: (id) => announcementApi.togglePin(id),
    onSuccess: (res) => {
      toast(res?.data?.pin ? 'Pinned to top' : 'Unpinned');
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const del = useMutation({
    mutationFn: (id) => announcementApi.remove(id),
    onSuccess: () => {
      toast('Announcement deleted');
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onDelete = async (a) => {
    const ok = await confirm({
      title: 'Delete announcement?',
      message: `“${a.title}” will be removed from the notice board.`,
      okLabel: 'Delete',
      danger: true,
    });
    if (ok) del.mutate(a._id);
  };

  const manage = can('announce');

  return (
    <>
      <PageHeader
        title="Announcements"
        hint="The company notice board. Pin the important ones so they stay on top of everyone's dashboard."
        actions={
          manage && (
            <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>
              New announcement
            </Button>
          )
        }
      />

      {isLoading ? (
        <Card><Spinner /></Card>
      ) : list.length === 0 ? (
        <Card>
          <div className="empty">
            <Icon name="mega" width={38} height={38} />
            <b>No announcements yet</b>
            <p>{manage ? 'Post the first notice to get everyone in the loop.' : 'Check back later for company updates.'}</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {list.map((a) => (
            <div className="card ann-card" key={a._id}>
              {a.pin && <span className="pin">📌 Pinned</span>}
              <h4>{a.title}</h4>
              <p>{a.body}</p>
              <div className="ann-meta">
                <span>{a.by || '—'} · {fdate(a.date)}</span>
                {manage && (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <Button
                      size="sm"
                      variant={a.pin ? 'slate' : 'soft'}
                      loading={pin.isPending && pin.variables === a._id}
                      onClick={() => pin.mutate(a._id)}
                    >
                      {a.pin ? 'Unpin' : 'Pin to top'}
                    </Button>
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => { setEditing(a); setFormOpen(true); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => onDelete(a)}>
                      Delete
                    </Button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnnouncementFormModal open={formOpen} onClose={() => setFormOpen(false)} announcement={editing} />
    </>
  );
}
