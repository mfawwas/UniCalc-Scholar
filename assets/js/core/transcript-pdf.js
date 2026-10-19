/**
 * Renders a transcript model (see transcript.js) to PDF with jsPDF + jspdf-autotable.
 * Both libraries are loaded from a CDN by the page as globals (window.jspdf).
 */

import { formatGpa } from "./calc.js";

const NAVY = [26, 54, 93];

/** Build the PDF. `JsPDF` is the jsPDF constructor; returns null if autotable is missing. */
export function buildPdf(model, JsPDF) {
  const doc = new JsPDF();
  if (typeof doc.autoTable !== "function") return null;

  const name = model.name || "NAME NOT PROVIDED";
  const matric = model.matric || "MATRIC NOT PROVIDED";

  doc.setFont(undefined, "bold");
  doc.setFontSize(18);
  doc.text(name.toUpperCase(), 105, 20, { align: "center" });
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  doc.text(`MATRIC: ${matric}`, 105, 28, { align: "center" });
  doc.text(`Grading scale: ${model.scaleLabel}`, 105, 34, { align: "center" });
  doc.line(20, 38, 190, 38);

  let y = 48;

  for (const year of model.years) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`ACADEMIC YEAR ${year.number}`, 20, y);
    doc.setFont(undefined, "normal");
    y += 5;

    for (const sem of year.semesters) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.autoTable({
        startY: y,
        head: [[`${sem.label.replace("Semester", "SEM")} (GPA: ${formatGpa(sem.gpa)})`, "CODE", "UNIT", "GRADE"]],
        body: sem.rows.length
          ? sem.rows.map((r) => [r.sn, r.code, r.unit, r.grade])
          : [["-", "No courses entered", "", ""]],
        theme: "grid",
        headStyles: { fillColor: NAVY },
        margin: { left: 20, right: 20 },
      });
      y = doc.lastAutoTable.finalY + 12;
    }
  }

  const s = model.summary;
  if (y > 235) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("SUMMARY REPORT", 20, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  doc.text(`Total Credit Units: ${s.totalUnits}`, 20, y + 8);
  doc.text(`Credit Units Earned: ${s.earnedUnits}`, 20, y + 15);
  doc.text(`Cumulative CGPA: ${s.cgpa === null ? "0.00" : s.cgpa.toFixed(2)}`, 20, y + 22);
  doc.text(`Degree Classification: ${s.classification || "N/A"}`, 20, y + 29);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generated with UniCalc Scholar on ${new Date().toLocaleDateString()}. Unofficial; for personal reference only.`,
    20,
    y + 41
  );

  return doc;
}

export function transcriptFileName(model) {
  const base = (model.name || "UniCalc").replace(/[^\p{L}\p{N}]+/gu, "_");
  return `${base}_Transcript.pdf`;
}

/** Build and download. Returns false if the PDF libraries aren't available (e.g. offline). */
export function downloadTranscriptPdf(model) {
  const JsPDF = window.jspdf?.jsPDF;
  if (!JsPDF) return false;
  const doc = buildPdf(model, JsPDF);
  if (!doc) return false;
  doc.save(transcriptFileName(model));
  // Announce a successful download. The feedback nudge listens for this; the
  // PDF module intentionally knows nothing about it.
  window.dispatchEvent(new CustomEvent("unicalc:pdf-downloaded"));
  return true;
}
