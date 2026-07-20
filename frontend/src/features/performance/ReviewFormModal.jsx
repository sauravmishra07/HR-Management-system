import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput, TextArea, Select } from '@/components/ui';

const schema = z.object({
  emp: z.string().min(1, 'Employee is required'),
  cycle: z.string().min(1, 'Cycle is required'),
  rating: z.coerce.number().int().min(1).max(5),
  note: z.string().max(500).optional().or(z.literal('')),
});

const EMPTY = { emp: '', cycle: '', rating: 4, note: '' };

export default function ReviewFormModal({ open, onClose, directory = [] }) {
  const toast = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset({ ...EMPTY, emp: directory[0]?.empId || '', cycle: `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}` });
  }, [open, directory, reset]);

  const save = useMutation({
    mutationFn: (values) => performanceApi.createReview(values),
    onSuccess: () => {
      toast('Review added');
      qc.invalidateQueries({ queryKey: ['performance'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add review"
      sub="A short quarterly note with a 5-point rating."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="check" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            Add review
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Employee" error={errors.emp?.message}>
          <Select {...register('emp')}>
            <option value="">Select…</option>
            {directory.map((e) => (
              <option key={e.empId} value={e.empId}>{e.name} · {e.empId}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cycle" error={errors.cycle?.message}>
          <TextInput {...register('cycle')} placeholder="e.g. Q2 2026" />
        </Field>
        <Field label="Rating (out of 5)" error={errors.rating?.message}>
          <Select {...register('rating')}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
          </Select>
        </Field>
        <Field label="Note" error={errors.note?.message} full>
          <TextArea {...register('note')} rows={4} placeholder="What went well, what to improve…" />
        </Field>
      </form>
    </Modal>
  );
}
