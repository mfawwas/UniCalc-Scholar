/**
 * Transcript model: one place that turns saved state into what a transcript shows.
 * Pure (no DOM, no PDF library), so the on-page preview, print view and PDF all agree.
 */

import { SCALES, cumulative, hasInput } from "./calc.js";

const SEMESTERS = [
  ["sem1", "Semester 1"],
  ["sem2", "Semester 2"],
];

/**
 * @returns {{
 *   name: string, matric: string, scaleLabel: string, hasData: boolean,
 *   years: Array<{ number: number, level: number, semesters: Array<{
 *     label: string, gpa: number|null,
 *     rows: Array<{ sn: number, code: string, unit: number|string, grade: string }>
 *   }> }>,
 *   summary: { totalUnits: number, earnedUnits: number, cgpa: number|null,
 *              classification: string|null, incomplete: number }
 * }}
 */
export function buildTranscript(state) {
  const result = cumulative(state.years, state.scale);

  // Years with nothing entered are left out; a half-empty year keeps both semesters.
  const years = [];
  state.years.forEach((year, index) => {
    const semesters = SEMESTERS.map(([key, label]) => ({
      label,
      gpa: result.breakdown[index][key].gpa,
      rows: year[key].filter(hasInput).map((course, i) => ({
        sn: i + 1,
        code: course.code.trim() || "—",
        unit: course.unit || "-",
        grade: course.grade || "-",
      })),
    }));

    if (semesters.some((s) => s.rows.length)) {
      years.push({ number: index + 1, level: (index + 1) * 100, semesters });
    }
  });

  return {
    name: state.studentName.trim(),
    matric: state.matricNo.trim(),
    scaleLabel: SCALES[state.scale].label,
    hasData: years.length > 0,
    years,
    summary: {
      totalUnits: result.totalUnits,
      earnedUnits: result.totalEarned,
      cgpa: result.cgpa,
      classification: result.classification,
      incomplete: result.incomplete,
    },
  };
}
