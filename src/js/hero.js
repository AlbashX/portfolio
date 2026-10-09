/**
 * hero.js — Phase 5–11 state machine
 *
 * Manages the three explicit hero states:
 *   LIGHT_DEFAULT  → initial state, cursor reveal enabled
 *   CURSOR_REVEAL  → reveal loop active (managed by reveal.js)
 *   DARK_LOCKED    → full dark identity, reveal suspended
 *
 * This module owns data-hero-state on the #hero element.
 * The dark-mode button wiring is here so all state transitions
 * remain in one place.
 */

import { suspendReveal, resumeReveal } from './reveal.js';

const STATES = {
  LIGHT_DEFAULT : 'LIGHT_DEFAULT',
  DARK_LOCKED   : 'DARK_LOCKED',
};

let heroEl   = null;
let toggleEl = null;
let currentState = STATES.LIGHT_DEFAULT;

// ─── State transitions ────────────────────────────────────────────────────────

function setState(state) {
  currentState = state;
  if (heroEl) heroEl.dataset.heroState = state;
}

function toLightDefault() {
  setState(STATES.LIGHT_DEFAULT);
  document.body.dataset.theme = 'light';

  if (toggleEl) {
    toggleEl.textContent = 'Turn dark mode';
    toggleEl.setAttribute('aria-pressed', 'false');
  }

  resumeReveal();
}

function toDarkLocked() {
  // Suspend reveal FIRST so the transition doesn't fight the mask
  suspendReveal();
  setState(STATES.DARK_LOCKED);
  document.body.dataset.theme = 'dark';

  if (toggleEl) {
    toggleEl.textContent = 'Return to light';
    toggleEl.setAttribute('aria-pressed', 'true');
  }
}

// ─── Toggle handler ───────────────────────────────────────────────────────────

function onToggleClick() {
  if (currentState === STATES.DARK_LOCKED) {
    toLightDefault();
  } else {
    toDarkLocked();
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function initHero() {
  heroEl   = document.getElementById('hero');
  toggleEl = document.getElementById('mode-toggle');

  if (!heroEl) {
    console.warn('[hero.js] Hero element not found.');
    return { state: STATES.LIGHT_DEFAULT };
  }

  if (toggleEl) {
    toggleEl.addEventListener('click', onToggleClick);
  }

  // Ensure the DOM reflects the initial state
  setState(STATES.LIGHT_DEFAULT);

  return {
    get state() { return currentState; },
  };
}
