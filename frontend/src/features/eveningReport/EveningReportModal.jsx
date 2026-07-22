import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eveningReportApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, TextArea } from '@/components/ui';

const schema = z.object({
  work: z.string().min(1, 'Tell us what you worked on today').max(2000, 'Keep it under 2000 characters'),
  plan: z.string().max(2000, 'Keep it under 2000 characters').optional().or(z.literal('')),
  blockers: z.string().max(2000, 'Keep it under 2000 characters').optional().or(z.literal('')),
  hours: z.coerce
    .number({ invalid_type_error: 'Hours must be a number' })
    .min(0, "Hours can't be negative")
    .max(24, 'A day only has 24 hours'),
});

const empty = (existing) => ({
  work: existing?.work || '',
  plan: existing?.plan || '',
  blockers: existing?.blockers || '',
  hours: existing?.hours ?? 8,
});

export default function EveningReportModal({ open, onClose, existing }) {
  const toast = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: empty(existing),
  });

  useEffect(() => {
    if (open) reset(empty(existing));
  }, [open, existing, reset]);

  const submit = useMutation({
    mutationFn: (values) => eveningReportApi.submit(values),
    onSuccess: () => {
      toast(existing ? 'Report updated and resubmitted' : 'Evening report submitted');
      qc.invalidateQueries({ queryKey: ['evening-reports'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Today's evening report"
      sub={`${fdate(todayISO())} — resubmitting replaces your earlier report for the day.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="send" loading={submit.isPending} onClick={handleSubmit((v) => submit.mutate(v))}>
            {existing ? 'Resubmit report' : 'Submit report'}
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => submit.mutate(v))}>
        <Field label="Work done today" full error={errors.work?.message}>
          <TextArea rows={4} placeholder="What did you get done today?" {...register('work')} />
        </Field>
        <Field label="Plan for tomorrow" full error={errors.plan?.message}>
          <TextArea rows={3} placeholder="What's first on tomorrow's list?" {...register('plan')} />
        </Field>
        <Field label="Blockers" full error={errors.blockers?.message}>
          <TextArea rows={2} placeholder="Anything slowing you down? Leave blank if none." {...register('blockers')} />
        </Field>
        <Field label="Hours worked" error={errors.hours?.message}>
          <TextInput type="number" step="0.5" min="0" max="24" {...register('hours')} />
        </Field>
      </form>
    </Modal>
  );
}
