/**
 * Salary breakup from a monthly gross — mirrors the RAMP reference `breakup()`.
 * Basic 50%, HRA 20%, Special = remainder. PF/PT/TDS per Indian statutory slabs.
 */
export function breakup(gross) {
  const g = Number(gross) || 0;
  const basic = Math.round(g * 0.5);
  const hra = Math.round(g * 0.2);
  const special = g - basic - hra;
  const pf = basic >= 15000 ? 1800 : Math.round(basic * 0.12);
  const pt = g > 21000 ? 200 : 0;
  const tds = g > 90000 ? Math.round(g * 0.06) : g > 60000 ? Math.round(g * 0.03) : 0;
  const ded = pf + pt + tds;
  return { gross: g, basic, hra, special, pf, pt, tds, ded, net: g - ded };
}

/** Amount in words (Indian numbering) — used on payslips and F&F statements. */
export function inWords(value) {
  let n = Math.round(Number(value) || 0);
  if (n === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
  const three = (x) =>
    (x > 99 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : '');
  let out = '';
  const cr = Math.floor(n / 1e7); n %= 1e7;
  const l = Math.floor(n / 1e5); n %= 1e5;
  const t = Math.floor(n / 1e3); n %= 1e3;
  if (cr) out += three(cr) + ' Crore ';
  if (l) out += three(l) + ' Lakh ';
  if (t) out += three(t) + ' Thousand ';
  if (n) out += three(n);
  return out.trim();
}

/** Format an integer as Indian-grouped currency, e.g. ₹1,50,000. */
export function money(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}
