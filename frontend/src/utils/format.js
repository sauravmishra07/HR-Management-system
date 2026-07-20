const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** 'YYYY-MM-DD' → '05 Jul 2026'. */
export function fdate(s) {
  if (!s) return '—';
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return s;
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/** 'YYYY-MM-DD' → '05 Jul'. */
export function fdateShort(s) {
  if (!s) return '—';
  const [y, m, d] = String(s).split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1].slice(0, 3)}`;
}

/** 'YYYY-MM' → 'July 2026'. */
export function fmonth(s) {
  if (!s) return '—';
  const [y, m] = String(s).split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const currentMonth = () => todayISO().slice(0, 7);

/** Indian-grouped currency. */
export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Blue duotone avatar colour pairs (bg, fg) — from the reference. */
const AV = [
  ['#E7F0FE', '#1465E0'],
  ['#DDEBFF', '#0A3D91'],
  ['#EAF3FF', '#2F7BEA'],
  ['#E2EDFD', '#0E4FB5'],
  ['#EDF4FF', '#5A8FE8'],
  ['#E5EFFF', '#1F5FC9'],
];

export function avatarColors(name = '', seed) {
  const idx = (seed ?? name.length) % AV.length;
  return { bg: AV[idx][0], fg: AV[idx][1] };
}

/** Inclusive day count between two ISO dates. */
export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 864e5) + 1;
}

/** Amount in words (Indian numbering). */
export function inWords(value) {
  let n = Math.round(Number(value) || 0);
  if (n === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
  const three = (x) => (x > 99 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : '');
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
