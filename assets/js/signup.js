import { apiRequest } from "./api.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.querySelector("#fullname").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  try {
    await apiRequest("/auth/register", "POST", {
      fullname,
      email,
      password,
    });

    alert("Signup successful!");

    window.location.href = "/auth/login";
  } catch (err) {
    alert(err.message);
  }
});
