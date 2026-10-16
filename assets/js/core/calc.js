/**
 * UniCalc core grading engine.
 * Pure functions only: no DOM, no storage, no network.
 * Everything the calculator, dashboard and records pages need to agree on
 * (grade points, classification, GPA/CGPA maths) lives here.
 */

export const DEFAULT_SCALE = 5;
export const MAX_UNIT = 6;

// Classification thresholds are checked top-down against the CGPA rounded to
// 2 decimal places (the same number the user sees on screen).
export const SCALES = {
  5: {
    label: "5.0 scale",
    max: 5,
    points: { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 },
    remarks: { A: "Excellent", B: "Very Good", C: "Good", D: "Fair", E: "Pass", F: "Fail" },
    classes: [
      { min: 4.5, name: "First Class" },
      { min: 3.5, name: "Second Class Upper" },
      { min: 2.4, name: "Second Class Lower" },
      { min: 1.5, name: "Third Class" },
      { min: 1.0, name: "Pass" },
    ],
  },
  4: {
    label: "4.0 scale",
    max: 4,
    points: { A: 4, B: 3, C: 2, D: 1, F: 0 },
    remarks: { A: "Excellent", B: "Very Good", C: "Good", D: "Pass", F: "Fail" },
    classes: [
      { min: 3.5, name: "First Class" },
      { min: 3.0, name: "Second Class Upper" },
      { min: 2.5, name: "Second Class Lower" },
      { min: 2.0, name: "Third Class" },
      { min: 1.0, name: "Pass" },
    ],
  },
};

export function normalizeScale(value) {
  const n = Number(value);
  return SCALES[n] ? n : DEFAULT_SCALE;
}

/** Letter grades available on a scale, best first, e.g. ["A","B","C","D","E","F"]. */
export function gradesFor(scale) {
  return Object.keys(SCALES[normalizeScale(scale)].points);
}

/** Grade point for a letter on the given scale, or null if the grade isn't valid there. */
export function gradePoint(grade, scale) {
  const points = SCALES[normalizeScale(scale)].points;
  return Object.prototype.hasOwnProperty.call(points, grade)
    ? points[grade]
    : null;
}

