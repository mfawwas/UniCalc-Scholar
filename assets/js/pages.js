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
