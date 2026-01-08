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
