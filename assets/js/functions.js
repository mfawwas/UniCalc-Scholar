/**
 * CGPA calculator page controller.
 * - `state` is the single source of truth; the DOM is rendered from it.
 * - Saved automatically to this device (localStorage). No account or server needed.
 * - Loaded as an ES module: <script type="module" src="../assets/js/functions.js">
 */

import {
  MAX_UNIT,
  SCALES,
  normalizeScale,
  gradesFor,
  cumulative,
  formatGpa,
  hasInput,
  planTarget,
} from "./core/calc.js";
import * as store from "./core/storage.js";

const { LIMITS, blankCourse, blankYear } = store;

const $ = (id) => document.getElementById(id);
const els = {
  name: $("studentName"),
  matric: $("matricNo"),
  scale: $("gradeScale"),
  years: $("years-container"),
  breakdown: $("gpa-breakdown"),
  totalUnits: $("totalUnits"),
  cgpa: $("cgpa"),
  cls: $("class"),
  warning: $("calc-warning"),
  saveNote: $("save-note"),
  modal: $("clearModal"),
  importFile: $("import-file"),
  planTargetInput: $("planTarget"),
  planRemainingInput: $("planRemaining"),
  planChips: $("plan-chips"),
  planResult: $("plan-result"),
};

let state = store.load() || store.newState();
let saveTimer = null;
let toastTimer = null;

/* ---------- helpers ---------- */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

