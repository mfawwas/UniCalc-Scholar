/**
 * Gentle, dismissible feedback nudge.
 *
 * Shown at most once per browser session, after the first of:
 *   - a successful PDF download (the "unicalc:pdf-downloaded" event), or
 *   - a second visit to an app page that already has a saved course.
 *
 * It is a corner card, not a modal: it never blocks the page or traps focus.
 * "Maybe later" and the close button snooze it for 30 days; two dismissals
 * stop it permanently. Only counters are stored, never course or user data.
 */

import * as store from "./storage.js";
import { hasInput } from "./calc.js";
import { openFeedbackDialog } from "./feedback.js";

const KEYS = {
  dismissCount: "unicalc.nudge.dismissCount",
  snoozedUntil: "unicalc.nudge.snoozedUntil",
  neverShow: "unicalc.nudge.neverShow",
  visitCount: "unicalc.visitCount",
};

const SESSION_KEY = "unicalc.nudge.sessionShown";
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_DISMISSALS = 2;

let card = null;
let shownThisSession = false;

const readInt = (key) => {
  try {
    const value = Number.parseInt(localStorage.getItem(key) ?? "", 10);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

const readBool = (key) => {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* browser storage blocked: the nudge simply behaves as if fresh */
  }
};

function sessionAlreadyShown() {
  if (shownThisSession) return true;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function markSessionShown() {
  shownThisSession = true;
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    /* no sessionStorage: the in-memory flag still covers this page */
  }
}

/** True if the saved state contains at least one course row with any input. */
function hasSavedCourse() {
  const state = store.load();
  return Boolean(
    state?.years?.some((year) => [...year.sem1, ...year.sem2].some(hasInput))
  );
}

function eligible() {
  if (readBool(KEYS.neverShow)) return false;
  if (readInt(KEYS.snoozedUntil) > Date.now()) return false;
  if (readInt(KEYS.dismissCount) >= MAX_DISMISSALS) {
    write(KEYS.neverShow, true);
    return false;
  }
  return true;
}

function hideCard() {
  const el = card;
  if (!el) return;
  card = null;
  el.classList.remove("show");
  const remove = () => el.remove();
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) remove();
  else setTimeout(remove, 220);
}

function dismiss() {
  const count = readInt(KEYS.dismissCount) + 1;
  write(KEYS.dismissCount, count);
  write(KEYS.snoozedUntil, Date.now() + SNOOZE_MS);
  if (count >= MAX_DISMISSALS) write(KEYS.neverShow, true);
  hideCard();
}

function renderCard() {
  card = document.createElement("aside");
  card.className = "feedback-nudge";
  card.setAttribute("aria-label", "Feedback prompt");
  card.innerHTML = `
    <button type="button" class="feedback-nudge-close" aria-label="Dismiss feedback prompt">&times;</button>
    <h2>Enjoying UniCalc?</h2>
    <p>Tell us what's working or what to fix.</p>
    <div class="feedback-nudge-actions">
      <button type="button" class="feedback-nudge-primary">Share feedback</button>
      <button type="button" class="feedback-nudge-secondary">Maybe later</button>
    </div>`;

  card.querySelector(".feedback-nudge-close").addEventListener("click", dismiss);
  card.querySelector(".feedback-nudge-secondary").addEventListener("click", dismiss);
  card.querySelector(".feedback-nudge-primary").addEventListener("click", () => {
    hideCard();
    openFeedbackDialog();
  });

  document.body.appendChild(card);
  requestAnimationFrame(() => card?.classList.add("show"));
}

function showNudge() {
  if (card || sessionAlreadyShown() || !eligible()) return;
  markSessionShown();
  renderCard();
}

/**
 * Start listening for triggers. Call once from the app shell, on app pages only.
 * The visit counter is incremented on every app-page load, whether or not the
 * card ends up being shown.
 */
export function initFeedbackNudge() {
  write(KEYS.visitCount, readInt(KEYS.visitCount) + 1);

  if (sessionAlreadyShown() || !eligible()) return;

  // Event bus only: the PDF module knows nothing about this nudge.
  window.addEventListener("unicalc:pdf-downloaded", showNudge);

  if (readInt(KEYS.visitCount) >= 2 && hasSavedCourse()) showNudge();
}
