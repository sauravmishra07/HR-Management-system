import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { Modal, Button, Field, TextInput } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  basicPct: z.coerce.number().min(0).max(100),
  hraPct: z.coerce.number().min(0).max(100),
  pt: z.coerce.number().min(0).optional(),
  pf: z.boolean().optional(),
  gratuity: z.boolean().optional(),
});

const EMPTY = { name: '', basicPct: 50, hraPct: 20, pt: 200, pf: true, gratuity: true };

export default function StructureFormModal({ open, onClose, structure }) {
  const toast = useToast();
  const qc = useQueryClient();
  const isEdit = Boolean(structure);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(structure
        ? {
            name: structure.name,
            basicPct: structure.basicPct,
            hraPct: structure.hraPct,
            pt: structure.pt,
            pf: structure.pf,
            gratuity: structure.gratuity,
          }
        : EMPTY);
    }
  }, [open, structure, reset]);

  const basic = Number(watch('basicPct')) || 0;
  const hra = Number(watch('hraPct')) || 0;
  const special = 100 - basic - hra;
  const overflow = special < 0;
  const shownSum = overflow ? basic + hra : 100;

  const save = useMutation({
    mutationFn: (body) => (isEdit ? recruitmentApi.updateStructure(structure._id, body) : recruitmentApi.createStructure(body)),
    onSuccess: () => {
      toast(isEdit ? 'Structure updated' : 'Structure added');
      qc.invalidateQueries({ queryKey: ['recruitment', 'structures'] });
      onClose();
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onSubmit = (values) => {
    const b = Number(values.basicPct) || 0;
    const h = Number(values.hraPct) || 0;
    const sp = 100 - b - h;
    if (sp < 0) { toast("Basic + HRA can't exceed 100%", 'error'); return; }
    save.mutate({
      name: values.name,
      basicPct: b,
      hraPct: h,
      specialPct: sp,
      pf: !!values.pf,
      pt: Number(values.pt) || 0,
      gratuity: !!values.gratuity,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit salary structure' : 'New salary structure'}
      sub="Special allowance is the balancing figure so the three always add up to 100%."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="check" loading={save.isPending} disabled={overflow} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Save structure' : 'Add structure'}
          </Button>
        </>
      }
    >
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Structure name" full error={errors.name?.message}>
          <TextInput {...register('name')} placeholder="e.g. Standard (Engineering)" />
        </Field>
        <Field label="Basic %" error={errors.basicPct?.message}><TextInput type="number" {...register('basicPct')} /></Field>
        <Field label="HRA %" error={errors.hraPct?.message}><TextInput type="number" {...register('hraPct')} /></Field>
        <Field label="Special allowance %">
          <TextInput type="number" value={Math.max(0, special)} disabled readOnly />
        </Field>
        <Field label="Professional tax (₹ / month)" error={errors.pt?.message}><TextInput type="number" {...register('pt')} /></Field>

        <div className="fld full" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className={`chip ${overflow ? 'chip-slate' : 'chip-sky'}`}>
            Basic {basic}% + HRA {hra}% + Special {Math.max(0, special)}% = {shownSum}%
          </span>
          {overflow && <span style={{ color: '#b3261e', fontSize: 12, fontWeight: 600 }}>Basic + HRA can't exceed 100%</span>}
        </div>

        <div className="fld full">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" {...register('pf')} /> Deduct Provident Fund (12% of basic, capped at ₹1,800)
          </label>
        </div>
        <div className="fld full">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" {...register('gratuity')} /> Eligible for gratuity
          </label>
        </div>
      </form>
    </Modal>
  );
}
