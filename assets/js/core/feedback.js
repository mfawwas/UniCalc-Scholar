/**
 * Shared "Help & feedback" dialog.
 *
 * One dialog is injected into the page the first time it is needed and reused
 * afterwards. It uses the native <dialog> element, so the browser handles focus
 * trapping, Escape and the backdrop; we only restore focus to the trigger.
 *
 * Nothing is sent anywhere from this module. The WhatsApp and email links are
 * opened only when the user clicks them, and they pre-fill a fixed message with
 * no grades, course codes or personal data.
 */

const MAINTAINERS = [
  { name: "David", email: "adewoleshinayo@gmail.com", whatsapp: "2348128315814" },
  { name: "Muhammed", email: "antidroidconcepts@gmail.com", whatsapp: "2349029197337" },
];

const SUBJECT = "UniCalc feedback";
const BODY = "Hi UniCalc team,\nI'd like to share some feedback:";

let dialog = null;
let previousFocus = null;

const whatsappHref = (number) =>
  `https://wa.me/${number}?text=${encodeURIComponent(BODY)}`;

const emailHref = () =>
  `mailto:${MAINTAINERS.map((m) => m.email).join(",")}?subject=${encodeURIComponent(
    SUBJECT
  )}&body=${encodeURIComponent(BODY)}`;

/** Absolute URL of contact.html, whether the dialog is opened from / or /pages/. */
const contactHref = () => new URL("../contact.html", document.baseURI).href;

const WHATSAPP_ICON = `
  <svg class="feedback-channel-icon" viewBox="0 0 24 24" aria-hidden="true"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.5 8.5 0 1 1 21 11.5z"/>
  </svg>`;

const EMAIL_ICON = `
  <svg class="feedback-channel-icon" viewBox="0 0 24 24" aria-hidden="true"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>`;

function whatsappButtons() {
  return MAINTAINERS.map(
    (m) => `
      <a class="feedback-channel" href="${whatsappHref(m.whatsapp)}"
        target="_blank" rel="noopener noreferrer"
        aria-label="Message ${m.name} on WhatsApp (opens in a new tab)">
        ${WHATSAPP_ICON}
        <span>WhatsApp — ${m.name}</span>
      </a>`
  ).join("");
}

/**
 * Inject the dialog once and wire its close behaviour.
 * Safe to call more than once; returns the same element.
 */
export function initFeedbackDialog() {
  if (dialog) return dialog;

  const existing = document.getElementById("feedback-dialog");
  if (existing) {
    dialog = existing;
    return dialog;
  }

  dialog = document.createElement("dialog");
  dialog.id = "feedback-dialog";
  dialog.className = "feedback-dialog";
  dialog.setAttribute("aria-labelledby", "feedback-title");
  dialog.innerHTML = `
    <div class="feedback-body">
      <button type="button" class="feedback-close" aria-label="Close feedback dialog">&times;</button>
      <h2 id="feedback-title">Help &amp; feedback</h2>
      <p class="feedback-lead">
        Questions, bugs, suggestions, or a review — reach us on WhatsApp or email.
      </p>
      <div class="feedback-channels">
        ${whatsappButtons()}
        <a class="feedback-channel feedback-channel-primary" href="${emailHref()}"
          aria-label="Email both maintainers">
          ${EMAIL_ICON}
          <span>Email both maintainers</span>
        </a>
      </div>
      <a class="feedback-contact-link" href="${contactHref()}">See full contact page &rarr;</a>
    </div>`;

  dialog.querySelector(".feedback-close").addEventListener("click", () => dialog.close());

  // Native <dialog> places the click target on the dialog element itself when
  // the backdrop is clicked; clicks on the card hit its children instead.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Escape fires "cancel" and closes natively; "close" also runs for the
  // close button and backdrop clicks, so focus restoration lives here.
  dialog.addEventListener("close", () => {
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    previousFocus = null;
  });

  document.body.appendChild(dialog);
  return dialog;
}

/** Open the feedback dialog, remembering the trigger so focus can return to it. */
export function openFeedbackDialog() {
  const el = initFeedbackDialog();
  if (el.open) return;

  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  el.showModal();
}
