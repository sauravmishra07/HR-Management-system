import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi, employeeApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, Select } from '@/components/ui';

/** Assign an available asset to an employee (empId picked from the directory). */
export default function AssignAssetModal({ asset, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const open = Boolean(asset);
  const [empId, setEmpId] = useState('');

  const directory = useQuery({
    queryKey: ['employees', 'directory'],
    queryFn: employeeApi.directory,
    select: (r) => r.data,
    enabled: open,
  });

  useEffect(() => {
    if (open) setEmpId(directory.data?.[0]?.empId || '');
  }, [open, directory.data]);

  const assign = useMutation({
    mutationFn: () => assetApi.assign(asset._id, empId),
    onSuccess: () => {
      toast(`${asset.name} assigned`);
      qc.invalidateQueries({ queryKey: ['assets'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign asset"
      sub={asset ? `Give ${asset.name} (${asset.tag || asset.code}) to a team member.` : ''}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="check" loading={assign.isPending} disabled={!empId} onClick={() => assign.mutate()}>
            Assign
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Give to" full>
          <Select value={empId} onChange={(e) => setEmpId(e.target.value)}>
            {(directory.data || []).map((emp) => (
              <option key={emp.empId} value={emp.empId}>
                {emp.name} — {emp.empId}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
