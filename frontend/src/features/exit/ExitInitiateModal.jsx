import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exitApi, employeeApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput, TextArea, Select } from '@/components/ui';

const schema = z.object({
  emp: z.string().min(1, 'Pick an employee'),
  type: z.enum(['Resignation', 'Termination']),
  reason: z.string().min(1, 'A reason is required'),
  lastDay: z.string().min(1, 'Last working day is required'),
});

const EMPTY = { emp: '', type: 'Resignation', reason: '', lastDay: '' };

/** Initiate an exit for an active employee (HR only). */
export default function ExitInitiateModal({ open, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const directory = useQuery({
    queryKey: ['employees', 'directory'],
    queryFn: employeeApi.directory,
    select: (r) => r.data,
    enabled: open,
  });
  const actives = (directory.data || []).filter((e) => e.status === 'Active');

  const save = useMutation({
    mutationFn: (values) => exitApi.create(values),
    onSuccess: () => {
      toast('Exit initiated');
      qc.invalidateQueries({ queryKey: ['exit'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Initiate exit"
      sub="Start the offboarding process for an employee."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="check" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            Start process
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Employee" full error={errors.emp?.message}>
          <Select {...register('emp')}>
            <option value="">Select…</option>
            {actives.map((e) => (
              <option key={e.empId} value={e.empId}>{e.name} — {e.role || e.dept || e.empId}</option>
            ))}
          </Select>
        </Field>
        <Field label="Exit type" error={errors.type?.message}>
          <Select {...register('type')}>
            <option>Resignation</option>
            <option>Termination</option>
          </Select>
        </Field>
        <Field label="Last working day" error={errors.lastDay?.message}>
          <TextInput type="date" {...register('lastDay')} />
        </Field>
        <Field label="Reason" full error={errors.reason?.message}>
          <TextArea {...register('reason')} placeholder="e.g. Better opportunity, relocation…" />
        </Field>
      </form>
    </Modal>
  );
}
