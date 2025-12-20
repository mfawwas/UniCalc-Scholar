// Grade points mapping
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
let yearCounter = 0;

// Initialize with one academic year
window.onload = () => addNewYear();

function addNewYear() {
  yearCounter++;
  const container = document.getElementById("years-container");
  const yearId = `year-${yearCounter}`;

  const yearHtml = `
        <div class="year-group" id="${yearId}" style="margin-top: 40px; border-top: 2px solid var(--border); padding-top: 20px;">
            <h2 style="margin-bottom: 20px; color: var(--primary);">ACADEMIC YEAR ${yearCounter}</h2>
            
            <div class="card">
                <div class="card-title">SEMESTER ONE <button class="btn btn-add" onclick="addRow('${yearId}-s1')">+ Add Course</button></div>
                <table>
                    <thead><tr><th style="width:50px">SN</th><th>COURSE CODE</th><th style="width:100px">UNIT</th><th style="width:100px">GRADE</th><th style="width:50px"></th></tr></thead>
                    <tbody id="${yearId}-s1"></tbody>
                </table>
            </div>

            <div class="card">
                <div class="card-title">SEMESTER TWO <button class="btn btn-add" onclick="addRow('${yearId}-s2')">+ Add Course</button></div>
                <table>
                    <thead><tr><th style="width:50px">SN</th><th>COURSE CODE</th><th style="width:100px">UNIT</th><th style="width:100px">GRADE</th><th style="width:50px"></th></tr></thead>
                    <tbody id="${yearId}-s2"></tbody>
                </table>
            </div>
        </div>
    `;

  container.insertAdjacentHTML("beforeend", yearHtml);

  // Add 3 initial rows for each semester
  for (let i = 0; i < 3; i++) {
    addRow(`${yearId}-s1`);
    addRow(`${yearId}-s2`);
  }
}

// Function to add a new course row
function addRow(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const row = document.createElement("tr");
  row.innerHTML = `
        <td></td>
        <td><input type="text" class="c-code" placeholder="e.g. MTH101" oninput="calculate()"></td>
        <td><input type="number" class="c-unit" min="1" max="6" oninput="calculate()"></td>
        <td>
            <select class="c-grade" onchange="calculate()">
                <option value="">-</option>
                <option value="A">A</option><option value="B">B</option>
                <option value="C">C</option><option value="D">D</option>
                <option value="E">E</option><option value="F">F</option>
            </select>
        </td>
        <td><button class="btn btn-remove" onclick="removeRow(this)">×</button></td>
    `;
  tbody.appendChild(row);
  updateRowNumbers(tbody);
}

// Function to remove a course row
function removeRow(btn) {
  const tbody = btn.closest("tbody");
  btn.closest("tr").remove();
  updateRowNumbers(tbody);
  calculate();
}

// Function to update row numbers
function updateRowNumbers(tbody) {
  Array.from(tbody.rows).forEach((row, i) => (row.cells[0].innerText = i + 1));
}

// Function to calculate GPA and CGPA
function getSemesterStats(tbodyId) {
  let u = 0,
    p = 0;
  document.querySelectorAll(`#${tbodyId} tr`).forEach((row) => {
    const unit = parseFloat(row.querySelector(".c-unit").value) || 0;
    const grade = row.querySelector(".c-grade").value;
    if (grade && unit > 0) {
      u += unit;
      p += unit * GRADE_POINTS[grade];
    }
  });
  return { u, p, gpa: u > 0 ? (p / u).toFixed(2) : "0.00" };
}

// Main calculation function
function calculate() {
  let grandTotalUnits = 0;
  let grandTotalPoints = 0;
  const breakdownContainer = document.getElementById("gpa-breakdown");
  breakdownContainer.innerHTML = "";

  for (let i = 1; i <= yearCounter; i++) {
    const s1 = getSemesterStats(`year-${i}-s1`);
    const s2 = getSemesterStats(`year-${i}-s2`);

    grandTotalUnits += s1.u + s2.u;
    grandTotalPoints += s1.p + s2.p;

    const row = document.createElement("div");
    row.className = "gpa-row";
    row.innerHTML = `
            <span><b>YEAR ${i}</b></span>
            <span>Sem 1 GPA: <b>${s1.gpa}</b></span>
            <span>Sem 2 GPA: <b>${s2.gpa}</b></span>
        `;
    breakdownContainer.appendChild(row);
  }

  const cgpa =
    grandTotalUnits > 0
      ? (grandTotalPoints / grandTotalUnits).toFixed(2)
      : "0.00";
  document.getElementById("totalUnits").innerText = grandTotalUnits;
  document.getElementById("cgpa").innerText = cgpa;
  document.getElementById("class").innerText = getClassification(
    parseFloat(cgpa)
  );
}

// Function to determine degree classification
function getClassification(cgpa) {
  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.4) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  if (cgpa >= 1.0) return "Pass";
  return "Fail";
}

// Function to export transcript as PDF
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const name =
    document.getElementById("studentName").value || "NAME NOT PROVIDED";
  const matric =
    document.getElementById("matricNo").value || "MATRIC NOT PROVIDED";

  // PDF Header
  doc.setFontSize(18);
  doc.text(name.toUpperCase(), 105, 20, { align: "center" });
  doc.setFontSize(11);
  doc.text(` MATRIC: ${matric}`, 105, 28, {
    align: "center",
  });
  doc.line(20, 32, 190, 32);

  let currentY = 42;

  for (let i = 1; i <= yearCounter; i++) {
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`ACADEMIC YEAR ${i}`, 20, currentY);
    currentY += 5;
    
    ["s1", "s2"].forEach((sem) => {
      const stats = getSemesterStats(`year-${i}-${sem}`);
      const rows = Array.from(document.querySelectorAll(`#year-${i}-${sem} tr`))
        .map((row) => [
          row.cells[0].innerText,
          row.querySelector(".c-code").value,
          row.querySelector(".c-unit").value,
          row.querySelector(".c-grade").value,
        ])
        .filter((r) => r[1] !== "");

      doc.autoTable({
        startY: currentY,
        head: [
          [
            `${sem === "s1" ? "SEM 1" : "SEM 2"} (GPA: ${stats.gpa})`,
            "CODE",
            "UNIT",
            "GRADE",
          ],
        ],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [26, 54, 93] },
        margin: { left: 20, right: 20 },
      });
      currentY = doc.lastAutoTable.finalY + 12;

      // Check for page overflow
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
    });
  }

  // Summary Section
  doc.setFontSize(14);
  doc.text(`SUMMARY REPORT`, 20, currentY);
  doc.setFontSize(11);
  doc.text(
    `Total Credit Units Earned: ${
      document.getElementById("totalUnits").innerText
    }`,
    20,
    currentY + 8
  );
  doc.text(
    `Final Cumulative CGPA: ${document.getElementById("cgpa").innerText}`,
    20,
    currentY + 15
  );
  doc.text(
    `Final Degree Classification: ${
      document.getElementById("class").innerText
    }`,
    20,
    currentY + 22
  );

  doc.save(`${name.replace(/\s+/g, "_")}_Transcript.pdf`);
}
