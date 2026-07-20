import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput, Select } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  dept: z.string().min(1, 'Department is required'),
  role: z.string().min(1, 'Designation is required'),
  phone: z.string().optional().or(z.literal('')),
  join: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  salary: z.coerce.number().nonnegative().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  access: z.string().optional(),
});

const EMPTY = { name: '', email: '', dept: '', role: '', phone: '', join: '', dob: '', salary: 0, gender: 'M', access: 'Employee' };

export default function EmployeeFormModal({ open, onClose, employee, departments, roles }) {
  const toast = useToast();
  const qc = useQueryClient();
  const isEdit = Boolean(employee);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(employee ? { ...EMPTY, ...employee } : EMPTY);
  }, [open, employee, reset]);

  const save = useMutation({
    mutationFn: (values) => (isEdit ? employeeApi.update(employee._id, values) : employeeApi.create(values)),
    onSuccess: () => {
      toast(isEdit ? 'Employee updated' : 'Employee added');
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit employee' : 'Add employee'}
      sub={isEdit ? `Updating ${employee?.name}` : 'A login account is created automatically (default password Password@123).'}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="check" loading={save.isPending} onClick={handleSubmit((v) => save.mutate(v))}>
            {isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Full name" error={errors.name?.message}><TextInput {...register('name')} /></Field>
        <Field label="Email" error={errors.email?.message}><TextInput type="email" {...register('email')} /></Field>
        <Field label="Department" error={errors.dept?.message}>
          <Select {...register('dept')}>
            <option value="">Select…</option>
            {departments.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
          </Select>
        </Field>
        <Field label="Designation" error={errors.role?.message}><TextInput {...register('role')} placeholder="e.g. Frontend Developer" /></Field>
        <Field label="Phone"><TextInput {...register('phone')} /></Field>
        <Field label="Monthly salary (₹)" error={errors.salary?.message}><TextInput type="number" {...register('salary')} /></Field>
        <Field label="Date of joining"><TextInput type="date" {...register('join')} /></Field>
        <Field label="Date of birth"><TextInput type="date" {...register('dob')} /></Field>
        <Field label="Gender">
          <Select {...register('gender')}>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </Select>
        </Field>
        <Field label="Access role">
          <Select {...register('access')}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
