import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { money, fdate } from '@/utils/format';
import { Modal, Button } from '@/components/ui';
import { structBreakup } from './offerUtils';
import SalaryBreakup from './SalaryBreakup';

/** Renders a generated offer letter in a printable / downloadable preview. */
export default function OfferLetterModal({ offer, onClose }) {
  const open = Boolean(offer);
  const toast = useToast();
  const docRef = useRef(null);

  const structures = useQuery({
    queryKey: ['recruitment', 'structures'],
    queryFn: () => recruitmentApi.structures(),
    select: (r) => r.data,
    enabled: open,
  });

  const ss = (structures.data || []).find((s) => s.code === offer?.structureCode);
  const b = offer && ss ? structBreakup(offer.ctc, ss) : null;
  const ssName = ss?.name || offer?.structureCode || '—';

  const download = () => {
    if (!offer) return;
    let txt = `LETTER OF OFFER — ${offer.code}\n\n${offer.letter || ''}\n`;
    if (b) {
      txt += `\n---- Annexure A · Salary Structure (${ssName}) ----\n`;
      txt += `Component            Monthly\tAnnual\n`;
      txt += `Basic                ${money(b.basic)}\t${money(b.basic * 12)}\n`;
      txt += `HRA                  ${money(b.hra)}\t${money(b.hra * 12)}\n`;
      txt += `Special Allowance    ${money(b.special)}\t${money(b.special * 12)}\n`;
      txt += `Gross Salary         ${money(b.gm)}\t${money(b.gm * 12)}\n`;
      if (b.pf) txt += `Less: Provident Fund ${money(b.pf)}\t${money(b.pf * 12)}\n`;
      if (b.pt) txt += `Less: Professional Tax ${money(b.pt)}\t${money(b.pt * 12)}\n`;
      txt += `Net Take-home        ${money(b.netM)}\t${money(b.netM * 12)}\n`;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
    a.download = `offer-${(offer.name || 'candidate').replace(/\s+/g, '-').toLowerCase()}-${offer.code}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Offer letter downloaded');
  };

  const printLetter = () => {
    const html = docRef.current?.outerHTML;
    if (!html) return;
    const w = window.open('', '_blank');
    if (!w) { toast('Please allow pop-ups to print', 'error'); return; }
    w.document.write(
      `<html><head><title>Offer Letter — ${offer.code}</title><style>`
      + 'body{font-family:Segoe UI,Arial,sans-serif;padding:32px;color:#102A4D}'
      + 'table{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px}'
      + 'th,td{border:1px solid #DEE8F6;padding:7px 10px;text-align:left}'
      + '.amt{text-align:right;font-variant-numeric:tabular-nums}'
      + 'pre{white-space:pre-wrap;font-family:inherit;line-height:1.6}h3{text-align:center}'
      + `</style></head><body>${html}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Offer letter — ${offer?.name || ''}`}
      sub={offer ? `${offer.code} · ${offer.role}` : ''}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="slate" icon="file" onClick={printLetter}>Print</Button>
          <Button icon="download" onClick={download}>Download</Button>
        </>
      }
    >
      {offer && (
        <div className="letter-preview" ref={docRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, borderBottom: '2px solid var(--blue)', paddingBottom: 12, marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-disp)', fontWeight: 800, fontSize: 16 }}>Letter of Offer</div>
            <div style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--ink-2)' }}>
              <div className="mono">{offer.code}</div>
              {offer.joinDate && <div>Joining {fdate(offer.joinDate)}</div>}
            </div>
          </div>
          <pre>{offer.letter}</pre>
          {b && (
            <div style={{ marginTop: 18 }}>
              <b style={{ fontSize: 13 }}>Annexure A — Salary Structure ({ssName})</b>
              <SalaryBreakup b={b} />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
