// Function
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("theme-icon");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    if (icon) icon.setAttribute("name", "sunny-outline");
    localStorage.setItem("theme", "dark");
  } else {
    if (icon) icon.setAttribute("name", "moon-outline");
    localStorage.setItem("theme", "light");
  }
}

window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  const icon = document.getElementById("theme-icon");
  if (savedTheme === "light") {
    document.body.classList.remove("dark-mode");
    if (icon) icon.setAttribute("name", "moon-outline");
  } else if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (icon) icon.setAttribute("name", "sunny-outline");
  }
};

// Loading Screen Logic
function startLoading(callback) {
  const loader = document.getElementById("loader-wrapper");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("loader-text");
  let width = 0;

  const messages = [
    "Initializing...",
    "Linking to engine...",
    "Loading User Interface...",
    "Ready.",
  ];

  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        if (callback) callback();
      }, 500);
    } else {
      width += Math.floor(Math.random() * 30) + 10;
      if (width > 100) width = 100;
      bar.style.width = width + "%";

      if (width < 40) text.innerText = messages[0];
      else if (width < 80) text.innerText = messages[1];
      else text.innerText = messages[2];
    }
  }, 350);
}

window.addEventListener("load", () => {
  startLoading();
});

function launchAppTransition(event) {
  event.preventDefault();
  const loader = document.getElementById("loader-wrapper");

  loader.style.opacity = "1";
  loader.style.visibility = "visible";

  document.getElementById("progress-bar").style.width = "0%";
  startLoading(() => {
    window.location.href = "app.html";
  });
}