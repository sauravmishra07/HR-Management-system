import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput, TextArea } from '@/components/ui';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  body: z.string().min(1, 'Message is required'),
  pin: z.boolean().optional(),
});

const EMPTY = { title: '', body: '', pin: false };

export default function AnnouncementFormModal({ open, onClose, announcement }) {
  const toast = useToast();
  const qc = useQueryClient();
  const isEdit = Boolean(announcement);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(
        announcement
          ? { title: announcement.title, body: announcement.body, pin: !!announcement.pin }
          : EMPTY
      );
    }
  }, [open, announcement, reset]);

  const save = useMutation({
    mutationFn: (values) =>
      isEdit ? announcementApi.update(announcement._id, values) : announcementApi.create(values),
    onSuccess: () => {
      toast(isEdit ? 'Announcement updated' : 'Announcement published');
      qc.invalidateQueries({ queryKey: ['announcements'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit announcement' : 'New announcement'}
      sub={
        isEdit
          ? `Updating “${announcement?.title}”`
          : "Keep it short and clear — everyone will read this on their dashboard."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="mega" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            {isEdit ? 'Save changes' : 'Publish'}
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Title" full error={errors.title?.message}>
          <TextInput {...register('title')} placeholder="e.g. Office picnic on 30 August" />
        </Field>
        <Field label="Message" full error={errors.body?.message}>
          <TextArea
            rows={4}
            {...register('body')}
            placeholder="Keep it short and clear — everyone will read this on their dashboard."
          />
        </Field>
        <Field full>
          <label className="check-pill" style={{ display: 'inline-flex' }}>
            <input type="checkbox" {...register('pin')} /> Pin to top
          </label>
        </Field>
      </form>
    </Modal>
  );
}
