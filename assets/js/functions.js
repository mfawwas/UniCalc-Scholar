// Grade points mapping
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
let yearCounter = 0;

window.onload = () => {
  loadRecordsFromBackend();
};

async function loadRecordsFromBackend() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      addNewYear();
      return;
    }

    const response = await fetch("/api/records/load", {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error("Failed to load records");
      addNewYear();
      return;
    }

    const result = await response.json();
    const data = result.data;

    if (!data.years || data.years.length === 0) {
      addNewYear();
      return;
    }

    loadRecordsToUI(data);
    yearCounter = data.years.length;
  } catch (error) {
    console.error("Error loading records:", error);
    addNewYear();
  }
}

function addNewYear() {
  yearCounter++;
  const container = document.getElementById("years-container");
  const yearId = `year-${yearCounter}`;

  const yearHtml = `
        <div class="year-group" id="${yearId}" style="margin-top: 40px; border-top: 2px solid var(--border); padding-top: 20px;">
            <h2 style="margin-bottom: 20px; color: var(--primary);">ACADEMIC YEAR ${yearCounter}</h2>
            
            <div class="card">
                <div class="card-title">
                    <span>SEMESTER ONE</span>
                    <div class="bulk-add">
                        <select id="${yearId}-s1-count">
                            <option value="1">1</option>
                            <option value="3">3</option>
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                        </select>
                        <button class="btn-add" onclick="bulkAddRows('${yearId}-s1')">+ Add Course</button>
                    </div>
                </div>
                <table>
                    <thead><tr><th style="width:50px">SN</th><th>COURSE CODE</th><th style="width:100px">UNIT</th><th style="width:100px">GRADE</th><th style="width:50px"></th></tr></thead>
                    <tbody id="${yearId}-s1"></tbody>
                </table>
            </div>

            <div class="card">
                <div class="card-title">
                    <span>SEMESTER TWO</span>
                    <div class="bulk-add">
                        <select id="${yearId}-s2-count">
                            <option value="1">1</option>
                            <option value="3">3</option>
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                        </select>
                        <button class="btn-add" onclick="bulkAddRows('${yearId}-s2')">+ Add Course</button>
                    </div>
                </div>
                <table>
                    <thead><tr><th style="width:50px">SN</th><th>COURSE CODE</th><th style="width:100px">UNIT</th><th style="width:100px">GRADE</th><th style="width:50px"></th></tr></thead>
                    <tbody id="${yearId}-s2"></tbody>
                </table>
            </div>
        </div>
    `;

  container.insertAdjacentHTML("beforeend", yearHtml);

  // Default: Start with 2 rows for each new semester
  for (let i = 0; i < 2; i++) {
    addRow(`${yearId}-s1`);
    addRow(`${yearId}-s2`);
  }
  return yearId;
}

// New function for Bulk Adding
function bulkAddRows(tbodyId) {
  const count = document.getElementById(`${tbodyId}-count`).value;
  for (let i = 0; i < count; i++) {
    addRow(tbodyId);
  }
}

function addRow(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const row = document.createElement("tr");
  row.innerHTML = `
        <td></td>
        <td><input type="text" class="c-code" placeholder="e.g. MTH101" oninput="calculate()"></td>
        <td>
            <select class="c-unit" onchange="calculate()">
                <option value="0">-</option>
                <option value="1">1</option><option value="2">2</option>
                <option value="3">3</option><option value="4">4</option>
                <option value="5">5</option><option value="6">6</option>
            </select>
        </td>
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
  return row;
}

function removeRow(btn) {
  const tbody = btn.closest("tbody");
  btn.closest("tr").remove();
  updateRowNumbers(tbody);
  calculate();
}

function updateRowNumbers(tbody) {
  Array.from(tbody.rows).forEach((row, i) => (row.cells[0].innerText = i + 1));
}

// Local Storage
function saveToLocalStorage() {
  const data = {
    studentName: document.getElementById("studentName")?.value || "",
    matricNo: document.getElementById("matricNo")?.value || "",
    years: [],
  };

  for (let i = 1; i <= yearCounter; i++) {
    data.years.push({
      yearNumber: i,
      sem1: getSemesterData(`year-${i}-s1`),
      sem2: getSemesterData(`year-${i}-s2`),
    });
  }

  saveRecordsToBackend(data);
}

async function saveRecordsToBackend(data) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token, data not saved to backend");
      return;
    }

    const response = await fetch("/api/records/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save records");
    }

    console.log("Records saved successfully");
  } catch (error) {
    console.error("Error saving records:", error);
  }
}

function getSemesterData(tbodyId) {
  return Array.from(document.querySelectorAll(`#${tbodyId} tr`))
    .map((row) => ({
      code: row.querySelector(".c-code").value,
      unit: row.querySelector(".c-unit").value,
      grade: row.querySelector(".c-grade").value,
    }))
    .filter((r) => r.code !== "" || r.unit !== "0" || r.grade !== "");
}

