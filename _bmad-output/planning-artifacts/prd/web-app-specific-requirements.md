# Web App Specific Requirements

## Project-Type Overview

3D Hub is a Next.js web application using SSR/SSG for public-facing pages (homepage, model pages, category pages) and client-side rendering for interactive flows (upload wizard, user profile editing). No real-time features in V1. Modern browsers only.

## Browser Matrix

| Browser | Support |
|---------|---------|
| Chrome (latest 2 versions) | ✅ Primary |
| Firefox (latest 2 versions) | ✅ Supported |
| Safari (latest 2 versions) | ✅ Supported |
| Edge (latest 2 versions) | ✅ Supported |
| Internet Explorer | ❌ Not supported |
| Mobile browsers (Chrome/Safari) | ✅ Supported |

## Responsive Design

- Mobile-first layout required — hobbyist users browse from phones
- Model card grid adapts from 1 column (mobile) to 2–4 columns (desktop)
- Upload wizard optimized for desktop (primary upload use case); functional on mobile
- Model page photo gallery responsive; download button prominent on all screen sizes

## Performance Targets

See Non-Functional Requirements → Performance for timing targets. Rendering approach: SSR for public pages ensures fast initial paint; client-side hydration for interactive flows. No performance budget for 3D viewer in V1 (deferred to V1.5).

## SEO Strategy

- Model pages server-rendered with unique `<title>`, `<meta description>`, and Open Graph tags per model
- Category and tag pages server-rendered and crawlable
- Homepage server-rendered with featured/trending model content
- Clean URL structure: `/models/[slug]`, `/categories/[category]`, `/users/[username]`
- Sitemap generated for all public model and category pages
- No SSR required for: upload wizard, draft management, user settings

## Implementation Considerations

- Next.js API routes used for all backend operations (auth, file upload, model CRUD, search)
- Static generation (SSG) for category pages; ISR or SSR for model pages (download count updates)
- Image optimization via Next.js `<Image>` component for printed photos
- File uploads handled server-side via API route — not direct browser-to-disk
