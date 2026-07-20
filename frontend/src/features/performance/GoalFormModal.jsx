import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, Select } from '@/components/ui';

const schema = z.object({
  emp: z.string().min(1, 'Owner is required'),
  title: z.string().min(2, 'Write the goal first').max(200),
  due: z.string().optional().or(z.literal('')),
  progress: z.coerce.number().min(0).max(100).optional(),
});

const EMPTY = { emp: '', title: '', due: '', progress: 0 };

export default function GoalFormModal({ open, onClose, directory = [] }) {
  const toast = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset({ ...EMPTY, emp: directory[0]?.empId || '', due: todayISO() });
  }, [open, directory, reset]);

  const save = useMutation({
    mutationFn: (values) => performanceApi.createGoal(values),
    onSuccess: () => {
      toast('Goal added');
      qc.invalidateQueries({ queryKey: ['performance'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add goal"
      sub="A simple goal with a due date and starting progress."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="plus" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            Add goal
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Goal" error={errors.title?.message} full>
          <TextInput {...register('title')} placeholder="e.g. Launch client portal v1" />
        </Field>
        <Field label="Owner" error={errors.emp?.message}>
          <Select {...register('emp')}>
            <option value="">Select…</option>
            {directory.map((e) => (
              <option key={e.empId} value={e.empId}>{e.name} · {e.empId}</option>
            ))}
          </Select>
        </Field>
        <Field label="Due date" error={errors.due?.message}>
          <TextInput type="date" {...register('due')} />
        </Field>
        <Field label="Starting progress (%)" error={errors.progress?.message}>
          <TextInput type="number" min={0} max={100} {...register('progress')} />
        </Field>
      </form>
    </Modal>
  );
}
