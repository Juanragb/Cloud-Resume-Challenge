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


// Scroll indicator
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


// ===== GESTIÓN DE COOKIES =====
document.addEventListener('DOMContentLoaded', function() {
  // 1. Establecer cookie OBLIGATORIA (siempre se ejecuta)
  const visitorId = getCookie('visitor_id') || crypto.randomUUID();
  setCookie('visitor_id', visitorId, 1); // Cookie de 1 día
  
  // 2. Mostrar banner solo para cookies OPCIONALES
  initOptionalCookiesBanner();
  
  // 3. Actualizar contador
  updateVisitCounter(visitorId);
});

// ===== BANNER DE COOKIES (Para futuras cookies opcionales) =====
function initOptionalCookiesBanner() {
  const cookieConsent = document.querySelector('.cookie-consent');
  const acceptButton = document.querySelector('.auth-button');
  const rejectButton = document.querySelector('.auth-button-light');

  // Ocultar banner si ya hay decisión sobre cookies opcionales
  if (getCookie('optional_cookies_consent')) {
      cookieConsent.style.display = 'none';
      return;
  }

  // Mostrar banner después de 1 segundo
  setTimeout(() => {
      cookieConsent.classList.add('-deploy');
  }, 1000);

  // Botones del banner (ejemplo para futuras cookies)
  acceptButton?.addEventListener('click', () => {
      setCookie('optional_cookies_consent', 'true', 30);
      closeBanner(cookieConsent);
      // cargar aquí cookies opcionales (ej: Google Analytics)
  });

  rejectButton?.addEventListener('click', () => {
      setCookie('optional_cookies_consent', 'false', 30);
      closeBanner(cookieConsent);
  });
}

function closeBanner(element) {
  element.classList.remove('-deploy');
  setTimeout(() => {
      element.style.display = 'none';
  }, 300);
}

// ===== CONTADOR DE VISITAS =====
async function updateVisitCounter(visitorId) {
  try {
      const response = await fetch('http://localhost:7071/api/http_trigger', {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Visitor-ID': visitorId,
              'Content-Type': 'application/json'
          }
      });

      if (response.ok) {
          const data = await response.json();
          const visitCounter = document.getElementById("visitCounter");
          if (visitCounter) {
              visitCounter.textContent = data.visitas;
              visitCounter.style.display = "inline";
          }
      }
  } catch (error) {
      console.error("Error actualizando contador:", error);
  }
}

// ===== FUNCIONES AUXILIARES =====
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; Secure; SameSite=Lax`;
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) return cookieValue;
  }
  return null;
}