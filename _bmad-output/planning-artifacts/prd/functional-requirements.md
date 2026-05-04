# Functional Requirements

## User Account Management

- **FR1:** Visitors can register for an account using email and password
- **FR2:** Registered users can log in with their email and password
- **FR3:** Authenticated users can log out
- **FR4:** The system maintains authenticated sessions across page navigation

## Model Upload & Publishing

- **FR5:** Authenticated users can initiate a new model listing via a guided multi-step upload wizard
- **FR6:** Creators can upload one or more STL or 3MF model files per listing
- **FR7:** Creators can upload one or more real-world printed photos per listing
- **FR8:** The system requires at least one printed photo before a model can be published
- **FR9:** Creators can enter a title, description, and structured print metadata (layer height, infill %, support requirements, filament type) per listing
- **FR10:** Creators can assign predefined platform tags and unlimited custom tags to a listing
- **FR11:** Creators can preview how their model listing will appear before publishing
- **FR12:** Creators can save an in-progress upload as a draft and resume it later
- **FR13:** Creators must confirm a license declaration (free-to-download, original work) before publishing
- **FR14:** After publishing, creators are redirected to the live model page
- **FR15:** The system enforces a maximum file size limit of 25MB per uploaded file

## Model Discovery & Search

- **FR16:** Visitors can browse a paginated grid of published model cards on the homepage
- **FR17:** The homepage displays a featured/trending section of models
- **FR18:** Visitors can navigate models by category
- **FR19:** Visitors can search models by name, tag, category, or uploader
- **FR20:** Search results default to sorting by download count
- **FR21:** Visitors can filter search results by category
- **FR22:** A persistent search input is accessible from all pages

## Model Consumption

- **FR23:** Visitors can view a model page showing printed photos, description, and print metadata
- **FR24:** Authenticated users can download model files in one click
- **FR25:** Unauthenticated visitors are prompted to register before downloading
- **FR26:** The system records a download count increment for each completed download

## Creator Portfolio & User Profile

- **FR27:** Each registered user has a public profile page displaying their published models
- **FR28:** Authenticated users can view their private download history
- **FR29:** Non-uploading users see a contextual prompt encouraging them to upload a model

## Platform Safety & Trust

- **FR30:** The system accepts only STL and 3MF file formats for model uploads
- **FR31:** The system rejects uploaded files exceeding the per-file size limit
- **FR32:** The system rejects files with executable characteristics regardless of extension
- **FR33:** A published DMCA takedown contact path is accessible to all users
- **FR34:** User passwords are stored using secure hashing — never plain text

## Content Presentation & SEO

- **FR35:** Each model page has unique title, meta description, and Open Graph tags
- **FR36:** Category and tag pages are server-rendered and indexable by search engines
- **FR37:** A sitemap is generated covering all public model and category pages
- **FR38:** Model card thumbnails display a real printed photo
- **FR39:** The platform layout is responsive and usable on mobile browsers
- **FR40:** The homepage grid contains at least 50 seeded models at public launch

## Bookmarks & Collection

- **FR41:** Registered users can bookmark a model to their Library without downloading it; unauthenticated visitors who attempt to bookmark are prompted to register
- **FR42:** The model card grid layout is consistent across homepage, category pages, search results, and user profile pages
