// utils.js

/**
 * Triggers the native file picker for profile image upload
 * @param {string} inputId - ID of the file input element
 */
export function triggerUpload(inputId = "profile-upload-input") {
  const input = document.getElementById(inputId);
  if (input) input.click();
}

/**
 * Attaches a preview handler to a file input
 * Reads the image and sets it as a background on the avatar element
 *
 * @param {Object} options
 * @param {string} options.inputId - File input element ID
 * @param {string} options.previewId - Avatar preview element ID
 */
export function attachProfileUploadPreview({
  inputId = "profile-upload-input",
  previewId = "avatar-preview",
} = {}) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!input || !preview) return;

  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      preview.textContent = ""; // Clear initials
      preview.style.backgroundImage = `url(${event.target.result})`;
      preview.style.backgroundSize = "cover";
      preview.style.backgroundPosition = "center";
    };

    reader.readAsDataURL(file);

    // Backend-ready file reference
    console.log("Ready to upload:", file.name);
  });
}

/**
 * Collects settings data and sends it to backend (mocked)
 * Replace console.log with real API call later
 */
export function saveSettings() {
  const data = {
    name: document.getElementById("user-name")?.value || "",
    university: document.getElementById("user-university")?.value || "",
    twoFactor: document.getElementById("2fa-toggle")?.checked || false,
  };

  console.log("Sending to Backend API...", data);

  // Example future implementation:
  // return fetch('/api/settings', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
}
