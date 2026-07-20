import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { fdate, money } from '@/utils/format';
import { Modal, Button, Avatar, Chip, Spinner } from '@/components/ui';

/** Read-only employee profile with quick edit / activate-deactivate actions. */
export default function EmployeeProfileModal({ id, onClose, onEdit, onToggle }) {
  const { can } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.get(id),
    enabled: Boolean(id),
    select: (r) => r.data,
  });

  const e = data;

  return (
    <Modal
      open={Boolean(id)}
      onClose={onClose}
      title="Employee profile"
      footer={
        e && can('manageEmployee') ? (
          <>
            <Button variant="ghost" onClick={() => onToggle(e._id)}>
              {e.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button icon="edit" onClick={() => onEdit(e)}>Edit</Button>
          </>
        ) : (
          <Button variant="ghost" onClick={onClose}>Close</Button>
        )
      }
    >
      {isLoading || !e ? (
        <Spinner label="Loading profile…" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
            <Avatar name={e.name} seed={e.empId?.length} lg />
            <div>
              <div style={{ fontFamily: 'var(--font-disp)', fontSize: 18, fontWeight: 800 }}>{e.name}</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 13 }}>{e.role} · {e.dept}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                <Chip status={e.status} />
                <span className="chip chip-line">{e.access}</span>
              </div>
            </div>
          </div>

          <dl className="kv">
            <dt>Employee ID</dt><dd className="mono">{e.empId}</dd>
            <dt>Email</dt><dd>{e.email}</dd>
            <dt>Phone</dt><dd className="mono">{e.phone || '—'}</dd>
            <dt>Joined</dt><dd>{fdate(e.join)}</dd>
            <dt>Date of birth</dt><dd>{fdate(e.dob)}</dd>
            <dt>Monthly salary</dt><dd className="amt">{money(e.salary)}</dd>
            <dt>Gender</dt><dd>{{ M: 'Male', F: 'Female', O: 'Other' }[e.gender] || '—'}</dd>
          </dl>
        </>
      )}
    </Modal>
  );
}
