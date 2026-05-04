# Domain-Specific Requirements

Community content platform with low regulatory burden. The following constraints apply:

## Compliance & Regulatory

- **Data privacy:** User email addresses and account data are stored. Passwords must be hashed (never plain text). User data must not be exposed in public API responses. A basic privacy policy is required before public launch.
- **User-generated content / copyright:** Users upload files they may or may not own. The upload license consent step (creator confirms original work and free-to-download license) is the primary mitigation. A DMCA takedown path must exist at launch — at minimum, a published contact email for takedown requests. No automated tooling required in V1.
- **No payment processing in V1:** PCI-DSS does not apply. Creator monetization is Future scope.

## Technical Constraints

- **Upload security:** File type validation (STL and 3MF only), size enforcement (25MB per file), rejection of executables. These are non-negotiable at launch.
- **Authentication:** NextAuth.js with email/password. Sessions must be handled securely; no sensitive data in client-accessible storage.

## Risk Mitigations

- **Malicious file uploads:** Enforced at file type and size level in V1. Content scanning (virus/malware) is not in V1 scope but noted as a future hardening item.
- **Copyright infringement:** License consent at upload + DMCA contact path. Manual takedown via direct database operation in V1.
- **Data loss:** Local SQLite + filesystem in V1 — no automated backup. Solo dev is responsible for manual backup before any schema changes.
