import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, TextArea, Select } from '@/components/ui';

const schema = z
  .object({
    type: z.enum(['Casual', 'Sick', 'Earned']),
    from: z.string().min(1, 'From date is required'),
    to: z.string().min(1, 'To date is required'),
    reason: z.string().max(300, 'Keep it under 300 characters').optional().or(z.literal('')),
  })
  .refine((v) => !v.from || !v.to || v.to >= v.from, {
    message: "'To' can't be before 'From'",
    path: ['to'],
  });

const empty = () => ({ type: 'Casual', from: todayISO(), to: todayISO(), reason: '' });

export default function LeaveApplyModal({ open, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: empty(),
  });

  useEffect(() => {
    if (open) reset(empty());
  }, [open, reset]);

  const apply = useMutation({
    mutationFn: (values) => leaveApi.apply(values),
    onSuccess: () => {
      toast('Leave request sent for approval');
      qc.invalidateQueries({ queryKey: ['leaves'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for leave"
      sub="Fill three things and send — that's it. Balance is deducted only after approval."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="send" loading={apply.isPending} onClick={handleSubmit((v) => apply.mutate(v))}>
            Send request
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => apply.mutate(v))}>
        <Field label="Leave type" error={errors.type?.message}>
          <Select {...register('type')}>
            <option value="Casual">Casual</option>
            <option value="Sick">Sick</option>
            <option value="Earned">Earned</option>
          </Select>
        </Field>
        <Field label="From" error={errors.from?.message}>
          <TextInput type="date" {...register('from')} />
        </Field>
        <Field label="To" error={errors.to?.message}>
          <TextInput type="date" {...register('to')} />
        </Field>
        <Field label="Reason" full error={errors.reason?.message}>
          <TextArea rows={3} placeholder="Short reason — e.g. family function, not feeling well…" {...register('reason')} />
        </Field>
      </form>
    </Modal>
  );
}
