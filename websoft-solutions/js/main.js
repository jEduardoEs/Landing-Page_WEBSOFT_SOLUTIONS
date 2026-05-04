// =============================================
//  WebSoft Solutions — main.js
// =============================================

// --- WhatsApp ---
function openWA() {
  var msg = encodeURIComponent(
    "Hola WebSoft Solutions! Me interesa obtener más información sobre sus servicios."
  );
  window.open("https://wa.me/50236714377?text=" + msg, "_blank");
}

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    var target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// --- Hamburger / Mobile menu ---
var hamburger   = document.getElementById("hamburger");
var mobileMenu  = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", function () {
    mobileMenu.classList.toggle("open");
  });
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove("open");
}

// --- Navbar shadow on scroll ---
var navbar = document.getElementById("navbar");
window.addEventListener("scroll", function () {
  if (navbar) {
    navbar.style.boxShadow =
      window.scrollY > 10 ? "0 2px 20px rgba(0,0,0,.4)" : "none";
  }
});

// --- Fade-in on scroll (Intersection Observer) ---
var fadeEls = document.querySelectorAll(
  ".service-card, .product-card, .why-feature, .counter-item"
);

if ("IntersectionObserver" in window) {
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity    = "1";
          entry.target.style.transform  = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeEls.forEach(function (el) {
    el.style.opacity   = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity .5s ease, transform .5s ease";
    observer.observe(el);
  });
}