function toast(message) {
  let el = $("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

function yearHasData(year) {
  return [...year.sem1, ...year.sem2].some(hasInput);
}

function anyData() {
  return (
    state.studentName.trim() ||
    state.matricNo.trim() ||
    state.years.some(yearHasData)
  );
}

/* ---------- rendering ---------- */

function unitOptions(selected) {
  let html = `<option value="0">-</option>`;
  for (let u = 1; u <= MAX_UNIT; u++) {
    html += `<option value="${u}"${u === Number(selected) ? " selected" : ""}>${u}</option>`;
  }
  return html;
}

function gradeOptions(selected) {
  return (
    `<option value="">-</option>` +
    gradesFor(state.scale)
      .map((g) => `<option value="${g}"${g === selected ? " selected" : ""}>${g}</option>`)
      .join("")
  );
}

function rowHtml(course, index) {
  return `
    <tr data-row="${index}">
      <td>${index + 1}</td>
      <td><input type="text" class="c-code" maxlength="${LIMITS.code}" autocomplete="off" aria-label="Course code" placeholder="e.g. MTH101" value="${esc(course.code)}"></td>
      <td><select class="c-unit" aria-label="Credit unit">${unitOptions(course.unit)}</select></td>
      <td><select class="c-grade" aria-label="Grade">${gradeOptions(course.grade)}</select></td>
      <td><button type="button" class="btn btn-remove" data-action="remove-row" aria-label="Remove course">×</button></td>
    </tr>`;
}

function rowsHtml(list) {
  return list.map(rowHtml).join("");
}

function semesterHtml(yearIndex, key, title) {
  return `
    <div class="card">
      <div class="card-title">
        <span>${title}</span>
        <div class="bulk-add">
          <select aria-label="How many courses to add">
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5" selected>5</option>
            <option value="10">10</option>
          </select>
          <button type="button" class="btn-add" data-action="add-rows" data-year="${yearIndex}" data-sem="${key}">+ Add Course</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:50px">SN</th>
            <th>COURSE CODE</th>
            <th style="width:100px">UNIT</th>
            <th style="width:100px">GRADE</th>
            <th style="width:50px"></th>
          </tr>
        </thead>
        <tbody data-year="${yearIndex}" data-sem="${key}">${rowsHtml(state.years[yearIndex][key])}</tbody>
      </table>
    </div>`;
}

function yearHtml(index) {
  const removeBtn =
    state.years.length > 1
      ? `<button type="button" class="btn-year-remove" data-action="remove-year" data-year="${index}">Remove year</button>`
      : "";
  return `
    <section class="year-group" id="year-${index + 1}">
      <div class="year-head">
        <h2>ACADEMIC YEAR ${index + 1}</h2>
        ${removeBtn}
      </div>
      ${semesterHtml(index, "sem1", "SEMESTER ONE")}
      ${semesterHtml(index, "sem2", "SEMESTER TWO")}
    </section>`;
}

function renderAll() {
  els.name.value = state.studentName;
  els.matric.value = state.matricNo;
  els.scale.value = String(state.scale);
  els.planTargetInput.value = state.plan.target ?? "";
  els.planRemainingInput.value = state.plan.remaining ?? "";
  els.years.innerHTML = state.years.map((_, i) => yearHtml(i)).join("");
  updateSummary();
}

function renderSemester(yearIndex, key) {
  const body = els.years.querySelector(
    `tbody[data-year="${yearIndex}"][data-sem="${key}"]`
  );
  if (body) body.innerHTML = rowsHtml(state.years[yearIndex][key]);
}

function updateSummary() {
  const result = cumulative(state.years, state.scale);

  els.totalUnits.textContent = result.totalUnits;
  els.cgpa.textContent = result.cgpa === null ? "0.00" : result.cgpa.toFixed(2);
  els.cls.textContent = result.classification || "N/A";

  els.breakdown.innerHTML = result.breakdown
    .map(
      (b) => `
      <div class="gpa-row">
        <span><b>YEAR ${b.year}</b></span>
        <span>S1 GPA: <b>${formatGpa(b.sem1.gpa)}</b></span>
        <span>S2 GPA: <b>${formatGpa(b.sem2.gpa)}</b></span>
      </div>`
    )
    .join("");

  if (result.incomplete > 0) {
    els.warning.hidden = false;
    els.warning.textContent =
      result.incomplete === 1
        ? "1 course needs both a unit and a grade before it counts."
        : `${result.incomplete} courses need both a unit and a grade before they count.`;
  } else {
    els.warning.hidden = true;
  }

  renderPlan(result);
}

/* ---------- target planner ---------- */

const LEVEL_TEXT = {
  achievable: "Achievable",
  challenging: "Challenging",
  demanding: "Very demanding",
};

function renderPlan(result) {
  const { target, remaining } = state.plan;

  // Quick-pick targets: the lowest CGPA for each of the top classes on this scale.
  els.planChips.innerHTML = SCALES[state.scale].classes
    .slice(0, 3)
    .map(
      (tier) =>
        `<button type="button" class="plan-chip" data-action="plan-target" data-value="${tier.min}" aria-pressed="${target === tier.min}">${tier.name} (${tier.min.toFixed(2)}+)</button>`
    )
    .join("");

  const box = els.planResult;
  box.className = "plan-result";

  if (target === null && remaining === null) {
    box.innerHTML = `<div class="plan-detail">Pick a target and enter how many credit units you still have to take. We'll work out the average grade you need.</div>`;
    return;
  }

  const plan = planTarget(
    { units: result.totalUnits, points: result.totalPoints },
    target,
    remaining,
    state.scale
  );
  const top = gradesFor(state.scale)[0];

  if (plan.status === "invalid") {
    box.classList.add("is-info");
    box.innerHTML = `<div class="plan-detail">${
      plan.reason === "target"
        ? `Enter a target between 0.01 and ${plan.max.toFixed(2)}.`
        : "Enter how many credit units you still have to take."
    }</div>`;
    return;
  }

  if (plan.status === "safe") {
    box.classList.add("is-ok");
    box.innerHTML = `
      <div class="plan-headline">You've already secured this target.</div>
      <div class="plan-detail">Even if you scored F in all ${plan.remaining} remaining units, you'd still finish on ${plan.worstCgpa.toFixed(2)}.</div>`;
    return;
  }

  if (plan.status === "impossible") {
    box.classList.add("is-bad");
    const more = plan.minUnits
      ? `You'd need at least ${plan.minUnits} more units of straight ${top}'s (${plan.minUnits - plan.remaining} more than you have left).`
      : `It can't be reached on the ${SCALES[state.scale].label}.`;
    box.innerHTML = `
      <div class="plan-headline">That target isn't reachable with ${plan.remaining} units left.</div>
      <div class="plan-detail">Even straight ${top}'s would only get you to ${plan.maxCgpa.toFixed(2)}. ${more}</div>`;
    return;
  }

  // possible
  box.classList.add(plan.level === "achievable" ? "is-ok" : "is-warn");
  const mix =
    plan.mix.length === 1
      ? `That works out to ${plan.mix[0].grade}'s across the board.`
      : `Roughly ${plan.mix[0].percent}% of those units at ${plan.mix[0].grade} and ${plan.mix[1].percent}% at ${plan.mix[1].grade}. Percentages are by credit units, so bigger courses count for more.`;
  const start =
    result.totalUnits > 0
      ? `Starting from ${result.cgpa.toFixed(2)} over ${result.totalUnits} units.`
      : "No results entered yet, so this is based on your remaining units alone.";
  box.innerHTML = `
    <div class="plan-headline">You need an average GPA of <b>${plan.needed.toFixed(2)}</b> across your remaining ${plan.remaining} units.</div>
    <div class="plan-detail">${mix}</div>
    <div class="plan-detail">${start}</div>
    <span class="plan-tag">${LEVEL_TEXT[plan.level]}</span>`;
}

/* ---------- saving ---------- */

function setSaveNote(ok) {
  els.saveNote.classList.toggle("is-error", !ok);
  els.saveNote.textContent = ok
    ? "Your data saves automatically on this device."
    : "Couldn't save on this device (browser storage is blocked or full). Download a backup so you don't lose your work.";
}

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  setSaveNote(store.save(state));
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 400);
}

