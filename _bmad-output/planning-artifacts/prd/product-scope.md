# Product Scope

## MVP — Minimum Viable Product

- User registration and authentication (NextAuth.js, email/password)
- Guided 5-step upload wizard: files → photos → title/description/print metadata → tags/category → preview & publish
- STL and 3MF file support; 25MB per-file limit; multi-file model listings
- Hybrid tag system: predefined platform tags + unlimited custom tags; both equally searchable
- Upload license consent (free-to-download, original work confirmation)
- Save as draft; post-publish redirect to live model page
- Homepage: model card grid, featured/trending section, category navigation, persistent search
- Search by name, tag, category, uploader; default sort by download count; filters by category
- Model page: printed photos, description, print metadata, download button
- User profile: public creator portfolio, private download library
- Upload nudge banner for non-uploaders
- Local filesystem storage (photos + model files); better-sqlite3 database
- Basic upload security: file type validation, size enforcement, no executables

## Growth Features (Post-MVP)

- Interactive 3D model viewer on model page (V1.5 — deferred pending community loop validation)
- Auto-generated 3D preview on upload (V1.5 — deferred with viewer)
- User ratings system: rate photos and printed results (V2)
- Reviews and comments (V2)
- Follow/follower system and notification feed (V2)
- Creator stats dashboard (V2)
- File version history: creators can update model files; previous versions preserved and existing downloaders notified of new version availability (V2)
- 360° printed turntable: creators can upload a turntable video or photo sequence of their printed model as an enhanced real-world preview (V2)

## Vision (Future)

- Paid/premium model listings and creator monetization
- Model customizer / parametric adjustment tool
- Moderation admin panel
- Social login (Google, GitHub)
- Cloud storage + Postgres migration (scale trigger)
- Trusted creator badges and verification
- Events, contests, and community challenges
