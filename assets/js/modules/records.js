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
