/**
 * Dashboard: everything shown here is derived from what the user saved in the calculator.
 * Loaded as an ES module: <script type="module" src="../assets/js/pages/dashboard.js">
 */

import {
  SCALES,
  cumulative,
  semesterSeries,
  latestYearWithResults,
  formatGpa,
} from "../core/calc.js";
import * as store from "../core/storage.js";
import { lineChartSvg } from "../core/charts.js";

const $ = (id) => document.getElementById(id);

const state = store.load() || store.newState();
const result = cumulative(state.years, state.scale);
const series = semesterSeries(state.years, state.scale);
const max = SCALES[state.scale].max;

/* ---------- stat cards ---------- */

function renderStats() {
  const last = series[series.length - 1];
  const latestYear = latestYearWithResults(result.breakdown);

  $("stat-cgpa").textContent = result.cgpa === null ? "0.00" : result.cgpa.toFixed(2);
  $("stat-cgpa-sub").textContent = result.classification || "Add courses to get started";

  $("stat-units").textContent = result.totalUnits;
  $("stat-units-sub").textContent = last
    ? `${last.units} units in ${last.label}`
    : "No courses graded yet";

  $("stat-level").textContent = latestYear ? `${latestYear * 100}L` : "—";
  $("stat-level-sub").textContent = latestYear
    ? `${series.length} semester${series.length === 1 ? "" : "s"} recorded`
    : "No results yet";

  if (state.updatedAt) {
    const when = new Date(state.updatedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    $("stat-saved").textContent = "Saved";
    $("stat-saved-sub").textContent = `Last updated ${when}`;
  } else {
    $("stat-saved").textContent = "Empty";
    $("stat-saved-sub").textContent = "Nothing saved yet";
  }
}

/* ---------- progression chart ---------- */

function chartPoints() {
  const range = $("chart-range").value;
  const slice = range === "recent" ? series.slice(-5) : series;
  return slice.map((s) => ({ label: s.label, value: s.cgpa }));
}

function renderChart() {
  const box = $("progress-chart");
  const points = chartPoints();

  if (series.length < 2) {
    $("chart-sub").textContent = "CGPA after each semester";
    box.innerHTML = `<div class="empty-state">Add results for at least two semesters in the <a href="cgpa-calculator.html">calculator</a> to see your progression.</div>`;
    return;
  }

  $("chart-sub").textContent = `CGPA after each of your last ${points.length} semester${points.length === 1 ? "" : "s"}`;
  box.innerHTML = lineChartSvg(points, {
    max,
    width: box.clientWidth || 600,
    height: box.clientHeight || 300,
  });
}

/* ---------- semester table ---------- */

function renderSemesters() {
  const rows = series.slice(-5).reverse();
  const body = $("semester-rows");

  if (!rows.length) {
    body.innerHTML = `<div class="table-row"><div class="col empty-cell">No results yet. <a href="cgpa-calculator.html">Add your courses</a> to see them here.</div></div>`;
    return;
  }

  body.innerHTML = rows
    .map(
      (s) => `
      <div class="table-row">
        <div class="col"><ion-icon name="calculator-outline"></ion-icon> Year ${s.year} · Semester ${s.sem}</div>
        <div class="col">${s.units} units</div>
        <div class="col">${formatGpa(s.gpa)} / ${formatGpa(s.cgpa)}</div>
      </div>`
    )
    .join("");
}

/* ---------- init ---------- */

renderStats();
renderSemesters();
renderChart();

$("chart-range").addEventListener("change", renderChart);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderChart, 150);
});