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
const smallBentoSelector = [
  ".outcome",
  ".flow-step",
  ".sector-card",
  ".tech-card",
  ".principle",
  ".lane-item",
  ".control-card",
  ".deployment-card",
].join(",");

document.querySelectorAll(smallBentoSelector).forEach((card) => {
  if (!card.matches("[data-bento]")) return;
  card.classList.add("bento-parallax");
});

const scrollStackSelector = [
  ".outcome-grid",
  ".flow-grid",
  ".layer-grid",
  ".sector-grid",
  ".tech-grid",
  ".principles",
  ".lane-items",
  ".control-grid",
  ".deployment-grid",
].join(",");

document.querySelectorAll(scrollStackSelector).forEach((group) => {
  const cards = [...group.children].filter((card) => card.matches("[data-bento]"));
  if (cards.length < 2) return;
  group.classList.add("scroll-stack");
  cards.forEach((card, index) => {
    card.style.setProperty("--stack-top", `${84 + Math.min(index, 7) * 8}px`);
    card.style.setProperty("--stack-z", `${index + 1}`);
  });
});

const resetBento = (card) => {
  card.style.removeProperty("--rx");
  card.style.removeProperty("--ry");
  card.style.removeProperty("--mx");
  card.style.removeProperty("--my");
  card.style.removeProperty("--px");
  card.style.removeProperty("--py");
  card.style.removeProperty("--lift");
};

const setBentoMotion = (card, clientX, clientY, strength = {}) => {
  const bounds = card.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
  const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
  const tiltX = strength.tiltX ?? 5;
  const tiltY = strength.tiltY ?? 6;
  const parallaxX = strength.parallaxX ?? 5;
  const parallaxY = strength.parallaxY ?? 4;
  card.style.setProperty("--rx", `${(0.5 - y) * tiltX}deg`);
  card.style.setProperty("--ry", `${(x - 0.5) * tiltY}deg`);
  card.style.setProperty("--mx", `${x * 100}%`);
  card.style.setProperty("--my", `${y * 100}%`);
  card.style.setProperty("--px", `${(x - 0.5) * parallaxX}px`);
  card.style.setProperty("--py", `${(y - 0.5) * parallaxY}px`);
  card.style.setProperty("--lift", strength.lift ?? "-5px");
};

bentos.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    setBentoMotion(card, event.clientX, event.clientY);
  });
  card.addEventListener("pointerleave", () => resetBento(card));
  card.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget || !card.contains(event.relatedTarget)) resetBento(card);
  });
  card.addEventListener("pointercancel", () => resetBento(card));
});

const heroDiagram = document.querySelector(".hero-diagram");
let activeHeroPointer = null;
let activeHeroTouch = null;
let heroResetTimer = null;
const heroTouchStrength = { tiltX: 12, tiltY: 14, parallaxX: 30, parallaxY: 24, lift: "-4px" };

const finishHeroTouch = (pointerId, delay = 180) => {
  if (!heroDiagram || pointerId !== activeHeroPointer) return;
  activeHeroPointer = null;
  heroDiagram.classList.remove("is-touch-active");
  window.clearTimeout(heroResetTimer);
  heroResetTimer = window.setTimeout(() => resetBento(heroDiagram), delay);
};

if (heroDiagram) {
  heroDiagram.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "pen" || reducedMotion.matches) return;
    activeHeroPointer = event.pointerId;
    window.clearTimeout(heroResetTimer);
    heroDiagram.classList.add("is-touch-active");
    try { heroDiagram.setPointerCapture(event.pointerId); } catch {}
    setBentoMotion(heroDiagram, event.clientX, event.clientY, heroTouchStrength);
  });
  heroDiagram.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activeHeroPointer || reducedMotion.matches) return;
    setBentoMotion(heroDiagram, event.clientX, event.clientY, heroTouchStrength);
  });
  heroDiagram.addEventListener("pointerup", (event) => finishHeroTouch(event.pointerId));
  heroDiagram.addEventListener("pointercancel", (event) => finishHeroTouch(event.pointerId, 0));
  heroDiagram.addEventListener("lostpointercapture", (event) => finishHeroTouch(event.pointerId));

  const findHeroTouch = (touches) => [...touches].find((touch) => touch.identifier === activeHeroTouch);
  const finishFingerInteraction = (delay = 220) => {
    activeHeroTouch = null;
    heroDiagram.classList.remove("is-touch-active");
    window.clearTimeout(heroResetTimer);
    heroResetTimer = window.setTimeout(() => resetBento(heroDiagram), delay);
  };

  heroDiagram.addEventListener("touchstart", (event) => {
    if (reducedMotion.matches || activeHeroTouch !== null) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    activeHeroTouch = touch.identifier;
    window.clearTimeout(heroResetTimer);
    heroDiagram.classList.add("is-touch-active");
    setBentoMotion(heroDiagram, touch.clientX, touch.clientY, heroTouchStrength);
  }, { passive: true });
  heroDiagram.addEventListener("touchmove", (event) => {
    if (reducedMotion.matches || activeHeroTouch === null) return;
    const touch = findHeroTouch(event.touches);
    if (touch) setBentoMotion(heroDiagram, touch.clientX, touch.clientY, heroTouchStrength);
  }, { passive: true });
  heroDiagram.addEventListener("touchend", (event) => {
    if ([...event.changedTouches].some((touch) => touch.identifier === activeHeroTouch)) finishFingerInteraction();
  }, { passive: true });
  heroDiagram.addEventListener("touchcancel", () => finishFingerInteraction(0), { passive: true });
}

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
