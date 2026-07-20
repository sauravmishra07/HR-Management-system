import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, employeeApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput, Select } from '@/components/ui';

const TYPES = ['Identity', 'Education', 'Employment', 'Other'];

const schema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Type is required'),
  emp: z.string().optional(),
});

const EMPTY = { name: '', type: 'Identity', emp: '' };

/** Upload an employee document (multipart) — HR can pick the owner; others upload for themselves. */
export default function DocumentUploadModal({ open, onClose }) {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const canVerify = can('verifyDoc');
  const [file, setFile] = useState(null);

  const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const directory = useQuery({
    queryKey: ['employees', 'directory'],
    queryFn: employeeApi.directory,
    select: (r) => r.data,
    enabled: open && canVerify,
  });

  useEffect(() => {
    if (open) { reset(EMPTY); setFile(null); }
  }, [open, reset]);

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && !getValues('name').trim()) setValue('name', f.name.replace(/\.[^.]+$/, ''));
  };

  const create = useMutation({
    mutationFn: (values) => {
      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('type', values.type);
      if (values.emp) fd.append('emp', values.emp);
      if (file) fd.append('file', file);
      return documentApi.create(fd);
    },
    onSuccess: () => {
      toast('Document uploaded — pending verification');
      qc.invalidateQueries({ queryKey: ['documents'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload document"
      sub="Choose a PDF or image from your device. The name is filled in from the file."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="upload" loading={create.isPending} onClick={handleSubmit((v) => create.mutate(v))}>
            Upload
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit((v) => create.mutate(v))}>
        {canVerify && (
          <Field label="Employee">
            <Select {...register('emp')}>
              <option value="">Myself</option>
              {(directory.data || []).map((emp) => (
                <option key={emp.empId} value={emp.empId}>{emp.name} — {emp.empId}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Type" error={errors.type?.message}>
          <Select {...register('type')}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="File" full>
          <input
            type="file"
            className="input"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
            onChange={onFile}
          />
        </Field>
        <Field label="Document name" error={errors.name?.message} full>
          <TextInput {...register('name')} placeholder="e.g. Aadhaar Card" />
        </Field>
      </form>
    </Modal>
  );
}
