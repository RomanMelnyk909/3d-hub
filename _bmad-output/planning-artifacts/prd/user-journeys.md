# User Journeys

## Journey 1: Maya — The Hobbyist Maker (Consumer Happy Path)

Maya is a high school teacher who bought a Creality printer six months ago. She's been printing basic stuff from Thingiverse, but the platform keeps timing out and half the models she clicks lead to error pages. Tonight she wants to print a cable organizer for her desk. She types "cable organizer" into a search engine and lands on 3D Hub.

The homepage greets her with a clean grid of model cards. Each card has a real photo of a printed object — not a render, not a 3D preview, an actual printed thing sitting on someone's desk. She finds three cable organizer options. She clicks the most promising one.

The model page shows two printed photos from different angles. The metadata tells her: printed at 0.2mm layer height, 20% infill, no supports needed, PLA filament. Her printer can do all of that. She's never been this confident before downloading a model. One click — download. The file is in her slicer in under 30 seconds.

She prints it the next morning. It works first time.

**What this journey requires:** Search with filters, model card grid with photo thumbnail, model page with photos + structured print metadata, one-click authenticated download, fast file delivery.

---

## Journey 2: Tomas — The Designer/Maker (Creator Happy Path)

Tomas is a mechanical engineering student who's been designing functional parts for his workshop and posting photos on Reddit. People keep asking where to download his files. He's been emailing them individually. He finds 3D Hub and decides to upload his most popular design — a magnetic tool holder.

He registers with email and password. The upload wizard opens. Step 1: he drops in his STL file. Step 2: he uploads two photos — one of the finished holder mounted on the wall, one close-up of the magnetic insert. The wizard won't let him skip the photo step; there's a clear explanation of why. He doesn't mind — he's proud of how it turned out.

Step 3: title, description, print settings. He fills in layer height, infill, filament type. He adds a note about the magnet size needed. Step 4: tags. He picks "workshop," "tools," "magnetic" from predefined chips, then adds "neodymium" as a custom tag. Step 5: preview and publish. He sees exactly how the model card will look. He hits publish.

He's redirected to his live model page. He copies the URL and posts it on Reddit. Within an hour, twelve people have downloaded it.

**What this journey requires:** Registration flow, 5-step upload wizard with photo enforcement, predefined + custom tag system, license consent, draft save, post-publish redirect to model page, public profile page.

---

## Journey 3: Maya — Edge Case (Incomplete Model, Abandoned Experience)

Maya is back, looking for a phone stand this time. She finds a model that looks promising from the card thumbnail — but when she opens the model page, she sees only one photo that's blurry and taken from far away. No print metadata. The description says "it's cool." The tags are vague.

She can't tell what filament to use. She can't tell if it needs supports. She doesn't know if the dimensions will fit her phone. She closes the tab and finds a different model with complete information.

The incomplete upload was allowed through anyway — which means the platform's upload enforcement has a gap, or the creator found a workaround. Maya never downloads from that creator again.

**What this journey requires:** Photo quality cannot be validated automatically — the wizard enforces *a* photo, not a *good* photo. Print metadata fields must be required (not optional) to prevent empty model pages. This reveals a gap: metadata completeness enforcement in the wizard is as important as photo enforcement.

---

## Journey 4: Dev/Admin — Pre-launch Seeding & Post-launch Monitoring

Before public launch, the solo developer needs to seed the platform with 50+ quality models. They create a creator account and run through the upload wizard 50+ times — or in batches. This stress-tests the wizard flow, validates file storage, and confirms the homepage grid looks populated and credible before real users arrive.

Post-launch, there's no admin panel (V1 out of scope). Monitoring happens at the database and filesystem level: checking SQLite directly for flagged anomalies, watching server logs for upload errors or storage issues, reviewing the model grid manually for anything that slipped through quality gates. If a model needs to be removed, it's a direct database operation.

This exposes a constraint: without a moderation panel, any takedown or quality issue requires dev intervention. Acceptable for V1 with a small, hand-seeded model set — unsustainable at scale.

**What this journey requires:** Reliable upload wizard for batch use, SQLite accessible for direct queries, filesystem organized for manual inspection. Confirms admin panel as a genuine V2 priority, not optional polish.

---

## Journey Requirements Summary

| Capability | Revealed By |
|------------|-------------|
| Search + filters (name, tag, category) | Maya J1 |
| Model card grid with printed photo thumbnail | Maya J1 |
| Model page: photos, structured print metadata, download | Maya J1 |
| One-click authenticated download | Maya J1 |
| Email/password registration and login | Tomas J2 |
| 5-step upload wizard with photo enforcement | Tomas J2 |
| Required print metadata fields (not optional) | Maya J3 |
| Predefined + custom tag system | Tomas J2 |
| License consent, save as draft, post-publish redirect | Tomas J2 |
| Public creator profile page | Tomas J2 |
| SQLite + filesystem accessible for manual ops | Admin J4 |
| Admin/moderation panel | Admin J4 (V2 priority) |
