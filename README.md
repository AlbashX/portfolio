# Syed Albash — Software Engineer

Cinematic interactive portfolio, engineered to high-end production standards.

## Architecture & Features

- **Dual-Identity Hero:** Features a custom `requestAnimationFrame` fluid mask that organically reveals an alternate dark portrait tracking the cursor/touch coordinates.
- **Dark Mode State Machine:** A strict deterministic state toggle that fully locks the cinematic dark identity and suspends the local cursor reveal.
- **Engineered UI & VFX:** Custom Bento Grid layouts, dynamic CSS radial spotlight hover effects, and a highly polished 3-column production footer.
- **Smooth Scrolling:** Integrated **Lenis** for a physics-based, accessible virtual scroll engine synced to the browser's refresh rate.
- **Performant Entrances:** Zero-dependency (no GSAP) scroll-triggered animations powered by `IntersectionObserver` and hardware-accelerated CSS transitions.


Live Demo

Experience the live, interactive portfolio here: syedalbash-dev.vercel.app

## Requirements

- Node.js 20+
- npm 10+

## Scripts

```bash
npm install
npm run dev      # Local Vite server at http://localhost:5173
npm run build    # Generates production bundle
npm run preview  # Previews the production build locally
