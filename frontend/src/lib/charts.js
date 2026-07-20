/**
 * Chart.js setup for RAMP HRMS.
 *
 * Imports from `chart.js/auto`, which registers every controller, element and
 * scale (line, bar, doughnut, …) so no chart type can fail with an
 * "… is not a registered controller" error. Also exposes the brand palette +
 * theme-aware helpers so every chart across the app reads from one source of truth.
 */
import ChartJS from 'chart.js/auto';

// Sensible global defaults so charts inherit the app's typography.
ChartJS.defaults.font.family =
  '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace';
ChartJS.defaults.font.size = 11.5;
ChartJS.defaults.animation.duration = 650;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.responsive = true;

export { ChartJS };

/** Brand palette — from the provided reference swatches. */
export const BRAND = Object.freeze({
  navy: '#293681', // deep indigo
  blue: '#4274D9', // primary royal blue
  cyan: '#95CCDD', // sky accent
  mint: '#D0E7E6', // pale accent
});

/**
 * On-brand categorical sequence for multi-series charts (departments, etc.).
 * Stays inside the navy → blue → cyan family with a couple of harmonising tones.
 */
export const SERIES = Object.freeze([
  '#4274D9',
  '#293681',
  '#5BBCCF',
  '#6F8FD8',
  '#95CCDD',
  '#3251A6',
  '#2F9FB0',
  '#A9C0F0',
]);

/** Convert a #hex colour to an rgba() string with the given alpha. */
export function alpha(hex, a = 1) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Theme-aware colours for axes, grid lines, tooltips and legend text.
 * Pass the current `isDark` flag so charts repaint correctly on theme toggle.
 */
export function chartTheme(isDark) {
  return {
    text: isDark ? '#9fb2d0' : '#5b77a0',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,42,77,0.07)',
    border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(16,42,77,0.10)',
    tooltipBg: isDark ? '#0f1826' : '#102a4d',
    tooltipFg: '#ffffff',
  };
}