function loadFromLocalStorage(savedJSON) {
  const data = JSON.parse(savedJSON);
  if (document.getElementById("studentName"))
    document.getElementById("studentName").value = data.studentName;
  if (document.getElementById("matricNo"))
    document.getElementById("matricNo").value = data.matricNo;

  data.years.forEach((year, index) => {
    const yearId = addNewYear();
    document.getElementById(`${yearId}-s1`).innerHTML = "";
    document.getElementById(`${yearId}-s2`).innerHTML = "";

    (year.sem1 || []).forEach((course) => {
      addRowWithData(`${yearId}-s1`, course);
    });

    (year.sem2 || []).forEach((course) => {
      addRowWithData(`${yearId}-s2`, course);
    });
  });

  calculate();
}

function loadRecordsToUI(data) {
  if (document.getElementById("studentName"))
    document.getElementById("studentName").value = data.studentName || "";
  if (document.getElementById("matricNo"))
    document.getElementById("matricNo").value = data.matricNo || "";

  data.years.forEach((year) => {
    const yearId = addNewYear();
    document.getElementById(`${yearId}-s1`).innerHTML = "";
    document.getElementById(`${yearId}-s2`).innerHTML = "";

    (year.sem1 || []).forEach((course) => {
      addRowWithData(`${yearId}-s1`, course);
    });

    (year.sem2 || []).forEach((course) => {
      addRowWithData(`${yearId}-s2`, course);
    });
  });

  calculate();
}

function addRowWithData(tbodyId, courseData) {
  const tbody = document.getElementById(tbodyId);
  const row = document.createElement("tr");
  row.innerHTML = `
    <td></td>
    <td><input type="text" class="c-code" value="${courseData.code || ""}" placeholder="e.g. MTH101" oninput="calculate()"></td>
    <td>
      <select class="c-unit" onchange="calculate()">
        <option value="0">-</option>
        <option value="1" ${courseData.unit == 1 ? "selected" : ""}>1</option>
        <option value="2" ${courseData.unit == 2 ? "selected" : ""}>2</option>
        <option value="3" ${courseData.unit == 3 ? "selected" : ""}>3</option>
        <option value="4" ${courseData.unit == 4 ? "selected" : ""}>4</option>
        <option value="5" ${courseData.unit == 5 ? "selected" : ""}>5</option>
        <option value="6" ${courseData.unit == 6 ? "selected" : ""}>6</option>
      </select>
    </td>
    <td>
      <select class="c-grade" onchange="calculate()">
        <option value="">-</option>
        <option value="A" ${courseData.grade == "A" ? "selected" : ""}>A</option>
        <option value="B" ${courseData.grade == "B" ? "selected" : ""}>B</option>
        <option value="C" ${courseData.grade == "C" ? "selected" : ""}>C</option>
        <option value="D" ${courseData.grade == "D" ? "selected" : ""}>D</option>
        <option value="E" ${courseData.grade == "E" ? "selected" : ""}>E</option>
        <option value="F" ${courseData.grade == "F" ? "selected" : ""}>F</option>
      </select>
    </td>
    <td><button class="btn btn-remove" onclick="removeRow(this)">×</button></td>
  `;
  tbody.appendChild(row);
  updateRowNumbers(tbody);
}    fillSemesterTable(`${yearId}-s1`, year.s1);
    fillSemesterTable(`${yearId}-s2`, year.s2);
  });
  calculate();
}

function fillSemesterTable(tbodyId, rowsData) {
  if (rowsData.length === 0) {
    for (let i = 0; i < 5; i++) addRow(tbodyId);
    return;
  }
  rowsData.forEach((item) => {
    const row = addRow(tbodyId);
    row.querySelector(".c-code").value = item.code;
    row.querySelector(".c-unit").value = item.unit;
    row.querySelector(".c-grade").value = item.grade;
  });
}

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

function calculate() {
  let grandTotalUnits = 0;
  let grandTotalPoints = 0;
  const breakdownContainer = document.getElementById("gpa-breakdown");
  if (breakdownContainer) breakdownContainer.innerHTML = "";

  for (let i = 1; i <= yearCounter; i++) {
    const s1 = getSemesterStats(`year-${i}-s1`);
    const s2 = getSemesterStats(`year-${i}-s2`);
    grandTotalUnits += s1.u + s2.u;
    grandTotalPoints += s1.p + s2.p;

    if (breakdownContainer) {
      const row = document.createElement("div");
      row.className = "gpa-row";
      row.innerHTML = `<span><b>YEAR ${i}</b></span><span>S1 GPA: <b>${s1.gpa}</b></span><span>S2 GPA: <b>${s2.gpa}</b></span>`;
      breakdownContainer.appendChild(row);
    }
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

  saveToLocalStorage();
}

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

// Modal For Clear Confirmation
function clearAllData() {
  document.getElementById("clearModal").style.display = "flex";
}

function closeClearModal() {
  document.getElementById("clearModal").style.display = "none";
}

function confirmClearAll() {
  clearRecordsFromBackend();

  document.getElementById("studentName").value = "";
  document.getElementById("matricNo").value = "";
  yearCounter = 0;
  document.getElementById("years-container").innerHTML = "";

  addNewYear();
  calculate();

  closeClearModal();
  alert("All records cleared successfully.");
}

async function clearRecordsFromBackend() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    await fetch("/api/records/clear", {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error clearing records:", error);
  }
}
