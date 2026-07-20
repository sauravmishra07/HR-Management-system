import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi, departmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, Select } from '@/components/ui';

const schema = z.object({
  title: z.string().min(2, 'Job title is required'),
  dept: z.string().min(1, 'Department is required'),
  positions: z.coerce.number().int().positive('At least one position'),
  exp: z.string().optional().or(z.literal('')),
});

const EMPTY = { title: '', dept: '', positions: 1, exp: '' };

export default function OpeningFormModal({ open, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();

  const depts = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list, select: (r) => r.data, enabled: open });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => { if (open) reset(EMPTY); }, [open, reset]);

  const save = useMutation({
    mutationFn: (values) =>
      recruitmentApi.createOpening({
        title: values.title,
        dept: values.dept,
        positions: Number(values.positions) || 1,
        exp: values.exp || undefined,
        status: 'Open',
        posted: todayISO(),
      }),
    onSuccess: () => {
      toast('Opening published');
      qc.invalidateQueries({ queryKey: ['recruitment', 'openings'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New job opening"
      sub="Publish a role so candidates can be added against it."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="plus" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>Publish opening</Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Job title" full error={errors.title?.message}>
          <TextInput {...register('title')} placeholder="e.g. React Native Developer" />
        </Field>
        <Field label="Department" error={errors.dept?.message}>
          <Select {...register('dept')}>
            <option value="">Select…</option>
            {(depts.data || []).map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
          </Select>
        </Field>
        <Field label="Positions" error={errors.positions?.message}>
          <TextInput type="number" min="1" {...register('positions')} />
        </Field>
        <Field label="Experience range" full><TextInput {...register('exp')} placeholder="e.g. 1–3 yrs" /></Field>
      </form>
    </Modal>
  );
}
