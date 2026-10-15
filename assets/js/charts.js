/**
 * Dependency-free charts (no Chart.js, no CDN, works offline).
 * Colours come from the page's CSS variables, so light/dark mode just works.
 */

import { esc } from "./html.js";

/**
 * SVG line chart as a string.
 *   points:  [{ label, value }]  (at least 1)
 *   max:     top of the y axis (the grading scale's maximum)
 *   width/height: pixel size; render at the container's real size so text stays crisp
 */
export function lineChartSvg(points, { max = 5, width = 600, height = 300 } = {}) {
  const pad = { top: 16, right: 20, bottom: 32, left: 44 };
  const w = Math.max(240, Math.round(width));
  const h = Math.max(160, Math.round(height));
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const n = points.length;

  // Y axis: from a half-point step below the lowest value up to the scale maximum.
  const minValue = Math.min(...points.map((p) => p.value));
  let lo = Math.max(0, Math.floor((minValue - 0.4) * 2) / 2);
  if (max - lo < 1) lo = Math.max(0, max - 1);

  const x = (i) => (n === 1 ? pad.left + innerW / 2 : pad.left + (innerW * i) / (n - 1));
  const y = (v) => {
    const clamped = Math.min(Math.max(v, lo), max);
    return pad.top + innerH * (1 - (clamped - lo) / (max - lo));
  };

  let grid = "";
  for (let t = lo; t <= max + 1e-9; t += 0.5) {
    const ty = y(t).toFixed(1);
    grid +=
      `<line x1="${pad.left}" x2="${w - pad.right}" y1="${ty}" y2="${ty}" style="stroke:var(--border)" stroke-width="1"/>` +
      `<text x="${pad.left - 8}" y="${ty}" dy="4" text-anchor="end" font-size="11" style="fill:var(--text-light)">${t.toFixed(1)}</text>`;
  }

  // X labels: thin them out so they never overlap; always show the last one.
  const maxLabels = Math.max(2, Math.floor(innerW / 56));
  const step = Math.ceil(n / maxLabels);
  let labels = "";
  points.forEach((p, i) => {
    if ((n - 1 - i) % step !== 0) return;
    labels += `<text x="${x(i).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="11" style="fill:var(--text-light)">${esc(p.label)}</text>`;
  });

  const coords = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`);
  const line = n > 1 ? `<polyline points="${coords.join(" ")}" fill="none" style="stroke:var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` : "";
  const area =
    n > 1
      ? `<polygon points="${coords.join(" ")} ${x(n - 1).toFixed(1)},${pad.top + innerH} ${x(0).toFixed(1)},${pad.top + innerH}" style="fill:var(--accent)" fill-opacity="0.12"/>`
      : "";
  const dots = points
    .map(
      (p, i) =>
        `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4.5" style="fill:var(--card-bg);stroke:var(--accent)" stroke-width="2.5"><title>${esc(p.label)}: ${p.value.toFixed(2)}</title></circle>`
    )
    .join("");

  const first = points[0];
  const last = points[n - 1];
  const summary =
    n === 1
      ? `CGPA ${first.value.toFixed(2)} after ${first.label}`
      : `CGPA progression from ${first.value.toFixed(2)} (${first.label}) to ${last.value.toFixed(2)} (${last.label})`;

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(summary)}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${grid}${area}${line}${dots}${labels}</svg>`;
}