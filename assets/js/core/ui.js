/**
 * Small shared UI helpers: a toast message and a promise-based dialog.
 * Built with DOM APIs (textContent / .value), so nothing typed by the user is ever parsed as HTML.
 * Styles live in pages.css (.toast, .modal-*).
 */

let toastTimer = null;

export function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/**
 * Show a modal dialog.
 *   fields: [{ name, label, value?, placeholder?, maxLength?, autocomplete? }]
 * Resolves to an object of the field values when confirmed ({} if there are no fields),
 * or null if cancelled (Cancel button, Escape, or clicking outside).
 */
export function openDialog({
  title,
  message = "",
  fields = [],
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  danger = false,
}) {
  return new Promise((resolve) => {
    const previouslyFocused = document.activeElement;

    const overlay = make("div", "modal-overlay");
    const form = make("form", "modal-content");
    form.setAttribute("role", "dialog");
    form.setAttribute("aria-modal", "true");
    form.noValidate = true;

    const heading = make("h2", "", title);
    heading.id = "dialog-title";
    form.setAttribute("aria-labelledby", heading.id);
    form.appendChild(heading);
    if (message) form.appendChild(make("p", "", message));

    const inputs = {};
    fields.forEach((field, i) => {
      const wrap = make("div", "modal-field");
      const label = make("label", "", field.label);
      const input = make("input");
      input.type = "text";
      input.id = `dialog-field-${i}`;
      label.htmlFor = input.id;
      input.value = field.value ?? "";
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.maxLength) input.maxLength = field.maxLength;
      input.autocomplete = field.autocomplete || "off";
      inputs[field.name] = input;
      wrap.append(label, input);
      form.appendChild(wrap);
    });

    const actions = make("div", "modal-actions");
    const cancel = make("button", "modal-btn", cancelLabel);
    cancel.type = "button";
    const confirm = make("button", `modal-btn ${danger ? "danger" : "confirm"}`, confirmLabel);
    confirm.type = "submit";
    actions.append(cancel, confirm);
    form.appendChild(actions);
    overlay.appendChild(form);

    const close = (result) => {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
      resolve(result);
    };

    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(null);
      } else if (event.key === "Tab") {
        // Keep keyboard focus inside the dialog.
        const focusable = [...form.querySelectorAll("input, button")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      close(Object.fromEntries(fields.map((f) => [f.name, inputs[f.name].value])));
    });
    cancel.addEventListener("click", () => close(null));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    document.addEventListener("keydown", onKey, true);

    document.body.appendChild(overlay);
    (fields.length ? inputs[fields[0].name] : danger ? cancel : confirm).focus();
  });
}