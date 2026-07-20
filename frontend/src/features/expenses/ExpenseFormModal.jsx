import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, Select } from '@/components/ui';

const CATS = ['Travel', 'Client Meeting', 'Hardware', 'Marketing', 'Other'];

const schema = z.object({
  title: z.string().min(2, 'Describe the expense first'),
  cat: z.enum(CATS),
  amt: z.coerce.number().positive('Enter a valid amount'),
  date: z.string().min(1, 'Pick a date'),
});

const EMPTY = { title: '', cat: 'Travel', amt: '', date: todayISO() };

export default function ExpenseFormModal({ open, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const save = useMutation({
    mutationFn: (values) => expenseApi.create(values),
    onSuccess: () => {
      toast('Claim submitted for approval');
      qc.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New reimbursement claim"
      sub="Your claim goes for approval, then accounts clears it for payout."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="send" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            Submit claim
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="What was it for?" error={errors.title?.message} full>
          <TextInput {...register('title')} placeholder="e.g. Cab to client site — JCI" />
        </Field>
        <Field label="Category" error={errors.cat?.message}>
          <Select {...register('cat')}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Amount (₹)" error={errors.amt?.message}>
          <TextInput type="number" step="0.01" {...register('amt')} placeholder="0" />
        </Field>
        <Field label="Date" error={errors.date?.message}>
          <TextInput type="date" {...register('date')} />
        </Field>
      </form>
    </Modal>
  );
}
