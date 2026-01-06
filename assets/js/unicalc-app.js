// Function: unicalc-app.js

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar");
  if (window.scrollY > 20) {
    nav.classList.add("navbar-scrolled");
  } else {
    nav.classList.remove("navbar-scrolled");
  }
});

function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    const revealPoint = 100;

    if (
      elementTop < windowHeight - revealPoint &&
      elementBottom > revealPoint
    ) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();
