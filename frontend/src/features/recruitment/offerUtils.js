/**
 * Recruitment salary helpers — ported from the RAMP reference `structBreakup`.
 * Derives a monthly + annual salary annexure from an annual CTC and a structure template.
 */

/** Candidate pipeline stages (matches backend CANDIDATE_STAGES). */
export const CANDIDATE_STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

/**
 * Compute a monthly + annual breakup from an annual CTC and a salary structure.
 * @param {number} annualCtc
 * @param {{ basicPct:number, hraPct:number, specialPct:number, pf:boolean, pt:number, gratuity:boolean, name?:string }} ss
 */
export function structBreakup(annualCtc, ss) {
  const gm = Math.round((Number(annualCtc) || 0) / 12);
  const basic = Math.round((gm * (ss?.basicPct || 0)) / 100);
  const hra = Math.round((gm * (ss?.hraPct || 0)) / 100);
  const special = gm - basic - hra;
  const pf = ss?.pf ? Math.min(1800, Math.round(basic * 0.12)) : 0;
  const pt = ss?.pt || 0;
  const ded = pf + pt;
  const netM = gm - ded;
  return { gm, basic, hra, special, pf, pt, ded, netM, annualCtc: Number(annualCtc) || 0, ss };
}
