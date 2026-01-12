// Trigger File Explorer
function triggerUpload() {
  document.getElementById("profile-upload-input").click();
}

// Handle File Preview (Backend Ready)
document
  .getElementById("profile-upload-input")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById("avatar-preview").textContent = ""; // Clear initials
        document.getElementById(
          "avatar-preview"
        ).style.backgroundImage = `url(${event.target.result})`;
        document.getElementById("avatar-preview").style.backgroundSize =
          "cover";
      };
      reader.readAsDataURL(file);

      // This 'file' object is what you will later send to your backend
      console.log("Ready to upload:", file.name);
    }
  });

// Mock Save Function (How your backend will receive data)
function saveSettings() {
  const data = {
    name: document.getElementById("user-name").value,
    university: document.getElementById("user-university").value,
    twoFactor: document.getElementById("2fa-toggle").checked,
  };

  console.log("Sending to Backend API...", data);
  // Future: fetch('/api/settings', { method: 'POST', body: JSON.stringify(data) })
}
