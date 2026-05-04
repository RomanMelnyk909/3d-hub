# Design Direction Decision

## Design Directions Explored

Six directions were explored via an HTML showcase (`ux-design-directions.html`), each applying the established green palette with varying layout approaches:

| # | Direction | Key Characteristic |
|---|---|---|
| 1 | Minimal Gallery | White nav, 4-col photo grid, green as accent only |
| 2 | Editorial Featured | Hero featured model + trending row above the grid |
| 3 | Card Spotlight | Green header, 3-col cards with print metadata visible on card |
| 4 | Search-Centered | Large hero search bar, category tiles, grid secondary |
| 5 | Sidebar Explorer | Persistent filter sidebar, denser 3-col grid |
| 6 | Creator-Balanced | Prominent upload CTA banner, tab navigation |

## Chosen Direction

**Direction 1 — Minimal Gallery** as the base, with the **structured print metadata panel from Direction 3** applied to the model detail page (not the card).

- White navigation bar with sage green accents, logo, and CTAs
- 4-column photo-dominant card grid (photo ~75% of card height)
- Cards show: photo, model title, download count, one tag chip
- Print metadata (layer height, infill %, supports, filament) surfaced on the model page in a structured block above the fold — not on the card
- Green used only on: primary buttons, active states, tag chips, focus rings, hover accents

## Design Rationale

Direction 1 is the most consistent with the core philosophy: *gallery feel, not file archive*. White nav and restrained green usage keep the photo content as the dominant visual element — the platform chrome never competes with the models themselves. This is the Pinterest-closest direction and the one that best supports the "gallery aesthetics as brand trust" design opportunity identified in Step 5.

The metadata enhancement from Direction 3 is applied at the model page level rather than the card level. Cards are for discovery (does this look interesting?); the model page is for evaluation (will this print correctly on my setup?). Surfacing metadata on the card adds visual complexity that slows the browse experience without providing value at the discovery stage.

## Implementation Approach

- **Homepage:** Thin nav (logo + search + auth CTAs) → category filter pills → 4-col model card grid
- **Model card:** Photo (75% height) → title → download count + primary tag chip
- **Model page:** Full-width photo gallery → structured print metadata block (layer height, infill %, supports required, filament type) → description → tags → Download button
- **Color application:** `#F8FAF8` page background, `#FFFFFF` card backgrounds, `#4A7C59` for all interactive elements and accents
- **Typography:** Inter throughout; model names at `h3` weight on cards; metadata labels at `label` size with muted color
