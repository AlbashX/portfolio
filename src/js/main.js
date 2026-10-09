import { initHero } from "./hero.js";
import { initReveal } from "./reveal.js";
import { initDarkMode } from "./darkMode.js";
import { initCursor } from "./cursor.js";
import { initScroll } from "./scroll.js";
import { initAnimations, initCardSpotlight } from "./animations.js";

function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    const feedback = copyBtn.querySelector('.btn-feedback');
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.classList.add('is-copied');
      feedback.textContent = '✓ Copied';
      setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        feedback.textContent = '';
      }, 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

function boot() {
  initHero();
  initReveal();
  initDarkMode();
  initCursor();
  initScroll();
  initAnimations();
  initCardSpotlight();
  initEmailCopy();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}