function commit() {
  updateSummary();
  scheduleSave();
}

/* ---------- editing ---------- */

function onScaleChange() {
  const next = normalizeScale(els.scale.value);
  if (next === state.scale) return;

  const valid = new Set(gradesFor(next));
  let cleared = 0;
  for (const year of state.years) {
    for (const key of ["sem1", "sem2"]) {
      for (const course of year[key]) {
        if (course.grade && !valid.has(course.grade)) {
          course.grade = "";
          cleared++;
        }
      }
    }
  }

  state.scale = next;
  renderAll();
  scheduleSave();
  toast(
    cleared
      ? `Switched to the ${SCALES[next].label}. ${cleared} grade(s) that don't exist on this scale were cleared.`
      : `Switched to the ${SCALES[next].label}.`
  );
}

function parseNumber(value) {
  const trimmed = String(value).trim();
  const n = Number(trimmed);
  return trimmed === "" || !Number.isFinite(n) ? null : n;
}

function onEdit(event) {
  const target = event.target;

  if (target === els.scale) return onScaleChange();
  if (target === els.name) {
    state.studentName = target.value;
    return scheduleSave();
  }
  if (target === els.matric) {
    state.matricNo = target.value;
    return scheduleSave();
  }
  if (target === els.planTargetInput) {
    state.plan.target = parseNumber(target.value);
    return commit();
  }
  if (target === els.planRemainingInput) {
    const n = parseNumber(target.value);
    state.plan.remaining = n === null ? null : Math.round(n);
    return commit();
  }

  const tbody = target.closest("tbody[data-year]");
  const row = target.closest("tr[data-row]");
  if (!tbody || !row) return;

  const course =
    state.years[Number(tbody.dataset.year)]?.[tbody.dataset.sem]?.[
      Number(row.dataset.row)
    ];
  if (!course) return;

  if (target.classList.contains("c-code")) course.code = target.value;
  else if (target.classList.contains("c-unit")) course.unit = Number(target.value) || 0;
  else if (target.classList.contains("c-grade")) course.grade = target.value;
  else return;

  commit();
}

/* ---------- actions ---------- */

