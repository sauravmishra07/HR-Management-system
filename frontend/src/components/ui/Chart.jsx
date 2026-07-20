import { useEffect, useRef } from 'react';
import { ChartJS } from '@/lib/charts';

/**
 * Thin, imperative React wrapper around Chart.js.
 *
 * The chart instance is created once and reused: data/options are synced in
 * place on change (cheap `chart.update()`), while a change of `type`
 * (e.g. line ⇄ bar) rebuilds it to avoid scale/element glitches.
 *
 * Parents should memoise `data`/`options` (useMemo) so the sync effect only
 * runs on real changes.
 */
export default function Chart({
  type = 'line',
  data,
  options,
  plugins = [],
  height = 260,
  className = '',
  ariaLabel = 'Chart',
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Create (and recreate on type change).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    // Guard: under React StrictMode (dev double-mount) or HMR a chart may still
    // be attached to this canvas — destroy it before reusing the canvas.
    const stale = ChartJS.getChart(canvas);
    if (stale) stale.destroy();

    const chart = new ChartJS(canvas, { type, data, options, plugins });
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Sync data/options without tearing down the canvas.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data = data;
    chart.options = options;
    chart.update();
  }, [data, options]);

  return (
    <div className={`chart-box ${className}`} style={{ position: 'relative', height }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
    </div>
  );
}
