import apiRequest from "api.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  try {
    const data = await apiRequest("/auth/login", "POST", {
      email,
      password,
    });

    // SAVE TOKEN
    localStorage.setItem("token", data.token);

    // redirect to dashboard
    window.location.href = "";
  } catch (err) {
    alert(err.message);
  }
});
