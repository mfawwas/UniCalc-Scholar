/**
 * Transcripts page: a live preview of the saved results, plus PDF download and print.
 * Loaded as an ES module: <script type="module" src="../assets/js/pages/transcripts.js">
 */

import * as store from "../core/storage.js";
import { formatGpa } from "../core/calc.js";
import { buildTranscript } from "../core/transcript.js";
import { downloadTranscriptPdf } from "../core/transcript-pdf.js";
import { esc } from "../core/html.js";

const $ = (id) => document.getElementById(id);

const model = buildTranscript(store.load() || store.newState());

function semesterHtml(sem) {
  const body = sem.rows.length
    ? `<div class="t-scroll"><table class="t-table">
        <thead><tr><th>S/N</th><th>Course Code</th><th>Unit</th><th>Grade</th></tr></thead>
        <tbody>${sem.rows
          .map(
            (r) =>
              `<tr><td>${r.sn}</td><td>${esc(r.code)}</td><td>${r.unit}</td><td>${esc(r.grade)}</td></tr>`
          )
          .join("")}</tbody>
      </table></div>`
    : `<div class="t-none">No courses entered</div>`;

  return `
    <div class="t-sem">
      <div class="t-sem-head"><span>${sem.label}</span><span>GPA: ${formatGpa(sem.gpa)}</span></div>
      ${body}
    </div>`;
}

function sheetHtml(m) {
  const s = m.summary;
  return `
    <article class="card t-sheet">
      <header class="t-head">
        <h2>${esc(m.name ? m.name.toUpperCase() : "NAME NOT PROVIDED")}</h2>
        <p>Matric: ${esc(m.matric || "not provided")}</p>
        <p>Grading scale: ${esc(m.scaleLabel)}</p>
      </header>

      ${m.years
        .map(
          (y) => `
        <section class="t-year">
          <h3>Academic Year ${y.number} <span>(${y.level} Level)</span></h3>
          <div class="t-sems">${y.semesters.map(semesterHtml).join("")}</div>
        </section>`
        )
        .join("")}

      <dl class="t-summary">
        <div><dt>Total Credit Units</dt><dd>${s.totalUnits}</dd></div>
        <div><dt>Credit Units Earned</dt><dd>${s.earnedUnits}</dd></div>
        <div><dt>Cumulative CGPA</dt><dd>${s.cgpa === null ? "0.00" : s.cgpa.toFixed(2)}</dd></div>
        <div><dt>Classification</dt><dd>${esc(s.classification || "N/A")}</dd></div>
      </dl>

      <p class="t-foot">Generated with UniCalc Scholar. Unofficial; for personal reference only.</p>
    </article>`;
}

if (model.hasData) {
  $("transcript-root").innerHTML = sheetHtml(model);
  $("btn-pdf").disabled = false;
  $("btn-print").disabled = false;

  if (!model.name || !model.matric) {
    $("t-note").insertAdjacentHTML(
      "beforeend",
      ` Add your name and matric number in the <a href="cgpa-calculator.html">calculator</a> to include them.`
    );
  }
} else {
  $("transcript-root").innerHTML = `
    <div class="card t-empty">
      <p>Nothing to show yet.</p>
      <p><a href="cgpa-calculator.html">Add your courses in the calculator</a> and your transcript will appear here.</p>
    </div>`;
}

$("btn-pdf").addEventListener("click", () => {
  $("t-status").textContent = downloadTranscriptPdf(model)
    ? ""
    : "The PDF tool didn't load. Check your connection and try again, or use Print.";
});

$("btn-print").addEventListener("click", () => window.print());
