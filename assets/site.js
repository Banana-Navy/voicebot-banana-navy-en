const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealItems = document.querySelectorAll("[data-reveal]");
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px" },
  );
  revealItems.forEach((item) => observer.observe(item));
}

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const bentos = document.querySelectorAll("[data-bento]");

const resetBento = (card) => {
  card.style.removeProperty("--rx");
  card.style.removeProperty("--ry");
  card.style.removeProperty("--mx");
  card.style.removeProperty("--my");
};

bentos.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    card.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  });
  card.addEventListener("pointerleave", () => resetBento(card));
  card.addEventListener("pointercancel", () => resetBento(card));
});

const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.hidden = isOpen;
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    });
  });
}

document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

