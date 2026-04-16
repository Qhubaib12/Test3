# Website Improvement Audit (Overall)

## 1) Information architecture & navigation
- Standardize routing strategy across environments (`/about` vs `about.html`) to avoid path inconsistencies on static hosts.
- Add breadcrumb-style orientation or clearer active-page indication for deeper pages (shop, team, premium, game pages).
- Add a persistent mini-CTA in header/footer for top conversion goals (e.g., "Play now" or "Try Premium").

## 2) Visual consistency
- Establish reusable design tokens for card spacing, heading scales, and elevation to reduce page-to-page visual drift.
- Normalize icon/illustration style across game cards and secondary pages for stronger brand coherence.
- Add a lightweight theme QA checklist (contrast, spacing rhythm, motion intensity) before release.

## 3) Accessibility
- Keep interactive state announcements for filtering/search and extend to other dynamic UI (shop modal open/close confirmations).
- Validate heading hierarchy on all pages (`h1`/`h2` progression), landmark coverage (`main`, `nav`, `footer`), and link purpose text.
- Ensure keyboard focus order remains logical when mobile nav and modals are opened.

## 4) Performance
- Define target budgets for LCP/CLS/INP and measure across homepage + representative game page.
- Reduce render cost on lower-end devices by limiting pointer-move effects and expensive shadows when needed.
- Use critical CSS strategy and defer non-essential visual effects until first interaction.

## 5) Content quality
- Tighten hero copy with one stronger primary value proposition and one measurable proof point.
- Add clearer game metadata (difficulty, play time, single/multiplayer) to improve discovery.
- Include trust markers for premium (refund policy, billing cadence, cancellation clarity).

## 6) SEO & metadata
- Add/verify unique title + description per page, canonical tags, and Open Graph/Twitter metadata.
- Add structured data where appropriate (Organization, WebSite, BreadcrumbList, Product for shop items).
- Generate and submit sitemap.xml and confirm robots.txt rules match deployment intent.

## 7) Reliability & engineering workflow
- Add baseline checks in CI: HTML validation, link checker, CSS/JS lint, and formatting.
- Add smoke tests for critical paths: nav toggle, game filtering, modal open/close, contact/login forms.
- Document local run/build/deploy steps and conventions for adding new games/pages.

## Suggested roadmap order
1. Accessibility + navigation correctness.
2. Performance budgets and low-power motion fallback.
3. Conversion/UX clarity on homepage + premium funnel.
4. SEO/metadata completeness.
5. CI and automated smoke coverage.
