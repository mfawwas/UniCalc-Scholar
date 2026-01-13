function toggleTheme(event) {
  if (event) event.stopPropagation();

  const body = document.body;
  const btn = document.getElementById("theme-toggle-btn");
  const icon = btn.querySelector("ion-icon");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    icon.setAttribute("name", "sunny-outline");
    localStorage.setItem("theme", "dark");
  } else {
    icon.setAttribute("name", "moon-outline");
    localStorage.setItem("theme", "light");
  }
}

window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  const icon = document.querySelector("#theme-toggle-btn ion-icon");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    icon.setAttribute("name", "sunny-outline");
  }
});

const profileTrigger = document.getElementById("profile-trigger");
const profileMenu = document.getElementById("profile-menu");

profileTrigger.addEventListener("click", () => {
  profileMenu.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!profileTrigger.contains(e.target)) {
    profileMenu.classList.remove("active");
  }
});

// Tab switching logic
function switchTab(event, tabId) {
  // 1. Remove active class from all buttons
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => tab.classList.remove("active"));

  // 2. Hide all tab content
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((content) => content.classList.remove("active"));

  // 3. Add active class to clicked button and target content
  event.currentTarget.classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

// Sidebar Mobile
const sidebar = document.querySelector(".sidebar");
const menuOpenBtn = document.getElementById("menu-open");
const overlay = document.getElementById("sidebar-overlay");
const navLinks = document.querySelectorAll(".nav-item");

// Function to Open/Close Menu
function toggleMobileMenu() {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
}

// Event Listeners
menuOpenBtn.addEventListener("click", toggleMobileMenu);

// Close menu if user clicks the overlay (dimmed area)
overlay.addEventListener("click", toggleMobileMenu);

// Close menu if a user clicks a navigation link (Essential for mobile)
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      toggleMobileMenu();
    }
  });
});

// Data configured for future backend integration
const cgpaHistory = {
  labels: ["100L S1", "100L S2", "200L S1", "200L S2", "300L S1"],
  values: [4.2, 3.85, 4.85, 4.5, 4.52],
};

function initDashboardChart() {
  const ctx = document.getElementById("unicalcHeroChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: cgpaHistory.labels,
      datasets: [
        {
          label: "CGPA",
          data: cgpaHistory.values,
          borderColor: "#0072ff",
          backgroundColor: "rgba(0, 114, 255, 0.1)",
          fill: true,
          tension: 0.4, // This creates the smooth wave from the image
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#0072ff",
          pointBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          min: 0,
          max: 5,
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}

// Call on load
window.addEventListener("DOMContentLoaded", initDashboardChart);

// Generic function to create progress rings
const createProgressRing = (canvasId, percent, color) => {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [percent, 100 - percent],
          backgroundColor: [color, "rgba(0,0,0,0.05)"],
          borderWidth: 0,
          borderRadius: 10,
        },
      ],
    },
    options: {
      cutout: "80%", // Makes the ring thin
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
};

// Initialize all charts
window.addEventListener("DOMContentLoaded", () => {
  // Existing Hero Chart
  initDashboardChart();

  // Progress Rings (Using colors from your gradient cards)
  createProgressRing("gradProgressChart", 75, "#ff8c42"); // Orange
  createProgressRing("coreProgressChart", 90, "#00c6ff"); // Blue
  createProgressRing("electiveProgressChart", 40, "#00b09b"); // Green
});

function updateChartTheme() {
  const isDark = document.body.classList.contains("dark-mode");
  const color = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  myChart.options.scales.x.ticks.color = color;
  myChart.options.scales.y.ticks.color = color;
  myChart.options.scales.y.grid.color = gridColor;
  myChart.update();
}

// Ensure this is triggered when your theme toggle button is clicked
document.getElementById("theme-toggle-btn").addEventListener("click", () => {
  // ... your existing toggle logic ...
  setTimeout(updateChartTheme, 100); // Small delay to catch class change
});
