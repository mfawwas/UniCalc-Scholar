const initRing = (id, percent, color) => {
  const ctx = document.getElementById(id).getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [percent, 100 - percent],
          backgroundColor: [color, "rgba(0,0,0,0.1)"],
          borderWidth: 0,
          borderRadius: 5,
        },
      ],
    },
    options: {
      cutout: "80%",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
};

window.addEventListener("DOMContentLoaded", () => {
  const isDark = document.body.classList.contains("dark-mode");

  const colors = {
    orange: isDark ? "#ff8c42" : "#ffffff",
    blue: isDark ? "#48c6ef" : "#ffffff",
    green: isDark ? "#00b09b" : "#ffffff",
  };

  initRing("gradProgressChart", 75, colors.orange);
  initRing("coreProgressChart", 90, colors.blue);
  initRing("electiveProgressChart", 40, colors.green);
});

const academicHistory = {
  "300L": {
    sem1: [
      { code: "MCB 301", unit: 3, grade: "A" },
      { code: "MCB 303", unit: 3, grade: "B" },
    ],
    sem2: [{ code: "MCB 302", unit: 3, grade: "A" }],
  },
  "200L": {
    sem1: [{ code: "MCB 201", unit: 3, grade: "A" }],
    sem2: [], // Test: No records found
  },
};

const getGradeStatus = (grade) => {
  const statuses = {
    A: "Excellent",
    B: "Very Good",
    C: "Good",
    D: "Pass",
    E: "Fair",
    F: "Fail",
  };
  return statuses[grade] || "Unknown";
};

const renderSemesterTable = (tableId, data) => {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-record-row">No academic records found for this semester.</td></tr>`;
    return;
  }

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td data-label="S/N">${index + 1}</td>
            <td data-label="Code"><strong>${item.code}</strong></td>
            <td data-label="Unit">${item.unit}</td>
            <td data-label="Grade">${item.grade}</td>
            <td data-label="Status">${getGradeStatus(item.grade)}</td>
        `;
    tbody.appendChild(row);
  });
};

window.switchSession = (level) => {
  const data = academicHistory[level] || { sem1: [], sem2: [] };
  renderSemesterTable("table-sem1", data.sem1);
  renderSemesterTable("table-sem2", data.sem2);
};

document.addEventListener("DOMContentLoaded", () => {
  switchSession("300L");
  const chartCanvas = document.getElementById("unicalcHeroChart");
  if (chartCanvas) {
    initHeroChart(chartCanvas);
  }
});

function initHeroChart(canvas) {
  new Chart(canvas, {
    type: "line",
    data: {
      labels: ["100L", "200L", "300L"],
      datasets: [
        {
          label: "CGPA",
          data: [4.1, 4.35, 4.52],
          borderColor: "#4f46e5",
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(79, 70, 229, 0.1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { max: 5.0 } },
    },
  });
}
