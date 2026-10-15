/**
 * UniCalc storage layer.
 * Everything is saved in the browser (localStorage). Nothing leaves the device.
 * All reads go through sanitizeState() so bad or hand-edited data can't break the app.
 *
 * Saved shape (schema v1):
 * {
 *   version: 1,
 *   scale: 5 | 4,
 *   studentName: "",
 *   matricNo: "",
 *   years: [{ sem1: [{ code, unit, grade }], sem2: [...] }],
 *   plan: { target: number | null, remaining: number | null },
 *   updatedAt: ISO string | null
 * }
 */

import { DEFAULT_SCALE, MAX_UNIT, normalizeScale } from "./calc.js";

export const STORAGE_KEY = "unicalc:v1";
export const SCHEMA_VERSION = 1;

export const LIMITS = {
  years: 10,
  rowsPerSemester: 30,
  code: 20,
  name: 80,
  matric: 30,
  planUnits: 400,
};

export function blankCourse() {
  return { code: "", unit: 0, grade: "" };
}

export function blankYear(rows = 2) {
  return {
    sem1: Array.from({ length: rows }, blankCourse),
    sem2: Array.from({ length: rows }, blankCourse),
  };
}

export function newState(scale = DEFAULT_SCALE) {
  return {
    version: SCHEMA_VERSION,
    scale: normalizeScale(scale),
    studentName: "",
    matricNo: "",
    years: [blankYear()],
    plan: { target: null, remaining: null },
    updatedAt: null,
  };
}

const text = (value, max) => String(value ?? "").slice(0, max);

function cleanCourse(course) {
  const unit = Math.round(Number(course?.unit));
  const grade = String(course?.grade ?? "").toUpperCase();
  return {
    code: text(course?.code, LIMITS.code),
    unit: unit >= 1 && unit <= MAX_UNIT ? unit : 0,
    grade: /^[A-F]$/.test(grade) ? grade : "",
  };
}

function cleanSemester(list) {
  return (Array.isArray(list) ? list : [])
    .slice(0, LIMITS.rowsPerSemester)
    .map(cleanCourse);
}

function cleanPlan(plan) {
  const target = Number(plan?.target);
  const remaining = Math.round(Number(plan?.remaining));
  return {
    target: plan?.target != null && target > 0 && target <= 5 ? Math.round(target * 100) / 100 : null,
    remaining:
      plan?.remaining != null && remaining >= 1 && remaining <= LIMITS.planUnits ? remaining : null,
  };
}

/** Returns a clean state object, or null if `raw` isn't recognisable. */
export function sanitizeState(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.years)) {
    return null;
  }

  const years = raw.years.slice(0, LIMITS.years).map((year) => ({
    sem1: cleanSemester(year?.sem1),
    sem2: cleanSemester(year?.sem2),
  }));

  return {
    version: SCHEMA_VERSION,
    scale: normalizeScale(raw.scale),
    studentName: text(raw.studentName, LIMITS.name),
    matricNo: text(raw.matricNo, LIMITS.matric),
    years: years.length ? years : [blankYear()],
    plan: cleanPlan(raw.plan),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

/** Saved state, or null if nothing is saved / storage is unavailable / data is corrupt. */
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Returns true if saved, false if the browser refused (private mode, quota, blocked). */
export function save(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        version: SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/* ---------- Backup (export / import) ---------- */

export function toBackupJSON(state) {
  return JSON.stringify(
    {
      app: "unicalc-scholar",
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: state,
    },
    null,
    2
  );
}

/** Parses backup text into a clean state. Throws Error with a user-friendly message. */
export function parseBackup(fileText) {
  let parsed;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  const candidate =
    parsed && parsed.app === "unicalc-scholar" ? parsed.data : parsed;
  const state = sanitizeState(candidate);
  if (!state) throw new Error("That file doesn't look like a UniCalc backup.");
  return state;
}

export function downloadBackup(state) {
  const blob = new Blob([toBackupJSON(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `unicalc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}