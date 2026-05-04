# Core User Experience

## Defining Experience

The heart of 3D Hub is the **browse → evaluate → download loop** for consumers. Everything else — the upload wizard, photo requirement, print metadata, search — exists to make this loop trustworthy and fast. Upload quality is upstream infrastructure for download confidence.

The single most make-or-break interaction is the moment a consumer opens a model page and decides within 30 seconds whether to download. If the photos and metadata collectively answer every question, the download happens. If not, they leave and the platform has failed at its core job.

## Platform Strategy

- **Platform:** Responsive web application; no native mobile apps in V1
- **Consumption context:** Primarily mobile browsers — touch-first, thumb-zone navigation, portrait orientation
- **Creation context:** Primarily desktop browsers — mouse/keyboard, multi-file drag-and-drop, multi-step wizard
- **Rendering strategy:** SSR for all public-facing pages (homepage, model pages, category/tag pages) for SEO and fast initial paint; CSR for interactive flows (upload wizard, profile management)
- **No offline functionality** required

## Effortless Interactions

1. **Finding models** — Search with live suggestions, persistent across all pages, category navigation always in reach. Zero dead ends; every browse path leads to more models.
2. **Evaluating a model** — All decision-critical information (photos from multiple angles, layer height, infill %, supports required, filament type) visible above the fold without scrolling or expanding accordions.
3. **Downloading** — One click after authentication. No confirmation dialogs, no intermediate steps, no upsell interruptions.
4. **Registering to download** — The registration gate must feel like a natural next step. What the user is about to get remains visible; the form is minimal; the value proposition is clear at the moment of ask.

## Critical Success Moments

1. **Homepage first impression** — A visitor sees the model card grid and immediately reads "these are real printed objects, this platform is trustworthy." The quality of photography in the seeded models determines this moment before any UI element does.
2. **Model page confidence** — Consumer opens a model page and thinks "I know exactly how to print this." Every required metadata field is present, photos show multiple angles. Download follows naturally.
3. **Post-upload pride** — Creator hits publish and is redirected to their live model page. The page looks great. They want to copy the URL and share it immediately. This moment should feel rewarding, not anticlimactic.
4. **Registration conversion** — Visitor hits the download gate. Well-handled = new registered user. Poorly-handled = permanent bounce. This is the single interaction where platform growth is won or lost.

## Experience Principles

1. **The model is the star** — Every layout and design decision centers the model itself. Platform chrome, navigation, and UI decoration serve it; they never compete with it.
2. **Trust before click** — Consumers need all decision-critical information *before* downloading, not after. Photos, metadata, and tags must collectively answer: "Will this print on my printer with my settings?"
3. **Enforce quality, explain why** — Where the platform requires something of creators (printed photo, complete metadata), it explains the reason clearly and positively at the point of requirement — never just blocking with an error.
4. **One click further than expected** — Reduce steps everywhere. One-click download, one-click category filter, minimal registration fields. Every removed step is a conversion gained.
5. **Gallery standards, not file-manager defaults** — Visual richness and breathing room over information density. The platform should be pleasurable to browse, not just functional to use.
