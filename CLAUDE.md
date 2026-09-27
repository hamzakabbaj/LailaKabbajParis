# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing site (in French) for **Laila Kabbaj** (spelled Laila, not Leila), a Paris-based speed-reading trainer and "Formatrice certifiée Méthode Boclet®". The site has one landing page, a detail page per training that leads into a payment step, and legal pages. Instagram: https://www.instagram.com/lailakabbaj.paris/.

## Commands

Node ≥ 22.12 is required (Astro 7). Run `nvm use` first; `.nvmrc` pins Node 24.

```sh
npm run dev            # dev server on http://localhost:4321/LailaKabbajParis/ (placeholder testimonials visible)
npm run build          # production build → dist/ (placeholder testimonials removed)
npm run build:preview  # production build that keeps placeholders, for sharing a preview
npm run preview        # serve dist/ (Astro 7 runs it detached; stop with `npx astro preview stop`)
npm run check          # astro check (TypeScript + .astro diagnostics)
```

There is no test suite. Verify changes with `npm run check`, a build, and screenshots, including at a 390px phone width.

## Architecture

- **Single source of truth for trainings:** `src/data/formations.yaml` is loaded as the `formations` content collection, with its schema in `src/content.config.ts`. The homepage cards (`Formations.astro`) and `src/pages/formations/[id].astro` both read from it. The payment link lives in each entry's `checkoutUrl`; when it is empty, the buy button renders as "Inscriptions bientôt ouvertes".
- **Testimonials:** `src/data/temoignages.yaml`. Entries with `placeholder: true` are invented and are filtered out of production builds by `showPlaceholders` in `src/site.ts`. Never publish fake reviews (French consumer law, art. L121-4).
- **Global info** (name, email, Instagram, motto, certification, pillars): `src/site.ts`.
- **Page structure:** `src/pages/index.astro` composes one component per section in `src/components/`. `Base.astro` is the HTML shell (SEO meta, fonts, header, footer); `Page.astro` wraps simple text pages (legal pages, `/merci`, 404).
- **Styling:** plain CSS. Design tokens and shared classes (`.btn`, `.section`, `.eyebrow`, `.icon-badge`) are in `src/styles/global.css`; each component has its own scoped `<style>`. Icons are inline line SVGs in `Icon.astro`; add one by adding an entry to its `paths` map.
- **Fonts:** Newsreader (serif) and Nunito Sans come from the Astro Fonts API in `astro.config.mjs`. They are downloaded at build time and self-hosted, so no request goes to Google (GDPR).
- **Speed test** (`TestVitesse.astro`): vanilla JS that runs entirely client-side. Words per minute are computed from the paragraph word count, and 214 wpm (the French average) is the reference. Nothing is stored or sent, and the privacy page says so.

## Content rules

- The brand follows Laila's Instagram: cream "paper" background, black serif headings, brown accent `--brown`, olive icon circles, and a "fil" (thread) motif. Tone: warm, second-person "vous".
- Use French typography: a non-breaking space (U+00A0) before `: ; ? !` and inside `« »`. Don't put one inside JS/TS code (ternaries, `??`).
- Keep claims defensible. The research (Rayner et al. 2016) does **not** support "2–3× faster without losing comprehension", "suppress subvocalisation", or "eliminate regressions". Say "moins de retours en arrière *inutiles*". Every statistic on the page shows its source; keep them next to each other.
- Placeholder copy that Laila must validate is marked `TODO(Laila)`: the About bio, training prices and formats, FAQ answers, and the legal pages.

## Open decisions

- **Payment provider** is not chosen yet (Stripe Payment Links vs Checkout plus a serverless function vs a merchant-of-record platform). Discuss it with the user before implementing. After payment, the provider should redirect to `/merci`.
- **How trainings are delivered after purchase** is undecided. The contact email in `src/site.ts` is a placeholder.

## Hosting

GitHub Pages at https://hamzakabbaj.github.io/LailaKabbajParis/, deployed by `.github/workflows/deploy.yml` on every push to `main`. Because the site lives under a subpath, `astro.config.mjs` sets `base: '/LailaKabbajParis'`. Write internal links as `withBase('/cgv')` (from `src/site.ts`), never a bare `href="/…"`. Links that start with `#` are fine. For a custom domain later, set `site` to the domain, remove `base`, and add the domain in the repo's Pages settings.