function addYear() {
  if (state.years.length >= LIMITS.years) {
    return toast(`You can add up to ${LIMITS.years} academic years.`);
  }
  state.years.push(blankYear());
  renderAll();
  scheduleSave();
  $(`year-${state.years.length}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeYear(btn) {
  const index = Number(btn.dataset.year);
  const year = state.years[index];
  if (!year || state.years.length <= 1) return;
  if (
    yearHasData(year) &&
    !confirm(`Remove Academic Year ${index + 1} and all its courses?`)
  ) {
    return;
  }
  state.years.splice(index, 1);
  renderAll();
  scheduleSave();
}

function addRows(btn) {
  const list = state.years[Number(btn.dataset.year)]?.[btn.dataset.sem];
  if (!list) return;

  const wanted = Number(btn.parentElement.querySelector("select").value) || 1;
  const room = LIMITS.rowsPerSemester - list.length;
  if (room <= 0) {
    return toast(`Maximum of ${LIMITS.rowsPerSemester} courses per semester.`);
  }

  for (let i = 0; i < Math.min(wanted, room); i++) list.push(blankCourse());
  renderSemester(Number(btn.dataset.year), btn.dataset.sem);
  scheduleSave();
  if (wanted > room) {
    toast(`Maximum of ${LIMITS.rowsPerSemester} courses per semester.`);
  }
}

function removeRow(btn) {
  const tbody = btn.closest("tbody[data-year]");
  const row = btn.closest("tr[data-row]");
  if (!tbody || !row) return;

  const yearIndex = Number(tbody.dataset.year);
  state.years[yearIndex]?.[tbody.dataset.sem]?.splice(Number(row.dataset.row), 1);
  renderSemester(yearIndex, tbody.dataset.sem);
  commit();
}

function pickTarget(btn) {
  state.plan.target = Number(btn.dataset.value);
  els.planTargetInput.value = state.plan.target;
  commit();
}

/* ---------- clear-all modal ---------- */

function openModal() {
  els.modal.classList.add("active");
  els.modal.querySelector(".btn-modal-cancel")?.focus();
}

function closeModal() {
  els.modal.classList.remove("active");
}

function confirmClear() {
  state = store.newState(state.scale);
  store.save(state);
  renderAll();
  closeModal();
  toast("All records cleared.");
}

/* ---------- backup ---------- */

function exportBackup() {
  flushSave();
  store.downloadBackup(state);
}

async function importBackup() {
  const file = els.importFile.files[0];
  els.importFile.value = "";
  if (!file) return;
  if (file.size > 1_000_000) {
    return toast("That file is too large to be a UniCalc backup.");
  }

  try {
    const next = store.parseBackup(await file.text());
    if (
      anyData() &&
      !confirm("Importing will replace everything currently on this page. Continue?")
    ) {
      return;
    }
    state = next;
    renderAll();
    flushSave();
    toast("Backup imported.");
  } catch (err) {
    toast(err.message);
  }
}

/* ---------- PDF transcript ---------- */

function exportPDF() {
  const jsPDF = window.jspdf?.jsPDF;
  const doc = jsPDF ? new jsPDF() : null;
  if (!doc || typeof doc.autoTable !== "function") {
    return toast("The PDF tool didn't load. Check your connection and try again.");
  }

  const result = cumulative(state.years, state.scale);
  const name = state.studentName.trim() || "NAME NOT PROVIDED";
  const matric = state.matricNo.trim() || "MATRIC NOT PROVIDED";

  doc.setFont(undefined, "bold");
  doc.setFontSize(18);
  doc.text(name.toUpperCase(), 105, 20, { align: "center" });
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  doc.text(`MATRIC: ${matric}`, 105, 28, { align: "center" });
  doc.text(`Grading scale: ${SCALES[state.scale].label}`, 105, 34, { align: "center" });
  doc.line(20, 38, 190, 38);

  let y = 48;

  state.years.forEach((year, yi) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`ACADEMIC YEAR ${yi + 1}`, 20, y);
    doc.setFont(undefined, "normal");
    y += 5;

    [["sem1", "SEM 1"], ["sem2", "SEM 2"]].forEach(([key, label]) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      const stats = result.breakdown[yi][key];
      const rows = year[key]
        .filter(hasInput)
        .map((c, i) => [i + 1, c.code || "-", c.unit || "-", c.grade || "-"]);

      doc.autoTable({
        startY: y,
        head: [[`${label} (GPA: ${formatGpa(stats.gpa)})`, "CODE", "UNIT", "GRADE"]],
        body: rows.length ? rows : [["-", "No courses entered", "", ""]],
        theme: "grid",
        headStyles: { fillColor: [26, 54, 93] },
        margin: { left: 20, right: 20 },
      });
      y = doc.lastAutoTable.finalY + 12;
    });
  });

  if (y > 245) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("SUMMARY REPORT", 20, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  doc.text(`Total Credit Units: ${result.totalUnits}`, 20, y + 8);
  doc.text(
    `Cumulative CGPA: ${result.cgpa === null ? "0.00" : result.cgpa.toFixed(2)}`,
    20,
    y + 15
  );
  doc.text(`Degree Classification: ${result.classification || "N/A"}`, 20, y + 22);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generated with UniCalc Scholar on ${new Date().toLocaleDateString()}. Unofficial; for personal reference only.`,
    20,
    y + 34
  );

  const safeName = name.replace(/[^\p{L}\p{N}]+/gu, "_");
  doc.save(`${safeName}_Transcript.pdf`);
}

/* ---------- wiring ---------- */

const actions = {
  "add-year": addYear,
  "add-rows": addRows,
  "remove-row": removeRow,
  "remove-year": removeYear,
  "plan-target": pickTarget,
  "export-pdf": exportPDF,
  "export-backup": exportBackup,
  "import-backup": () => els.importFile.click(),
  "open-clear": openModal,
  "close-clear": closeModal,
  "confirm-clear": confirmClear,
};

document.addEventListener("click", (event) => {
  if (event.target === els.modal) return closeModal();
  const btn = event.target.closest("[data-action]");
  if (btn) actions[btn.dataset.action]?.(btn, event);
});

document.addEventListener("input", onEdit);
document.addEventListener("change", onEdit);
els.importFile.addEventListener("change", importBackup);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

// Don't lose a pending save if the tab is closed or hidden.
window.addEventListener("pagehide", () => saveTimer && flushSave());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && saveTimer) flushSave();
});

renderAll();
setSaveNote(true);