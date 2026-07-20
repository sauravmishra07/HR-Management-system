import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { money, inWords, todayISO } from '@/utils/format';
import { Modal, Button, Field, TextInput, Select, Spinner } from '@/components/ui';
import { structBreakup } from './offerUtils';
import SalaryBreakup from './SalaryBreakup';

/**
 * Offer builder: pick a salary structure, set the CTC + join date + role/dept,
 * preview the monthly breakup, then generate the offer letter via the API.
 */
export default function OfferBuilderModal({ candidate, onClose, onGenerated }) {
  const open = Boolean(candidate);
  const toast = useToast();
  const qc = useQueryClient();

  const structures = useQuery({
    queryKey: ['recruitment', 'structures'],
    queryFn: () => recruitmentApi.structures(),
    select: (r) => r.data,
    enabled: open,
  });
  const openings = useQuery({
    queryKey: ['recruitment', 'openings'],
    queryFn: () => recruitmentApi.openings({ limit: 100 }),
    select: (r) => r.data,
    enabled: open,
  });

  const list = structures.data || [];

  const [structureCode, setStructureCode] = useState('');
  const [ctc, setCtc] = useState(600000);
  const [joinDate, setJoinDate] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('');

  // Reset scalar fields whenever a new candidate opens the builder.
  useEffect(() => {
    if (!open) return;
    setCtc(600000);
    setJoinDate(todayISO());
    setRole(candidate?.job || '');
    setStructureCode('');
    setDept('');
  }, [open, candidate?._id, candidate?.job]);

  // Default the structure once the list has loaded.
  useEffect(() => {
    if (open && !structureCode && list.length) setStructureCode(list[0].code);
  }, [open, structureCode, list]);

  // Prefill dept from the matching opening once openings load.
  useEffect(() => {
    if (open && !dept && candidate?.job && openings.data) {
      const match = openings.data.find((o) => o.title === candidate.job);
      if (match) setDept(match.dept);
    }
  }, [open, dept, candidate, openings.data]);

  const ss = list.find((s) => s.code === structureCode);
  const b = ss ? structBreakup(ctc, ss) : null;
  const canGenerate = Boolean(role && dept && Number(ctc) > 0 && structureCode);

  const generate = useMutation({
    mutationFn: () =>
      recruitmentApi.createOffer({
        candidateCode: candidate?.code,
        name: candidate?.name,
        role,
        dept,
        ctc: Number(ctc) || 0,
        joinDate: joinDate || undefined,
        structureCode,
      }),
    onSuccess: (res) => {
      toast('Offer letter generated');
      qc.invalidateQueries({ queryKey: ['recruitment', 'offers'] });
      qc.invalidateQueries({ queryKey: ['recruitment', 'candidates'] });
      onGenerated(res.data);
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Build offer — ${candidate?.name || ''}`}
      sub="Pick a salary structure, set the CTC, and generate a ready offer letter."
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon="file" loading={generate.isPending} disabled={!canGenerate} onClick={() => generate.mutate()}>
            Generate offer letter
          </Button>
        </>
      }
    >
      {structures.isLoading ? (
        <div style={{ padding: '40px 0', display: 'grid', placeItems: 'center' }}><Spinner /></div>
      ) : list.length === 0 ? (
        <div className="info-note">Create a salary structure first — the offer needs a structure to build the salary annexure.</div>
      ) : (
        <>
          <div className="form-grid">
            <Field label="Candidate">
              <TextInput value={`${candidate?.name || ''} — ${candidate?.job || ''}`} disabled readOnly />
            </Field>
            <Field label="Salary structure">
              <Select value={structureCode} onChange={(e) => setStructureCode(e.target.value)}>
                {list.map((s) => <option key={s._id} value={s.code}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Role / designation">
              <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer" />
            </Field>
            <Field label="Department">
              <TextInput value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. Engineering" />
            </Field>
            <Field label="Annual CTC (₹)">
              <TextInput type="number" value={ctc} onChange={(e) => setCtc(e.target.value)} />
            </Field>
            <Field label="Tentative joining date">
              <TextInput type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
            </Field>
          </div>

          {b && ss && (
            <div style={{ marginTop: 14 }}>
              <div className="card-title" style={{ marginBottom: 8 }}>
                <span>Salary annexure preview <span className="sub">{ss.name}</span></span>
              </div>
              <SalaryBreakup b={b} />
              <div className="info-note" style={{ marginTop: 10 }}>
                CTC {money(b.annualCtc)}/yr · {inWords(b.annualCtc)}. PF {ss.pf ? 'included' : 'not applicable'} · Gratuity {ss.gratuity ? 'applicable' : 'not applicable'}.
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
