/**
 * Academic Records page: progress rings and per-year course tables,
 * all derived from what the user saved in the calculator.
 * Loaded as an ES module: <script type="module" src="../assets/js/pages/academic-records.js">
 */

import {
  SCALES,
  cumulative,
  gradePoint,
  gradeRemark,
  hasInput,
  formatGpa,
  latestYearWithResults,
} from "../core/calc.js";
import * as store from "../core/storage.js";
import { esc } from "../core/html.js";

const $ = (id) => document.getElementById(id);

const state = store.load() || store.newState();
const result = cumulative(state.years, state.scale);
const max = SCALES[state.scale].max;

/* ---------- progress rings ---------- */

function setRing(prefix, percent, label) {
  $(`${prefix}-ring`).style.setProperty("--p", percent);
  $(`${prefix}-pct`).textContent = label;
}

function renderRings() {
  // 1. Degree progress: units earned (passed) vs the total the user says they need.
  const earned = result.totalEarned;
  const degree = state.degreeUnits;
  if (degree) {
    const pct = Math.min(100, Math.round((earned / degree) * 100));
    setRing("degree", pct, `${pct}%`);
    $("degree-value").textContent = `${earned} / ${degree}`;
    $("degree-sub").textContent =
      earned >= degree ? "Degree units complete" : `${degree - earned} units to go`;
  } else {
    setRing("degree", 0, "—");
    $("degree-value").textContent = String(earned);
    $("degree-sub").textContent = "Set your degree total below";
  }

  // 2. Courses passed vs graded courses.
  const courses = result.totalCourses;
  if (courses > 0) {
    const pct = Math.round((result.totalPassed / courses) * 100);
    const failed = courses - result.totalPassed;
    setRing("passed", pct, `${pct}%`);
    $("passed-value").textContent = `${result.totalPassed} / ${courses}`;
    $("passed-sub").textContent = failed ? `${failed} failed` : "No failed courses";
  } else {
    setRing("passed", 0, "—");
    $("passed-value").textContent = "0 / 0";
    $("passed-sub").textContent = "No graded courses yet";
  }

  // 3. CGPA against the top of the grading scale.
  if (result.cgpa !== null) {
    const pct = Math.round((result.cgpa / max) * 100);
    setRing("cgpa", pct, `${pct}%`);
    $("cgpa-value").textContent = `${result.cgpa.toFixed(2)} / ${max.toFixed(2)}`;
    $("cgpa-sub").textContent = result.classification;
  } else {
    setRing("cgpa", 0, "—");
    $("cgpa-value").textContent = "—";
    $("cgpa-sub").textContent = "No results yet";
  }
}

/* ---------- course tables ---------- */

function statusFor(course) {
  const remark = gradePoint(course.grade, state.scale) !== null && Number(course.unit) > 0
    ? gradeRemark(course.grade, state.scale)
    : "";
  return remark || "Incomplete";
}

function renderSemesterTable(tableId, courses) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  const entered = courses.filter(hasInput);

  if (!entered.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-record-row">No academic records found for this semester.</td></tr>`;
    return;
  }

  tbody.innerHTML = entered
    .map(
      (c, i) => `
      <tr>
        <td data-label="S/N">${i + 1}</td>
        <td data-label="Code"><strong>${esc(c.code.trim() || "—")}</strong></td>
        <td data-label="Unit">${c.unit || "-"}</td>
        <td data-label="Grade">${esc(c.grade || "-")}</td>
        <td data-label="Status">${statusFor(c)}</td>
      </tr>`
    )
    .join("");
}

function showYear(index) {
  const year = state.years[index];
  const stats = result.breakdown[index];
  renderSemesterTable("table-sem1", year.sem1);
  renderSemesterTable("table-sem2", year.sem2);
  $("sem1-gpa").textContent = `GPA: ${formatGpa(stats.sem1.gpa)}`;
  $("sem2-gpa").textContent = `GPA: ${formatGpa(stats.sem2.gpa)}`;
}

/* ---------- init ---------- */

const select = $("level-select");
select.innerHTML = state.years
  .map((_, i) => `<option value="${i}">${(i + 1) * 100} Level</option>`)
  .join("");
select.value = String((latestYearWithResults(result.breakdown) || 1) - 1);
select.addEventListener("change", () => showYear(Number(select.value)));

const degreeInput = $("degree-units");
degreeInput.value = state.degreeUnits ?? "";
degreeInput.addEventListener("input", () => {
  const n = Math.round(Number(degreeInput.value));
  state.degreeUnits =
    degreeInput.value.trim() !== "" && n >= 1 && n <= store.LIMITS.degreeUnits ? n : null;

  // Re-read before saving so edits made in another tab (e.g. the calculator) aren't overwritten.
  const latest = store.load() || state;
  latest.degreeUnits = state.degreeUnits;
  store.save(latest);
  renderRings();
});

renderRings();
showYear(Number(select.value));