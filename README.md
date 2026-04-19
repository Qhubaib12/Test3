# PixelAddict

A retro-styled browser arcade hub featuring multiple mini-games, filtering, and polished motion/visual effects.

## What could be improved next

1. **Navigation/link resiliency**
   - Standardize internal page links (for example, decide consistently between extensionless routes like `/about` and direct file paths such as `about.html`) to avoid hosting-specific 404 behavior.

2. **Accessibility hardening**
   - Add an ARIA live region for game-filter results (e.g., “7 games shown”) so screen-reader users get feedback after searching/filtering.
   - Run an automated accessibility audit (Lighthouse or axe) and fix contrast/focus edge cases.

3. **Performance budget & graceful motion fallback**
   - Define a performance budget and track LCP/CLS/INP.
   - Add a stricter low-power path for motion-heavy effects on mid-tier devices.

4. **Testing and CI**
   - Add lightweight checks (HTML validation, linting, link checks) and run them in CI.
   - Add a small browser smoke test for game filtering and navigation.

5. **Project docs**
   - Expand this README with local development instructions, deployment details, and conventions for adding new games/pages.

## Quick project map

- `index.html` and other top-level `*.html` pages: marketing/site pages.
- `<GameName>/index.html`: individual game entry pages.
- `assets/styles/main.css`: shared styling.
- `assets/scripts/main.js`: shared interactions (navigation toggle, motion, filtering, modals, forms).
