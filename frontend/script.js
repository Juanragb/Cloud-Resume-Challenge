// Mobile menu functionality
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const mobileMenu = document.querySelector(".mobile-menu");

mobileMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");
});

// Close mobile menu when clicking a link
document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
});

// Update copyright year
document.getElementById("year").textContent = new Date().getFullYear();

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Scroll indicator functionality
const scrollIndicator = document.getElementById("scrollIndicator");
const aboutSection = document.getElementById("about");

scrollIndicator.addEventListener("click", () => {
  aboutSection.scrollIntoView({ behavior: "smooth" });
});

// Hide scroll indicator when scrolling past hero section
window.addEventListener("scroll", () => {
  const heroHeight = document.querySelector(".hero").offsetHeight;
  if (window.scrollY > heroHeight / 2) {
    scrollIndicator.style.opacity = "0";
  } else {
    scrollIndicator.style.opacity = "1";
  }
});
