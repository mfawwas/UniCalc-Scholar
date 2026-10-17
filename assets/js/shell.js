/**
 * Shared app shell for every page in /pages.
 * Each page only needs an empty <aside class="sidebar" id="sidebar"></aside>;
 * navigation, the profile menu ("Your data"), theme toggle and mobile menu all come from here.
 * Loaded as an ES module: <script type="module" src="../assets/js/shell.js">
 *
 * When the menu changes saved data it fires "unicalc:data-changed" (cancelable).
 * A page that keeps data in memory (the calculator) listens, reloads from storage and calls
 * preventDefault(); any other page doesn't, so the shell simply reloads it.
 * Before reading saved data it fires "unicalc:flush" so such a page can save pending edits first.
 */

import * as store from "./core/storage.js";
import { esc } from "./core/html.js";
import { hasInput } from "./core/calc.js";
import { toast, openDialog } from "./core/ui.js";
import { registerServiceWorker } from "./core/pwa.js";

const NAV = [
  { href: "dashboard.html", icon: "grid-outline", label: "Dashboard" },
  { href: "academic-records.html", icon: "folder-open-outline", label: "Academic Records" },
  { href: "cgpa-calculator.html", icon: "calculator-outline", label: "CGPA Calculator" },
  { href: "transcripts.html", icon: "document-text-outline", label: "Transcripts" },
];

const FLASH_KEY = "unicalc:flash";
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
      <div class="profile-dropup" id="profile-menu" role="menu" aria-label="Your data">
        <div class="dropup-note">Your data stays on this device.</div>
        <button type="button" class="dropup-item" role="menuitem" data-menu="details">
          <ion-icon name="create-outline"></ion-icon><span>Edit name &amp; matric</span>
        </button>
        <button type="button" class="dropup-item" role="menuitem" data-menu="export">
          <ion-icon name="download-outline"></ion-icon><span>Download backup</span>
        </button>
        <button type="button" class="dropup-item" role="menuitem" data-menu="import">
          <ion-icon name="cloud-upload-outline"></ion-icon><span>Import backup</span>
        </button>
        <div class="dropup-divider"></div>
        <button type="button" class="dropup-item danger" role="menuitem" data-menu="clear">
          <ion-icon name="trash-outline"></ion-icon><span>Clear all data</span>
        </button>
      </div>

      <div class="user-mini-profile">
        <button type="button" class="profile-link" id="profile-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="profile-menu">
          <div class="avatar">${esc(initials(name))}</div>
          <div class="user-info">
            <span class="name">${esc(name || "Guest")}</span>
            <span class="role">${esc(matric || (name ? "Student" : "Add your name"))}</span>
          </div>
        </button>
        <button type="button" class="btn-icon" id="theme-toggle-btn" aria-label="Toggle dark mode">
          <ion-icon name="moon-outline"></ion-icon>
        </button>
      </div>
    </div>`;
}

/* ---------- profile menu ---------- */

function setMenu(open) {
  const menu = document.getElementById("profile-menu");
  const trigger = document.getElementById("profile-trigger");
  if (!menu || !trigger) return;
  menu.classList.toggle("active", open);
  trigger.setAttribute("aria-expanded", String(open));
}

const menuIsOpen = () => document.getElementById("profile-menu")?.classList.contains("active");

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

/* ---------- "Your data" actions ---------- */

const flush = () => window.dispatchEvent(new Event("unicalc:flush"));
const current = () => store.load() || store.newState();

function hasAnyData(state) {
  return Boolean(
    state.studentName.trim() ||
      state.matricNo.trim() ||
      state.years.some((year) => [...year.sem1, ...year.sem2].some(hasInput))
  );
}

/** Save, refresh the sidebar, and tell the page. Pages that don't handle it are reloaded. */
function persist(state, message) {
  if (!store.save(state)) {
    return toast("Couldn't save: browser storage is blocked or full.");
  }
  renderSidebar();
  syncThemeIcon();

  const handled = !window.dispatchEvent(new CustomEvent("unicalc:data-changed", { cancelable: true }));
  if (handled) return toast(message);

  try {
    sessionStorage.setItem(FLASH_KEY, message); // shown again after the reload
  } catch {
    /* no sessionStorage: the reload just won't show the message */
  }
  location.reload();
}

async function editDetails() {
  flush();
  const saved = current();
  const result = await openDialog({
    title: "Your details",
    message: "Shown in the sidebar and on your transcript. Stored only on this device.",
    fields: [
      { name: "studentName", label: "Full name", value: saved.studentName, maxLength: store.LIMITS.name, autocomplete: "name", placeholder: "e.g. John Okoro" },
      { name: "matricNo", label: "Matric number", value: saved.matricNo, maxLength: store.LIMITS.matric, placeholder: "e.g. U2023/123456" },
    ],
    confirmLabel: "Save",
  });
  if (!result) return;

  const fresh = current();
  fresh.studentName = result.studentName.trim();
  fresh.matricNo = result.matricNo.trim();
  persist(fresh, "Details saved.");
}

function exportBackup() {
  flush();
  const saved = current();
  if (!hasAnyData(saved)) return toast("Nothing to back up yet. Add some courses first.");
  store.downloadBackup(saved);
  toast("Backup downloaded.");
}

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsText(file);
  });

async function importBackup(file) {
  if (!file) return;
  if (file.size > 1_000_000) return toast("That file is too large to be a UniCalc backup.");

  let next;
  try {
    next = store.parseBackup(await readFile(file));
  } catch (err) {
    return toast(err.message);
  }

  flush();
  if (hasAnyData(current())) {
    const ok = await openDialog({
      title: "Replace your data?",
      message: "Importing replaces everything currently saved on this device, including your name.",
      confirmLabel: "Replace",
      danger: true,
    });
    if (!ok) return;
  }
  persist(next, "Backup imported.");
}

async function clearAll() {
  flush();
  const ok = await openDialog({
    title: "Clear all data?",
    message:
      "This deletes every course, grade and detail saved on this device. It can't be undone. Tip: download a backup first.",
    confirmLabel: "Yes, delete",
    cancelLabel: "Keep my data",
    danger: true,
  });
  if (!ok) return;
  persist(store.newState(current().scale), "All data cleared.");
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

  const menuActions = {
    details: editDetails,
    export: exportBackup,
    import: () => fileInput.click(),
    clear: clearAll,
  };

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json,.json";
  fileInput.hidden = true;
  fileInput.id = "shell-import";
  document.body.appendChild(fileInput);
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    importBackup(file);
  });

  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("#theme-toggle-btn")) return toggleTheme();
    if (e.target.closest("#profile-trigger")) return setMenu(!menuIsOpen());
    const item = e.target.closest("[data-menu]");
    if (item) {
      setMenu(false);
      menuActions[item.dataset.menu]?.();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-profile-container")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuIsOpen()) {
      setMenu(false);
      document.getElementById("profile-trigger")?.focus();
    }
  });

  syncThemeIcon();
  initMobileMenu();
  registerServiceWorker();

  try {
    const flash = sessionStorage.getItem(FLASH_KEY);
    if (flash) {
      sessionStorage.removeItem(FLASH_KEY);
      toast(flash);
    }
  } catch {
    /* sessionStorage unavailable */
  }
}