/** Plain-English remark for a grade ("Very Good"), or "" if invalid on this scale. */
export function gradeRemark(grade, scale) {
  const remarks = SCALES[normalizeScale(scale)].remarks;
  return Object.prototype.hasOwnProperty.call(remarks, grade) ? remarks[grade] : "";
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toUnit(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** True if a course row has anything entered in it at all. */
export function hasInput(course) {
  return Boolean(
    course &&
      (String(course.code ?? "").trim() ||
        toUnit(course.unit) > 0 ||
        course.grade)
  );
}

/**
 * Stats for one semester.
 * `units` = credit units attempted (graded courses, failures included).
 * `earned` = units actually passed (grade point > 0); `passed` = courses passed.
 * A course only counts when it has a unit > 0 AND a grade valid on this scale.
 * Rows with some input but not both are reported as `incomplete`.
 * `gpa` is null (not 0) when nothing is countable yet.
 */
export function semesterStats(courses = [], scale = DEFAULT_SCALE) {
  let units = 0;
  let points = 0;
  let counted = 0;
  let incomplete = 0;
  let earned = 0;
  let passed = 0;

  for (const course of courses) {
    const unit = toUnit(course?.unit);
    const gp = gradePoint(course?.grade, scale);
    if (unit > 0 && gp !== null) {
      units += unit;
      points += unit * gp;
      counted++;
      if (gp > 0) {
        earned += unit;
        passed++;
      }
    } else if (hasInput(course)) {
      incomplete++;
    }
  }

  return {
    units,
    points,
    counted,
    incomplete,
    earned,
    passed,
    gpa: units > 0 ? round2(points / units) : null,
  };
}

/** Class name for a CGPA, or null when there is no CGPA yet. */
export function classify(cgpa, scale = DEFAULT_SCALE) {
  if (cgpa === null || cgpa === undefined || !Number.isFinite(cgpa)) {
    return null;
  }
  for (const tier of SCALES[normalizeScale(scale)].classes) {
    if (cgpa >= tier.min) return tier.name;
  }
  return "Fail";
}

/**
 * Cumulative result across all years.
 * CGPA = total quality points / total units (NOT an average of semester GPAs).
 * years: [{ sem1: [{code, unit, grade}], sem2: [...] }, ...]
 */
export function cumulative(years = [], scale = DEFAULT_SCALE) {
  let totalUnits = 0;
  let totalPoints = 0;
  let totalEarned = 0;
  let totalCourses = 0;
  let totalPassed = 0;
  let incomplete = 0;

  const breakdown = years.map((year, i) => {
    const sem1 = semesterStats(year?.sem1, scale);
    const sem2 = semesterStats(year?.sem2, scale);
    totalUnits += sem1.units + sem2.units;
    totalPoints += sem1.points + sem2.points;
    totalEarned += sem1.earned + sem2.earned;
    totalCourses += sem1.counted + sem2.counted;
    totalPassed += sem1.passed + sem2.passed;
    incomplete += sem1.incomplete + sem2.incomplete;
    return { year: i + 1, sem1, sem2 };
  });

  const cgpa = totalUnits > 0 ? round2(totalPoints / totalUnits) : null;

  return {
    breakdown,
    totalUnits,
    totalPoints,
    totalEarned,
    totalCourses,
    totalPassed,
    incomplete,
    cgpa,
    classification: classify(cgpa, scale),
  };
}

/**
 * One entry per semester that has results, in order, with the running CGPA after it.
 * [{ year, sem, label: "Y2 S1", units, earned, gpa, cgpa }]
 */
export function semesterSeries(years = [], scale = DEFAULT_SCALE) {
  let units = 0;
  let points = 0;
  const series = [];

  years.forEach((year, yi) => {
    ["sem1", "sem2"].forEach((key, si) => {
      const stats = semesterStats(year?.[key], scale);
      if (stats.units === 0) return;
      units += stats.units;
      points += stats.points;
      series.push({
        year: yi + 1,
        sem: si + 1,
        label: `Y${yi + 1} S${si + 1}`,
        units: stats.units,
        earned: stats.earned,
        gpa: stats.gpa,
        cgpa: round2(points / units),
      });
    });
  });

  return series;
}

/** 1-based number of the latest academic year that has results, or null. */
export function latestYearWithResults(breakdown = []) {
  for (let i = breakdown.length - 1; i >= 0; i--) {
    if (breakdown[i].sem1.units + breakdown[i].sem2.units > 0) return breakdown[i].year;
  }
  return null;
}

/** "4.25", or an em dash when there is no value yet. */
export function formatGpa(value) {
  return value === null || value === undefined
    ? "—"
    : Number(value).toFixed(2);
}

/* ---------- Target CGPA planner ---------- */

/**
 * Turn an average grade point into a unit-weighted mix of two neighbouring grades.
 * e.g. 4.3 on the 5.0 scale -> 30% A and 70% B. Best grade first.
 */
export function gradeMix(avg, scale = DEFAULT_SCALE) {
  const points = SCALES[normalizeScale(scale)].points;
  const byPoints = new Map(Object.entries(points).map(([g, p]) => [p, g]));

  const lo = Math.floor(avg + 1e-9);
  const share = avg - lo;

  if (share < 0.005 || !byPoints.has(lo + 1)) {
    const grade = byPoints.get(Math.min(Math.round(avg), SCALES[normalizeScale(scale)].max));
    return [{ grade, percent: 100 }];
  }

  const hiPercent = Math.round(share * 100);
  return [
    { grade: byPoints.get(lo + 1), percent: hiPercent },
    { grade: byPoints.get(lo), percent: 100 - hiPercent },
  ].filter((m) => m.percent > 0);
}

/**
 * "What do I need from here to finish on `target`?"
 *   current:   { units, points } so far (from cumulative())
 *   target:    desired final CGPA
 *   remaining: credit units still to be taken
 *
 * status:
 *   "invalid"    - target or remaining isn't usable (see `reason`)
 *   "safe"       - target is secured even if every remaining unit is an F
 *   "possible"   - needs an average of `needed` over the remaining units
 *   "impossible" - not reachable even with straight top grades
 * The needed average is rounded UP to 2 d.p. so following it never falls short.
 */
export function planTarget(current, target, remaining, scale = DEFAULT_SCALE) {
  const max = SCALES[normalizeScale(scale)].max;
  const t = Number(target);
  const r = Math.round(Number(remaining));

  if (!(t > 0 && t <= max)) return { status: "invalid", reason: "target", max };
  if (!(r >= 1)) return { status: "invalid", reason: "remaining", max };

  const U = current.units;
  const P = current.points;
  const needed = (t * (U + r) - P) / r;

  if (needed <= 0) {
    return { status: "safe", remaining: r, max, worstCgpa: round2(P / (U + r)) };
  }

  if (needed > max + 1e-9) {
    const minUnits =
      t < max && U > 0 ? Math.ceil((t * U - P) / (max - t) - 1e-9) : null;
    return {
      status: "impossible",
      remaining: r,
      max,
      maxCgpa: round2((P + r * max) / (U + r)),
      minUnits,
    };
  }

  const rounded = Math.min(max, Math.ceil(needed * 100 - 1e-9) / 100);
  return {
    status: "possible",
    remaining: r,
    max,
    needed: rounded,
    mix: gradeMix(rounded, scale),
    level: difficulty(rounded, U > 0 ? P / U : null, max),
  };
}

/**
 * How hard is the needed average? Judged against where the student is now
 * (how far above their current CGPA they must go), and against the scale
 * ceiling when there are no results yet. Always "demanding" near the top.
 */
function difficulty(needed, currentCgpa, max) {
  if (needed / max >= 0.92) return "demanding";
  if (currentCgpa === null) return needed / max >= 0.75 ? "challenging" : "achievable";
  const gap = (needed - currentCgpa) / max; // 0.02 = 0.10 points on the 5.0 scale
  if (gap <= 0.02) return "achievable";
  return gap <= 0.08 ? "challenging" : "demanding";
}