// Smooth-scrolls to a landing page section by id. "home" means the very top.
export function scrollToSection(id) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let top = 0;

  if (id !== "home") {
    const el = document.getElementById(id);
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY;
  }

  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}