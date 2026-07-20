import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { holidayApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput } from '@/components/ui';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  name: z.string().min(2, 'Name is required'),
});

const EMPTY = { date: '', name: '' };

export default function HolidayFormModal({ open, onClose }) {
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
    mutationFn: (values) => holidayApi.create(values),
    onSuccess: () => {
      toast('Holiday added to the calendar');
      qc.invalidateQueries({ queryKey: ['holidays'] });
      onClose();
    },
    // Backend 409s on a duplicate date — surface that message to the user.
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add holiday"
      sub="Company-declared holidays appear on everyone's calendar and dashboard."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="plus" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            Add
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Date" error={errors.date?.message}>
          <TextInput type="date" {...register('date')} />
        </Field>
        <Field label="Name" error={errors.name?.message}>
          <TextInput {...register('name')} placeholder="e.g. Company Foundation Day" />
        </Field>
      </form>
    </Modal>
  );
}
