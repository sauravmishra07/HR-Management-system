import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi, employeeApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput, TextArea, Select } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Department name is required'),
  head: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

const EMPTY = { name: '', head: '', description: '' };

export default function DepartmentFormModal({ open, onClose, department }) {
  const toast = useToast();
  const qc = useQueryClient();
  const isEdit = Boolean(department);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const directory = useQuery({
    queryKey: ['employees', 'directory'],
    queryFn: employeeApi.directory,
    select: (r) => r.data,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      reset(
        department
          ? { name: department.name || '', head: department.head || '', description: department.description || '' }
          : EMPTY
      );
    }
  }, [open, department, reset]);

  const save = useMutation({
    mutationFn: (values) => {
      const match = (directory.data || []).find((e) => e.name === values.head);
      const body = { ...values, headEmpId: match?.empId };
      return isEdit ? departmentApi.update(department._id, body) : departmentApi.create(body);
    },
    onSuccess: () => {
      toast(isEdit ? 'Department updated' : 'Department created');
      qc.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit department' : 'Add department'}
      sub={isEdit ? `Updating ${department?.name}` : 'Teams group employees under a head. Headcount updates automatically.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={isEdit ? 'check' : 'plus'} loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            {isEdit ? 'Save changes' : 'Add'}
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Department name" error={errors.name?.message}>
          <TextInput {...register('name')} placeholder="e.g. R&D" />
        </Field>
        <Field label="Department head">
          <Select {...register('head')}>
            <option value="">Select…</option>
            {(directory.data || []).map((e) => (
              <option key={e.empId} value={e.name}>{e.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Description" full>
          <TextArea rows={3} {...register('description')} placeholder="What this team is responsible for (optional)." />
        </Field>
      </form>
    </Modal>
  );
}
