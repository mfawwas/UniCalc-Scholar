/**
 * Shared app shell for every page in /pages. Replaces the old pages.js.
 * Each page only needs an empty <aside class="sidebar" id="sidebar"></aside>;
 * navigation, profile, theme toggle and the mobile menu all come from here.
 * Loaded as an ES module: <script type="module" src="../assets/js/shell.js">
 */

import * as store from "./core/storage.js";
import { esc } from "./core/html.js";

const NAV = [
  { href: "dashboard.html", icon: "grid-outline", label: "Dashboard" },
  { href: "academic-records.html", icon: "folder-open-outline", label: "Academic Records" },
  { href: "cgpa-calculator.html", icon: "calculator-outline", label: "CGPA Calculator" },
  { href: "transcripts.html", icon: "document-text-outline", label: "Transcripts" },
];

const sidebar = document.querySelector(".sidebar");

/* ---------- sidebar ---------- */

const currentPage = () =>
  (location.pathname.split("/").pop() || "").replace(/\.html$/, "");

function initials(name) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0] || "")
    .join("")
    .toUpperCase();
  return letters || "G";
}

function renderSidebar() {
  const saved = store.load();
  const name = saved?.studentName.trim() || "";
  const matric = saved?.matricNo.trim() || "";
  const page = currentPage();

  const links = NAV.map(({ href, icon, label }) => {
    const active = href.replace(/\.html$/, "") === page;
    return `
      <a href="${href}" class="nav-item${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>
        <ion-icon name="${icon}"></ion-icon>
        <span>${label}</span>
      </a>`;
  }).join("");

  sidebar.innerHTML = `
    <a class="brand" href="../index.html" aria-label="UniCalc home">
      <div class="logo-icon"><ion-icon name="school"></ion-icon></div>
      <div class="logo-text">UniCalc</div>
    </a>

    <nav class="nav-menu" aria-label="Main">
      <div class="nav-label">Menu</div>
      ${links}
    </nav>

    <div class="user-profile-container">
      <div class="user-mini-profile">
        <a class="profile-link" href="cgpa-calculator.html" title="Edit your name in the calculator">
          <div class="avatar">${esc(initials(name))}</div>
          <div class="user-info">
            <span class="name">${esc(name || "Guest")}</span>
            <span class="role">${esc(matric || (name ? "Student" : "Add your name"))}</span>
          </div>
        </a>
        <button type="button" class="btn-icon" id="theme-toggle-btn" aria-label="Toggle dark mode">
          <ion-icon name="moon-outline"></ion-icon>
        </button>
      </div>
    </div>`;
}

/* ---------- theme ---------- */

const root = document.documentElement;

function syncThemeIcon() {
  const icon = document.querySelector("#theme-toggle-btn ion-icon");
  if (icon) {
    icon.setAttribute("name", root.classList.contains("dark-mode") ? "sunny-outline" : "moon-outline");
  }
}

function toggleTheme() {
  const dark = root.classList.toggle("dark-mode");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* storage blocked: theme still changes for this visit */
  }
  syncThemeIcon();
}

/* ---------- mobile menu ---------- */

function initMobileMenu() {
  const openBtn = document.getElementById("menu-open");
  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  overlay.id = "sidebar-overlay";
  document.body.appendChild(overlay);

  sidebar.id = sidebar.id || "sidebar";
  openBtn?.setAttribute("aria-controls", sidebar.id);
  openBtn?.setAttribute("aria-expanded", "false");

  const setOpen = (open) => {
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("active", open);
    openBtn?.setAttribute("aria-expanded", String(open));
  };

  openBtn?.addEventListener("click", () => setOpen(!sidebar.classList.contains("open")));
  overlay.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest(".nav-item") && window.innerWidth <= 768) setOpen(false);
  });
}

/* ---------- init ---------- */

if (sidebar) {
  renderSidebar();
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("#theme-toggle-btn")) toggleTheme();
  });
  syncThemeIcon();
  initMobileMenu();
}
