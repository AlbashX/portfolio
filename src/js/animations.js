/**
 * animations.js — Phase 13
 *
 * Scroll-entrance observer.
 * Watches every .fade-up element and adds .is-visible when it crosses
 * the viewport threshold. Immediately unobserves so the animation only
 * fires once per page load (no re-trigger on scroll-back).
 *
 * Zero dependencies — no GSAP, no library overhead.
 */

export function initAnimations() {
    // IntersectionObserver is universally supported; no polyfill needed.
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('is-visible');

                // Fire once, then stop watching this element
                observer.unobserve(entry.target);
            });
        },
        {
            // Element must be 15% into the viewport before triggering
            threshold: 0.15,
        }
    );

    // Observe every element that opts into the entrance animation
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
}
// ... existing initAnimations() function ...

export function initCardSpotlight() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--card-x', `${x}px`);
            card.style.setProperty('--card-y', `${y}px`);
        });
    });
}