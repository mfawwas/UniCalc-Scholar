const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

window.onload = () => {
    for (let i = 0; i < 3; i++) {
        addRow("sem1-body");
        addRow("sem2-body");
    }
};

function addRow(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    const rowCount = tbody.rows.length + 1;
    const row = document.createElement("tr");

    row.innerHTML = `
            <td class="col-sn">${rowCount}</td>
            <td><input type="text" class="course-code" placeholder="e.g. MTH101" oninput="calculate()"></td>
            <td><input type="number" class="course-unit" min="1" max="6" placeholder="0" oninput="calculate()"></td>
            <td>
                <select class="course-grade" onchange="calculate()">
                    <option value="">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                </select>
            </td>
            <td><button class="btn btn-remove" onclick="removeRow(this)">×</button></td>
        `;
    tbody.appendChild(row);
    updateSN(tbodyId);
}

function removeRow(btn) {
    const tbody = btn.closest("tbody");
    btn.closest("tr").remove();
    updateSN(tbody.id);
    calculate();
}

function updateSN(tbodyId) {
    const rows = document.querySelectorAll(`#${tbodyId} tr`);
    rows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
    });
}

function calculate() {
    const data1 = getSemesterData("sem1-body");
    const data2 = getSemesterData("sem2-body");

    const gpa1 =
        data1.units > 0 ? (data1.points / data1.units).toFixed(2) : "0.00";
    const gpa2 =
        data2.units > 0 ? (data2.points / data2.units).toFixed(2) : "0.00";

    const totalUnits = data1.units + data2.units;
    const totalPoints = data1.points + data2.points;
    const cgpaVal =
        totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";

    document.getElementById("gpa1").innerText = gpa1;
    document.getElementById("gpa2").innerText = gpa2;
    document.getElementById("cgpa").innerText = cgpaVal;
    document.getElementById("class").innerText = getClassification(
        parseFloat(cgpaVal)
    );
}

function getSemesterData(tbodyId) {
    const rows = document.querySelectorAll(`#${tbodyId} tr`);
    let units = 0;
    let points = 0;

    rows.forEach((row) => {
        const u = parseFloat(row.querySelector(".course-unit").value) || 0;
        const g = row.querySelector(".course-grade").value;
        if (g && u > 0) {
            units += u;
            points += u * GRADE_POINTS[g];
        }
    });
    return { units, points };
}

function getClassification(cgpa) {
    if (cgpa >= 4.5) return "First Class";
    if (cgpa >= 3.5) return "Second Class Upper";
    if (cgpa >= 2.4) return "Second Class Lower";
    if (cgpa >= 1.5) return "Third Class";
    if (cgpa >= 1.0) return "Pass";
    return "Fail";
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = document.getElementById("studentName").value || "N/A";
    const matric = document.getElementById("matricNo").value || "N/A";
    const year = document.getElementById("academicYear").value;

    doc.setFontSize(14);
    doc.text(name.toUpperCase(), 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(`MATRIC NO: ${matric}`, 105, 27, { align: "center" });
    doc.line(20, 32, 190, 32);

    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text(`${year} - SEMESTER ONE`, 20, 42);

    const sem1Data = Array.from(document.querySelectorAll("#sem1-body tr"))
        .map((row) => [
            row.cells[0].innerText,
            row.querySelector(".course-code").value,
            row.querySelector(".course-unit").value,
            row.querySelector(".course-grade").value,
        ])
        .filter((r) => r[1] !== "");

    doc.autoTable({
        startY: 45,
        head: [["SN", "CODE", "UNIT", "GRADE"]],
        body: sem1Data,
        theme: "grid",
        headStyles: { fillColor: [40, 40, 40] },
        styles: { fontSize: 9 },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont(undefined, "bold");
    doc.text(`${year} - SEMESTER TWO`, 20, finalY);

    const sem2Data = Array.from(document.querySelectorAll("#sem2-body tr"))
        .map((row) => [
            row.cells[0].innerText,
            row.querySelector(".course-code").value,
            row.querySelector(".course-unit").value,
            row.querySelector(".course-grade").value,
        ])
        .filter((r) => r[1] !== "");

    doc.autoTable({
        startY: finalY + 3,
        head: [["SN", "CODE", "UNIT", "GRADE"]],
        body: sem2Data,
        theme: "grid",
        headStyles: { fillColor: [40, 40, 40] },
        styles: { fontSize: 9 },
    });

    finalY = doc.lastAutoTable.finalY + 20;
    doc.line(20, finalY, 190, finalY);
    doc.setFont(undefined, "normal");
    doc.text(
        `Semester One GPA: ${document.getElementById("gpa1").innerText}`,
        20,
        finalY + 10
    );
    doc.text(
        `Semester Two GPA: ${document.getElementById("gpa2").innerText}`,
        20,
        finalY + 17
    );

    doc.setFont(undefined, "bold");
    doc.text(
        `OVERALL CGPA: ${document.getElementById("cgpa").innerText}`,
        130,
        finalY + 10
    );
    doc.text(
        `CLASSIFICATION: ${document.getElementById("class").innerText}`,
        130,
        finalY + 17
    );

    doc.save(`${name.replace(/\s+/g, "_")}_Transcript.pdf`);
}