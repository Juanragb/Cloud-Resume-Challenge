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

// Update Counter
const visitCounter = document.getElementById("visitCounter");

const localfunctionUrl = "http://localhost:7071/api/http_trigger";

async function updateVisitCounter() {
  try {
    const response = await fetch(functionUrl);
    if (response.ok) {
      const data = await response.json();
      const visitas = data.visitas;
      visitCounter.textContent = visitas;
      visitCounter.style.display = "inline";
    } else {
      console.error("Error al actualizar el contador:", response.status);
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}

updateVisitCounter();
