import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { PageHeader, Card, Button, Icon, Spinner, useConfirm } from '@/components/ui';
import DepartmentFormModal from './DepartmentFormModal';

export default function DepartmentsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.list,
    select: (r) => r.data,
  });

  const del = useMutation({
    mutationFn: (id) => departmentApi.remove(id),
    onSuccess: () => {
      toast('Department deleted');
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
    // Backend blocks deletion while employees are still assigned — surface it.
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onDelete = async (d) => {
    const ok = await confirm({
      title: 'Delete department?',
      message: `“${d.name}” will be removed. This is blocked while employees are still assigned to it.`,
      okLabel: 'Delete',
      danger: true,
    });
    if (ok) del.mutate(d._id);
  };

  const manage = can('manageDepartment');

  return (
    <>
      <PageHeader
        title="Departments"
        hint="Teams and their heads. Headcount updates automatically as people join or move."
        actions={
          manage && (
            <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>
              Add department
            </Button>
          )
        }
      />

      {isLoading ? (
        <Card><Spinner /></Card>
      ) : list.length === 0 ? (
        <Card>
          <div className="empty">
            <Icon name="building" width={38} height={38} />
            <b>No departments yet</b>
            <p>{manage ? 'Create the first team to organise employees.' : 'Departments will appear here once created.'}</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {list.map((d) => (
            <div className="card dept-card" key={d._id}>
              <div className="dc-ico"><Icon name="building" /></div>
              <h4>{d.name}</h4>
              <div className="dc-head">Head: {d.head || '—'}</div>
              {d.description && (
                <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{d.description}</p>
              )}
              <div>
                <span className="dc-count">{d.headcount} member{d.headcount === 1 ? '' : 's'}</span>
              </div>
              {manage && (
                <div style={{ display: 'flex', gap: 6, marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <Button size="sm" variant="soft" icon="edit" onClick={() => { setEditing(d); setFormOpen(true); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" icon="trash" onClick={() => onDelete(d)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DepartmentFormModal open={formOpen} onClose={() => setFormOpen(false)} department={editing} />
    </>
  );
}
