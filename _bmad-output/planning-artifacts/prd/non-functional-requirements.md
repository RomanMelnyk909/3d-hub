# Non-Functional Requirements

## Performance

- Homepage initial page load: under 2 seconds on a standard broadband connection
- Model page load: under 2 seconds; printed photos lazy-load below the fold
- File download initiation: under 1 second after the download button is clicked
- Upload wizard step transitions: under 500ms
- File upload: progress indicator displayed for any upload taking longer than 2 seconds
- Printed photo thumbnails on model cards: served at optimized resolution; full-size photos available on model page

## Security

- User passwords stored using bcrypt or equivalent secure one-way hashing — never plain text
- Authentication sessions use secure, httpOnly cookies; no auth tokens in localStorage or sessionStorage
- File uploads validated server-side before writing to disk: file type, file size, and executable rejection enforced at API layer
- No personally identifiable information (email, hashed password) exposed in public API responses or client-accessible URLs
- HTTPS required in all production environments
- NextAuth.js session configuration must follow library security best practices

## Scalability

- V1 is explicitly designed for solo-developer scale: SQLite and local filesystem are the expected storage layer
- No concurrent user targets or uptime SLA defined for V1
- The data model and API layer must be designed with future migration to Postgres + S3-compatible object storage in mind — no SQLite-specific query patterns that cannot be ported
- Migration is triggered by scale, not by a fixed timeline; V1 architecture must not block it

## Reliability

- No formal uptime SLA for V1 — solo-hosted, no 24/7 ops
- Database backup is a manual developer responsibility; required before any schema changes
- File storage backup is a manual developer responsibility; no automated backup in V1
- Application errors must be logged server-side; no silent failures on file upload or download
