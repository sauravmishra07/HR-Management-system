import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exitApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, money, inWords } from '@/utils/format';
import {
  Modal, Button, Field, Select, Chip, EmployeeCell, Spinner, Icon, useConfirm,
} from '@/components/ui';

const CLEAR_KEYS = ['IT', 'Finance', 'Admin', 'HR', 'Reporting'];
const DOC_TYPES = ['Relieving Letter', 'Experience Letter', 'Full & Final Statement', 'No-Dues Clearance'];

const miniTitle = { fontFamily: 'var(--font-disp)', fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.2px' };

/** Download the letter text as a .txt file. */
function downloadLetter(doc) {
  const blob = new Blob([doc?.letter || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(doc?.name || doc?.type || 'exit-document').replace(/[^\w.-]+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Wide offboarding management modal: clearance, interview, F&F, documents. */
export default function ExitManageModal({ id, onClose }) {
  const { can } = useAuth();
  const manage = can('manageExit');
  const clearer = can('clearExit');
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [fnf, setFnf] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [letterDoc, setLetterDoc] = useState(null);

  const { data: exit, isLoading } = useQuery({
    queryKey: ['exit', id],
    queryFn: () => exitApi.get(id),
    enabled: Boolean(id),
    select: (r) => r.data,
  });

  useEffect(() => {
    if (exit) setFnf(String(exit.fnfAmount ?? 0));
  }, [exit?._id, exit?.fnfAmount]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['exit'] });
  const onError = (e) => toast(apiError(e), 'error');

  const clearance = useMutation({
    mutationFn: ({ key, value }) => exitApi.clearance(id, { key, value }),
    onSuccess: () => { toast('Clearance updated'); invalidate(); },
    onError,
  });
  const interview = useMutation({
    mutationFn: (done) => exitApi.interview(id, done),
    onSuccess: (_d, done) => { toast(done ? 'Interview marked done' : 'Interview reopened'); invalidate(); },
    onError,
  });
  const saveFnf = useMutation({
    mutationFn: (amount) => exitApi.fnf(id, amount),
    onSuccess: () => { toast('F&F amount saved'); invalidate(); },
    onError,
  });
  const settleFnf = useMutation({
    mutationFn: () => exitApi.settleFnf(id),
    onSuccess: () => { toast('Full & final settled'); invalidate(); },
    onError,
  });
  const withdraw = useMutation({
    mutationFn: () => exitApi.withdraw(id),
    onSuccess: () => { toast('Exit withdrawn'); invalidate(); onClose(); },
    onError,
  });
  const complete = useMutation({
    mutationFn: () => exitApi.complete(id),
    onSuccess: () => { toast('Exit completed'); invalidate(); onClose(); },
    onError,
  });
  const generate = useMutation({
    mutationFn: (type) => exitApi.generateDoc(id, type),
    onSuccess: (r) => { toast(`${docType} generated`); invalidate(); setLetterDoc(r.data); },
    onError,
  });
  const view = useMutation({
    mutationFn: (docId) => exitApi.getDoc(docId),
    onSuccess: (r) => setLetterDoc(r.data),
    onError,
  });

  const onWithdraw = async () => {
    if (await confirm({ title: 'Withdraw this exit?', message: 'The employee stays active and the offboarding is cancelled.', okLabel: 'Withdraw', danger: true })) {
      withdraw.mutate();
    }
  };
  const onComplete = async () => {
    if (await confirm({ title: 'Complete this exit?', message: 'The employee will be marked Exited and their login deactivated. This cannot be undone.', okLabel: 'Complete exit' })) {
      complete.mutate();
    }
  };

  const active = exit && exit.status !== 'Completed' && exit.status !== 'Withdrawn';
  const pct = exit?.clearancePct ?? 0;
  const docs = exit?.documents || [];

  return (
    <>
      <Modal
        open={Boolean(id)}
        onClose={onClose}
        title={exit ? `Exit — ${exit.employee?.name || exit.emp}` : 'Exit'}
        sub={exit ? `${exit.code} · ${exit.type} · last day ${fdate(exit.lastDay)}` : ''}
        wide
        footer={
          manage && active ? (
            <>
              <Button variant="ghost" onClick={onClose}>Close</Button>
              <Button variant="slate" loading={withdraw.isPending} onClick={onWithdraw}>Withdraw</Button>
              <Button icon="check" loading={complete.isPending} onClick={onComplete}>Complete exit</Button>
            </>
          ) : (
            <Button variant="ghost" onClick={onClose}>Close</Button>
          )
        }
      >
        {isLoading || !exit ? (
          <Spinner label="Loading exit…" />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <EmployeeCell employee={exit.employee} empId={exit.emp} />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip>{exit.type}</Chip>
                <Chip status={exit.status} />
                <span className="cell-sub">Applied {fdate(exit.applied)} → {fdate(exit.lastDay)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 22 }}>
              {/* ---- Clearance ---- */}
              <div>
                <div style={miniTitle}>No-dues clearance</div>
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {CLEAR_KEYS.map((key) => {
                    const done = Boolean(exit.clearance?.[key]);
                    return (
                      <label
                        key={key}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          border: '1px solid var(--line)', borderRadius: 10,
                          background: done ? 'var(--sky-3)' : 'var(--card)',
                          cursor: clearer ? 'pointer' : 'default',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={!clearer || clearance.isPending}
                          onChange={() => clearance.mutate({ key, value: !done })}
                        />
                        <span style={{ fontWeight: 700, flex: 1 }}>{key} clearance</span>
                        {done ? <Chip variant="solid">Cleared</Chip> : <Chip variant="line">Pending</Chip>}
                      </label>
                    );
                  })}
                </div>
                <div className="mini-prog" style={{ marginTop: 14 }}><i style={{ width: `${pct}%` }} /></div>
                <div className="cell-sub" style={{ marginTop: 6 }}>{pct}% complete</div>
              </div>

              {/* ---- Interview + F&F ---- */}
              <div>
                <div style={miniTitle}>Exit interview</div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid var(--line)', borderRadius: 10, padding: 12, marginTop: 10 }}>
                  <div>
                    <b>Interview done</b>
                    <p className="cell-sub">Feedback captured</p>
                  </div>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={Boolean(exit.interviewDone)}
                      disabled={!manage || interview.isPending}
                      onChange={(e) => interview.mutate(e.target.checked)}
                    />
                    <i />
                  </span>
                </label>

                <div style={{ ...miniTitle, marginTop: 18 }}>Full &amp; Final</div>
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <Field label="Settlement amount (₹)" full>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={fnf}
                      disabled={!manage}
                      onChange={(e) => setFnf(e.target.value)}
                    />
                  </Field>
                </div>
                {Number(fnf) > 0 && (
                  <div className="cell-sub" style={{ marginTop: 4 }}>{inWords(fnf)} Rupees</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="cell-sub">Status</span>
                  <Chip status={exit.fnfStatus} />
                  <span className="amt">{money(exit.fnfAmount)}</span>
                  {manage && (
                    <>
                      <Button size="sm" variant="soft" icon="check" loading={saveFnf.isPending} onClick={() => saveFnf.mutate(Number(fnf) || 0)}>Save</Button>
                      {exit.fnfStatus === 'Pending' && (
                        <Button size="sm" icon="banknote" loading={settleFnf.isPending} onClick={() => settleFnf.mutate()}>Mark settled</Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ---- Documents ---- */}
            <div style={{ ...miniTitle, marginTop: 22 }}>Documents</div>
            {docs.length ? (
              <div className="tbl-wrap" style={{ marginTop: 8 }}>
                <table className="data" style={{ minWidth: 520 }}>
                  <thead>
                    <tr>
                      <th>Document</th><th>Type</th><th>Source</th><th>Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d._id || d.code}>
                        <td>
                          <div className="cell-main">{d.name}</div>
                          <div className="cell-sub mono">{d.code}</div>
                        </td>
                        <td>{d.type}</td>
                        <td>{d.dir === 'generated' ? <Chip variant="deep">Generated</Chip> : <Chip variant="sky">Uploaded</Chip>}</td>
                        <td>{fdate(d.date)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {(d.dir === 'generated' || d.letter) && (
                            <Button size="sm" variant="ghost" icon="eye" loading={view.isPending && view.variables === (d._id || d.code)} onClick={() => view.mutate(d._id || d.code)}>View</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="cell-sub" style={{ marginTop: 8 }}>No documents yet.</p>
            )}

            {manage && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <Field label="Generate document">
                  <Select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ minWidth: 220 }}>
                    {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Button icon="file" loading={generate.isPending} onClick={() => generate.mutate(docType)}>Generate document</Button>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ---- Letter preview ---- */}
      <Modal
        open={Boolean(letterDoc)}
        onClose={() => setLetterDoc(null)}
        title={letterDoc?.type || 'Document'}
        sub={letterDoc?.name}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setLetterDoc(null)}>Close</Button>
            <Button icon="download" onClick={() => downloadLetter(letterDoc)}>Print / Download</Button>
          </>
        }
      >
        {letterDoc && (
          <div className="letter-preview">
            <div className="lp-head" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="file" />
              <b>{letterDoc.name}</b>
            </div>
            <pre>{letterDoc.letter || 'No letter content available.'}</pre>
          </div>
        )}
      </Modal>
    </>
  );
}
