// src/js/scroll.js
import Lenis from 'lenis';
import { suspendReveal, resumeReveal } from './reveal.js';

let lenis = null;

export function initScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth-scroll all internal anchors
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                lenis.scrollTo(targetId, { offset: 0, duration: 1.2 });
            }
        });
    });

    // Hero visibility observer
    const hero = document.getElementById('hero');
    if (hero) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        resumeReveal();
                    } else {
                        suspendReveal();
                    }
                });
            },
            { threshold: 0.1 }
        );
        observer.observe(hero);
    }
}

export function getLenis() {
    return lenis;
}