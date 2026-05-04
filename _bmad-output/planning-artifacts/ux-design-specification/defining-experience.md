# Defining Experience

## 2.1 Defining Experience

**"See it printed — decide it's right — get it in one click."**

The defining interaction for 3D Hub is not simply "download a file" — it is **evaluate-with-confidence, then act without friction**. The mandatory real-world printed photo transforms the browse experience from "scrolling digital files" into "browsing real printed objects." That shift in what the user is looking at changes how quickly trust is established, and at what point the download decision becomes easy rather than anxious.

## 2.2 User Mental Model

**Consumer mental model:**
"I've been burned before. I downloaded a model, spent 45 minutes slicing it, ran a 3-hour print, and it came out wrong — bad mesh, missing walls, wrong dimensions. I need to know this will work before I commit my time and filament." Existing platforms offer no reliable signal at scale. Renders lie. Sparse community ratings are insufficient. The 3D Hub mental model matches how makers actually think: *did someone successfully print this?*

**Creator mental model:**
"I want to show my work. I don't want a form-heavy process. I want the result to look like something worth sharing." Creators already have printed photos — they post them on Reddit, Discord, and social media. The upload wizard simply captures what they'd naturally want to share anyway.

## 2.3 Success Criteria

- Consumer finds and downloads a model in under 2 minutes from landing
- Consumer never has to wonder "will this print?" — the model page answers that question before the Download button is clicked
- After downloading, the consumer has all print settings needed to start slicing immediately — no guessing required
- Creator publishes their first model in under 5 minutes
- Post-publish, the creator sees a page they want to share — the experience ends with pride, not anticlimactic emptiness

## 2.4 Novel vs. Established Patterns

**Established patterns (require no user education):**
Search, grid browse, card-to-detail navigation, model detail page, download button, upload form — all familiar patterns users already understand from other platforms.

**The novel element:**
Real printed photos as the *primary* trust signal — not renders, not 3D previews, not community ratings. This is a novel platform rule, but the UX of viewing and uploading photos is completely familiar. The novelty requires zero user education because seeing real photos is more intuitive than interpreting a 3D render. The innovation is in what the platform requires, not in how the interface works.

**The unique twist within established patterns:**
The upload wizard's mandatory photo step turns a standard multi-step form into a quality gate. The UX challenge is framing this requirement positively — "show off your printed result" — rather than bureaucratically. Done well, it becomes a feature creators feel proud of rather than a barrier they resent.

## 2.5 Experience Mechanics

**Consumer download flow:**

| Stage | Interaction |
|---|---|
| **Arrive** | Homepage or model page (via search engine); photo card grid loads immediately |
| **Browse** | Scroll card grid; filter by category chip or search bar; default sort by download count |
| **Evaluate** | Open model page: full-size multi-angle printed photos; structured metadata block (layer height, infill %, supports required, filament type); description; tags |
| **Trigger** | Click single prominent "Download" button |
| **Auth gate** | If unauthenticated: modal with minimal form (email + password); model preview remains visible behind modal; value clear before ask |
| **Complete** | File downloads immediately; download count increments; no confirmations or additional steps |

**Creator upload flow:**

| Step | Interaction |
|---|---|
| **1 — Files** | Drag-and-drop or browse picker; STL/3MF validation and size check run immediately on selection |
| **2 — Photos** | Upload 1+ real-world printed photos; positive framing explains the requirement; step cannot be skipped |
| **3 — Details** | Title, description, structured print metadata (all fields required); clear labels and inline helper text |
| **4 — Tags** | Predefined category chip selection + unlimited custom tag input; both equally searchable |
| **5 — Preview & Publish** | Live preview of model card and full page exactly as it will appear to visitors; license consent checkbox; Publish or Save Draft |
| **Complete** | Redirect to live model page; "Your model is live!" toast notification; URL ready to copy and share |
