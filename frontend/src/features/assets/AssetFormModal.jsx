import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput } from '@/components/ui';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  tag: z.string().optional().or(z.literal('')),
});

const EMPTY = { name: '', type: '', tag: '' };

/** Create a new (manual) asset in the register. */
export default function AssetFormModal({ open, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const create = useMutation({
    mutationFn: (values) => assetApi.create(values),
    onSuccess: () => {
      toast('Asset added');
      qc.invalidateQueries({ queryKey: ['assets'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add asset"
      sub="Add a company asset to the register. It lands in the store as Available."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="check" loading={create.isPending} onClick={handleSubmit((v) => create.mutate(v))}>
            Add asset
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => create.mutate(v))}>
        <Field label="Asset name" error={errors.name?.message} full>
          <TextInput {...register('name')} placeholder="e.g. Lenovo ThinkPad E14" />
        </Field>
        <Field label="Type" error={errors.type?.message}>
          <TextInput {...register('type')} placeholder="e.g. Laptop" />
        </Field>
        <Field label="Asset tag" error={errors.tag?.message}>
          <TextInput {...register('tag')} placeholder="e.g. LPT-051" />
        </Field>
      </form>
    </Modal>
  );
}
