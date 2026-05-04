# Responsive Design & Accessibility

## Responsive Strategy

**Mobile (< 640px) — Primary consumption context:**
- 1-column model card grid; cards are full-width
- Stacked nav: logo row + full-width search bar below
- Category pills in a horizontally scrollable row (no wrapping)
- Model page: photos full-width stacked, print metadata block full-width below, Download button sticky at bottom of viewport
- Upload wizard: single-column layout; drag-and-drop file zones degrade gracefully to tap-to-browse picker
- Nav: logo + hamburger menu drawer (auth links + Upload inside)

**Tablet (640px–1023px) — Mixed context:**
- 2-column model card grid
- Horizontal nav with search bar visible
- Model page: photos full-width, metadata and download stacked below (no sidebar split)
- Upload wizard: single-column with more comfortable spacing

**Desktop (1024px+) — Primary creation context:**
- 3-column grid at 1024px → 4-column at 1280px+
- Persistent horizontal nav with full-width search bar
- Model page: two-column layout — large photo gallery left, print metadata block + Download CTA in right sidebar
- Upload wizard: multi-column form layout on Steps 3–4; Step 5 preview shows card and page side-by-side

**Max content width:** 1280px centered — wider viewports gain whitespace, not additional columns

## Breakpoint Strategy

Mobile-first using Tailwind CSS standard breakpoints:

| Breakpoint | Min-width | Grid columns | Key layout change |
|---|---|---|---|
| `default` | 0px | 1 col | Mobile single-column baseline |
| `sm` | 640px | 2 col | Tablet grid, horizontal nav |
| `lg` | 1024px | 3 col | Desktop layout, model page sidebar split |
| `xl` | 1280px | 4 col | Full 4-column grid, max-width container |

All media queries written mobile-first using Tailwind's `sm:`, `lg:`, `xl:` prefixes.

## Accessibility Strategy

**Target: WCAG 2.1 Level AA** — the industry standard for public-facing web products. No specific legal requirements apply to a community content platform, but AA is the correct baseline and commitment.

**Already addressed (from Step 8):**
- All color contrast ratios meet WCAG AA minimums (verified against the sage green palette)
- shadcn/ui (Radix UI base) provides keyboard navigation and screen reader support for all primitive components
- Focus rings: `#4A7C59` outline, 2px offset, visible on all backgrounds

**Keyboard navigation:**
- All interactive elements reachable via Tab in logical DOM order
- Skip link: "Skip to main content" as the first focusable element on every page
- Modal focus trap: Tab cycles only within open dialogs
- Wizard Back/Continue buttons fully keyboard-accessible; step indicator is non-interactive but screen-reader readable

**Screen reader support:**
- Semantic HTML: `<nav>`, `<main>`, `<article>` (model cards), `<dl>` (print metadata), `<form>` throughout
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on search suggestion results and toast notifications
- `aria-current="step"` on active wizard step indicator
- Photo alt text required at upload — creator-provided, not auto-generated

**Touch targets:**
- Minimum 44×44px for all interactive elements on mobile (buttons, links, tag chips, wizard navigation)
- ModelCard: entire card surface is the tap target

**Reduced motion:**
- `prefers-reduced-motion` media query wraps all CSS transitions and keyframe animations — disabled for users who have set this system preference

## Testing Strategy

Pragmatic approach for solo developer, prioritizing highest-impact checks:

**Responsive testing:**
- Chrome DevTools device simulation during development (all defined breakpoints)
- Real device test on at least one Android (Chrome) and one iOS (Safari) before public launch
- Browser matrix: Chrome, Firefox, Safari, Edge — latest 2 versions (per PRD)

**Accessibility testing:**
- Lighthouse accessibility audit in Chrome DevTools — run on homepage, model page, and upload wizard before launch
- Keyboard-only navigation walkthrough of both critical flows (download path + full upload path) before launch
- Color contrast verified via Chrome DevTools or Colour Contrast Analyser tool

**V2 scope (out of V1):**
- Dedicated screen reader testing with NVDA/JAWS/VoiceOver — Radix UI primitives cover the baseline; full screen reader QA is a V2 commitment
- User testing with participants with disabilities — noted as a V2 priority

## Implementation Guidelines

**Responsive development:**
- Write all styles mobile-first; use `sm:`, `lg:`, `xl:` Tailwind prefixes for progressive enhancement
- Use `rem` and `%` for sizing; avoid fixed `px` widths on layout containers
- Model card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- Images: always use Next.js `<Image>` with `sizes` attribute for responsive image delivery and optimized resolution
- Download button on mobile model page: `position: sticky; bottom: 0` — keeps the primary CTA in the thumb zone

**Accessibility development:**
- Every form field has a visible `<Label>` — never rely on placeholder text alone
- Every `<button>` without visible text includes `aria-label`
- Custom components use semantic HTML as their base element (`<article>` for ModelCard, `<dl>` for PrintMetadataBlock)
- `prefers-reduced-motion` wraps all CSS `transition` and `@keyframes` declarations
- Focus management: when a modal opens, focus moves to the first interactive element inside; when it closes, focus returns to the element that triggered it
