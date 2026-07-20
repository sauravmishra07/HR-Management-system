import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, Select } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  job: z.string().min(1, 'Please pick an opening'),
  phone: z.string().optional().or(z.literal('')),
  exp: z.string().optional().or(z.literal('')),
});

const EMPTY = { name: '', job: '', phone: '', exp: '' };

export default function CandidateFormModal({ open, onClose, openings = [] }) {
  const toast = useToast();
  const qc = useQueryClient();
  const openList = openings.filter((o) => o.status === 'Open');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset({ ...EMPTY, job: openList[0]?.title || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const save = useMutation({
    mutationFn: (values) =>
      recruitmentApi.createCandidate({
        name: values.name,
        job: values.job,
        phone: values.phone || undefined,
        exp: values.exp || undefined,
        applied: todayISO(),
      }),
    onSuccess: () => {
      toast('Candidate added to the pipeline');
      qc.invalidateQueries({ queryKey: ['recruitment', 'candidates'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add candidate"
      sub="Adds an applicant to the pipeline at the 'Applied' stage."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="plus" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>Add to pipeline</Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Full name" full error={errors.name?.message}>
          <TextInput {...register('name')} placeholder="e.g. Rohan Malhotra" />
        </Field>
        <Field label="Applying for" error={errors.job?.message}>
          <Select {...register('job')}>
            {openList.length ? (
              openList.map((o) => <option key={o._id} value={o.title}>{o.title}</option>)
            ) : (
              <option value="">No open openings — post one first</option>
            )}
          </Select>
        </Field>
        <Field label="Experience"><TextInput {...register('exp')} placeholder="e.g. 2 yrs" /></Field>
        <Field label="Phone" full error={errors.phone?.message}><TextInput {...register('phone')} placeholder="10-digit mobile" /></Field>
      </form>
    </Modal>
  );
}
