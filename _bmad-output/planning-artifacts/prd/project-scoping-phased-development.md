# Project Scoping & Phased Development

## MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — prove the core loop (upload → browse → download) with real quality controls before adding any community or visualization features.

**Resource Requirements:** Solo developer. Every scope decision must be survivable by one person. Features that require ongoing moderation, complex infrastructure, or high maintenance surface area are explicitly deferred.

## MVP Feature Set (Phase 1 — V1)

**Core User Journeys Supported:** Maya J1 (consumer happy path), Tomas J2 (creator happy path), Admin J4 (pre-launch seeding).

**Must-Have Capabilities:** See Product Scope → MVP section.

**Pre-launch gate:** 50+ quality-seeded models published before public launch. Platform does not go live with an empty grid.

## Post-MVP Features

**Phase 2 — V1.5 (3D Viewer):**
Interactive 3D model viewer on model page + auto-generated 3D preview on upload. Triggered after core community loop is validated — not on a fixed timeline.

**Phase 3 — V2 (Community Layer):**
User ratings, reviews, comments, follow/follower system, creator stats dashboard, notification feed.

**Phase 4 — Future:**
Paid/premium models, model customizer, moderation admin panel, social login, cloud storage + Postgres migration, creator badges, events and contests.

## Risk Mitigation Strategy

**Technical Risks:**
- *Biggest risk:* SQLite + local filesystem is not production-grade at scale. Mitigation: explicitly scoped as temporary; data model designed for migration from day one. Acceptable for V1 solo-dev scale.
- *Second risk:* STL/3MF file handling edge cases (corrupt files, oversized uploads). Mitigation: server-side validation before storage; size enforcement at API layer.

**Market Risks:**
- *Cold-start problem:* Empty platform repels first visitors. Mitigation: 50-model seed before public launch — non-negotiable pre-launch gate.
- *Creator adoption:* Makers may resist the photo requirement. Mitigation: upload wizard explains the why clearly; photo requirement is the differentiator, not a barrier.

**Resource Risks:**
- Solo developer means any scope expansion directly delays launch. Mitigation: strict V1 boundary enforced — anything not in the MVP list waits for V1.5 regardless of how appealing it seems during build.
