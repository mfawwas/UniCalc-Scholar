// Function
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

// Loading Screen Logic
function startLoading(callback) {
  const loader = document.getElementById("loader-wrapper");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("loader-text");
  let width = 0;

  const messages = ["Initializing...", "Securing math engine...", "Ready."];

  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        if (callback) callback();
      }, 500);
    } else {
      width += Math.floor(Math.random() * 30) + 10;
      if (width > 100) width = 100;
      bar.style.width = width + "%";

      if (width < 40) text.innerText = messages[0];
      else if (width < 80) text.innerText = messages[1];
      else text.innerText = messages[2];
    }
  }, 550);
}

window.addEventListener("load", () => {
  startLoading();
});

function launchAppTransition(event) {
  event.preventDefault();
  const loader = document.getElementById("loader-wrapper");

  loader.style.opacity = "1";
  loader.style.visibility = "visible";

  document.getElementById("progress-bar").style.width = "0%";
  startLoading(() => {
    window.location.href = "app.html";
  });
}
