/**
 * reveal.js — Phase 7 & 8
 *
 * SYSTEM A: CURSOR / FACE REVEAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Organic cursor/touch reveal of the dark identity portrait.
 * This is LOCAL discovery — NOT a global dark-mode switch.
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 *  • Mouse/touch position → target coordinates
 *  • RAF loop lerps current → target (creates inertia / drag feel)
 *  • Lerped values written as CSS vars on .hero:
 *       --mouse-x   interpolated X (px, relative to hero)
 *       --mouse-y   interpolated Y (px, relative to hero)
 *       --mask-size organic diameter (px)
 *  • CSS mask-image on .reveal-layer reads these vars and renders the blob
 *  • .is-revealing class on .hero controls opacity fade in/out
 *
 * State guard
 * ─────────────────────────────────────────────────────────────────────────────
 * When data-hero-state="DARK_LOCKED" the reveal system pauses completely.
 * The dark portrait is already fully visible via CSS; we must not interfere.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const LERP_FACTOR = 0.22;  // 0–1: lower = more lag / inertia
const LERP_FACTOR_RM = 0.45;  // Faster lerp for reduced-motion preference
const MASK_SIZE_DESKTOP = 380; // px – reveal diameter on desktop/tablet
const MASK_SIZE_MOBILE = 240; // px – reveal diameter on mobile touch
const MOBILE_BREAKPOINT = 768; // px

// ─── State ────────────────────────────────────────────────────────────────────

/** Current (lerped) mask position */
let cx = -9999;
let cy = -9999;

/** Target (raw cursor/touch) position */
let tx = -9999;
let ty = -9999;

/** Last known screen coordinates for scroll calculations */
let lastClientX = -9999;
let lastClientY = -9999;

/** Whether the reveal is active (cursor/finger is inside the hero) */
let isActive = false;

/** RAF handle */
let rafId = null;

/** Cached hero element */
let hero = null;

/** Whether the user prefers reduced motion */
let prefersReducedMotion = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

/** Clamp a value between min and max */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/** Check whether dark mode is locked — reveal must yield */
function isDarkLocked() {
    return hero?.dataset?.heroState === 'DARK_LOCKED';
}

// ─── RAF loop ─────────────────────────────────────────────────────────────────

function tick() {
    if (!hero) return;

    const factor = prefersReducedMotion ? LERP_FACTOR_RM : LERP_FACTOR;
    const maskSize = isMobile() ? MASK_SIZE_MOBILE : MASK_SIZE_DESKTOP;

    // Lerp current toward target
    cx = lerp(cx, tx, factor);
    cy = lerp(cy, ty, factor);

    // Write CSS custom properties directly on the hero element
    hero.style.setProperty('--mouse-x', `${cx}px`);
    hero.style.setProperty('--mouse-y', `${cy}px`);
    hero.style.setProperty('--mask-size', `${maskSize}px`);

    rafId = requestAnimationFrame(tick);
}

function startLoop() {
    if (!rafId) {
        rafId = requestAnimationFrame(tick);
    }
}

function stopLoop() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

// ─── Reveal control ───────────────────────────────────────────────────────────

function enterReveal() {
    if (isDarkLocked()) return;
    isActive = true;
    hero.classList.add('is-revealing');
    startLoop();
}

function leaveReveal() {
    isActive = false;
    hero.classList.remove('is-revealing');

    // Move the mask off-screen so it doesn't "peek" during the fade-out
    tx = -9999;
    ty = -9999;

    // Let the loop run one more moment then stop
    setTimeout(() => {
        if (!isActive) stopLoop();
    }, 300);
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function getHeroCoords(clientX, clientY) {
    // Hero is at the top of the page. 
    // Y coordinate is simply screen Y + scroll position.
    return {
        x: clamp(clientX, 0, window.innerWidth),
        y: clamp(clientY + window.scrollY, 0, hero.offsetHeight),
    };
}

function onPointerEnter(e) {
    if (e.pointerType === 'touch') return;

    lastClientX = e.clientX;
    lastClientY = e.clientY;

    const { x, y } = getHeroCoords(lastClientX, lastClientY);

    // Teleport current position to avoid "swooping in" from off-screen
    cx = x;
    cy = y;
    tx = x;
    ty = y;

    enterReveal();
}

function onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    if (isDarkLocked()) return;

    lastClientX = e.clientX;
    lastClientY = e.clientY;

    const { x, y } = getHeroCoords(lastClientX, lastClientY);
    tx = x;
    ty = y;

    // Wake up the mask immediately if the mouse moves while inside
    if (!isActive) {
        enterReveal();
    }
}

function onPointerLeave(e) {
    if (e.pointerType === 'touch') return;
    leaveReveal();
}

function onTouchStart(e) {
    if (isDarkLocked()) return;

    const touch = e.touches[0];
    lastClientX = touch.clientX;
    lastClientY = touch.clientY;

    const { x, y } = getHeroCoords(lastClientX, lastClientY);

    // Teleport so there's no swoop on first touch
    cx = x;
    cy = y;
    tx = x;
    ty = y;

    enterReveal();
}

function onTouchMove(e) {
    if (isDarkLocked()) return;

    const touch = e.touches[0];
    lastClientX = touch.clientX;
    lastClientY = touch.clientY;

    const { x, y } = getHeroCoords(lastClientX, lastClientY);
    tx = x;
    ty = y;
}

function onTouchEnd() {
    leaveReveal();
}

// Recalculate target coordinates when scrolling (even if the mouse is still)
function onScroll() {
    if (isActive && lastClientX !== -9999) {
        const { x, y } = getHeroCoords(lastClientX, lastClientY);
        tx = x;
        ty = y;
    }
}

// ─── Reduced-motion observer ──────────────────────────────────────────────────

function watchReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mq.matches;
    mq.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
    });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call from main.js to wire up the reveal system.
 * hero.js must call initReveal AFTER the hero element exists in the DOM.
 */
export function initReveal() {
    hero = document.getElementById('hero');
    if (!hero) {
        console.warn('[reveal.js] Hero element not found — reveal disabled.');
        return;
    }

    watchReducedMotion();

    // Pointer events (unified mouse + stylus; touch falls through to touch events)
    hero.addEventListener('pointerenter', onPointerEnter);
    hero.addEventListener('pointermove', onPointerMove);
    hero.addEventListener('pointerleave', onPointerLeave);

    // Touch events (mobile / tablet finger)
    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchmove', onTouchMove, { passive: true });
    hero.addEventListener('touchend', onTouchEnd);
    hero.addEventListener('touchcancel', onTouchEnd);

    // Scroll event (fixes the mask detaching from cursor on scroll)
    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Called by hero.js / darkMode.js when entering DARK_LOCKED state.
 * Suspends the reveal so the full dark portrait remains uninterrupted.
 */
export function suspendReveal() {
    isActive = false;
    hero?.classList.remove('is-revealing');
    stopLoop();
}

/**
 * Called by hero.js / darkMode.js when returning to LIGHT_DEFAULT state.
 * Re-enables reveal on next pointer/touch interaction automatically.
 */
export function resumeReveal() {
    if (hero && hero.matches(':hover')) {
        enterReveal();
    }
}