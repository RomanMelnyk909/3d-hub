# Desired Emotional Response

## Primary Emotional Goals

**Primary goal: Confidence** — every design decision either builds or destroys a user's confidence that (a) the model will print correctly, (b) the platform is reliable, or (c) their work is being presented well. This is the single emotion that connects both personas and all core flows.

**Secondary feelings:**
- **Discovery delight** (browsing) — a sense that there's always something worth seeing next; pleasurable to scroll
- **Relief** (vs. broken alternatives) — fast loads, no 404s, nothing inaccessible; the opposite of Thingiverse
- **Pride** (creators post-publish) — their work is presented beautifully and worth sharing
- **Satisfaction** (completed task) — download happened, print worked, platform delivered on its promise

**Emotions to actively avoid:**
- **Skepticism** — "I don't know if this model will actually print" (Thingiverse's core failure)
- **Frustration** — upload friction, opaque error states, surprise blockers
- **Anxiety** — registration wall fears, data concerns, spam worries
- **Disappointment** — broken pages, missing metadata, blurry single photo

## Emotional Journey Mapping

**Consumer (Maya):**
| Stage | Target Emotion | What Creates It |
|---|---|---|
| First arrival | "Oh, this is different." | Gallery grid visual quality; contrast with Thingiverse clutter |
| Browsing | "I want to keep scrolling." | Photo-first cards; fast load; quality images throughout |
| Evaluating a model | "I can tell if this will work for me." | Structured metadata above the fold; multi-angle photos |
| Registration gate | "Makes sense, this is quick." | Minimal form; value visible before the ask; no dark patterns |
| Post-download | "That was easy. I'll be back." | Fast file delivery; no friction after click |
| After successful print (off-platform) | Gratitude and loyalty | The photo requirement is why the print worked |

**Creator (Tomas):**
| Stage | Target Emotion | What Creates It |
|---|---|---|
| During upload wizard | "They care about quality here." | Guided steps with clear reasoning; photo requirement framed positively |
| Post-publish redirect | "My work looks great. I want to share this." | Model page looks like a portfolio entry, not a file listing |
| Seeing downloads grow | Validation and belonging | Download counter visible; community is using their work |

## Micro-Emotions

| Emotion Pair | Target State | Trigger |
|---|---|---|
| Confidence vs. Skepticism | Confidence | Complete structured metadata; real printed photos |
| Delight vs. Indifference | Delight | Gallery-first layout; beautiful photography |
| Trust vs. Suspicion | Trust | Photo requirement as visible platform standard, not hidden rule |
| Relief vs. Frustration | Relief | Fast loads; no broken pages; everything accessible |
| Pride vs. Embarrassment | Pride (creators) | Model page presentation quality |
| Calm vs. Anxiety | Calm | Minimal registration; clear privacy cues; no dark patterns |

## Design Implications

| Target Emotion | UX Design Approach |
|---|---|
| Confidence | Structured metadata block above the fold; all required fields enforced; multi-angle photo display |
| Discovery delight | Photo-first card grid; generous whitespace; fast load times; seamless pagination |
| Trust | Photo requirement explained and visible platform-wide; consistent model quality signals across all cards |
| Relief | No 404s; no broken images; sub-2-second page loads; progress indicators on uploads |
| Creator pride | Model page as portfolio entry; post-publish redirect with full live view; download count visible |
| Avoid gate anxiety | Minimal registration form (email + password only); show the model behind the gate; no surprise emails |
| Avoid error frustration | Error states are transparent, specific, and actionable; wizard progress always visible; no silent failures |

## Emotional Design Principles

1. **Confidence is the product** — if a user isn't confident a model will print, the download doesn't happen and the platform has failed, regardless of how good the UI looks.
2. **Delight through restraint** — visual delight on 3D Hub comes from excellent photography and generous space, not from decorative UI elements or animations. Let the models do the emotional work.
3. **The registration moment is a proposal, not a demand** — treat the auth gate as an offer ("join to get this") not a wall ("you can't proceed"). Show what's behind it before asking.
4. **Error states are trust moments** — how the platform handles failures (upload errors, missing files, broken flows) determines whether a user returns. Transparent, helpful errors build more trust than hiding failure.
