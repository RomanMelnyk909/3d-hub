# Epic 2: Model Upload & Publishing

Creators can upload 3D model files with printed photos and print metadata through a guided 5-step wizard, and publish to the platform.

## Story 2.1: Model Database Schema & Repository Layer

As a developer,
I want the model-related database tables created and a typed repository layer in place,
So that uploaded model data can be stored and retrieved by the upload wizard stories.

**Acceptance Criteria:**

**Given** `lib/db/schema.sql` already contains the `users` table from Story 1.2
**When** the schema migration is applied
**Then** the following tables exist: `models`, `model_files`, `model_photos`, `tags`, `model_tags`, `categories`
**And** the `models` table includes: `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id)`, `title TEXT NOT NULL`, `description TEXT`, `layer_height_mm REAL`, `infill_percent INTEGER`, `supports_required INTEGER`, `filament_type TEXT`, `license TEXT NOT NULL DEFAULT 'free'`, `is_published INTEGER NOT NULL DEFAULT 0`, `is_draft INTEGER NOT NULL DEFAULT 1`, `download_count INTEGER NOT NULL DEFAULT 0`, `created_at INTEGER NOT NULL`, `published_at INTEGER`
**And** `model_files` includes: `id`, `model_id` (FK), `filename`, `file_size_bytes`, `original_name`, `created_at`
**And** `model_photos` includes: `id`, `model_id` (FK), `filename`, `alt_text`, `display_order`, `created_at`
**And** `categories` is seeded with the platform's predefined category list
**And** `tags` and `model_tags` support the hybrid tag system (predefined + custom)
**And** indexes exist on `models.user_id`, `models.is_published`, `models.created_at`

**Given** the schema is applied
**When** `lib/db/models.ts` is implemented
**Then** it exports: `createDraftModel(userId, data): DraftModel`, `updateDraftModel(id, data): Model`, `publishModel(id): Model`, `getModelById(id): Model | null`, `listModelsByUser(userId): Model[]`
**And** `types/model.ts` defines `Model`, `DraftModel`, `ModelFile`, `ModelPhoto`, `PrintMetadata` types with camelCase fields

---

## Story 2.2: File & Photo Upload APIs + Storage Abstraction

As a creator,
I want my STL/3MF model files and printed photos uploaded securely to the server,
So that my model assets are safely stored and ready to attach to a listing.

**Acceptance Criteria:**

**Given** `lib/storage/index.ts` is implemented
**When** a file is saved
**Then** it is written to `UPLOAD_DIR/models/[modelId]/files/[filename]` or `.../photos/[filename]` using only relative paths stored in the DB
**And** `lib/storage/index.ts` is the only module that uses `node:fs` — no direct filesystem access elsewhere
**And** `next.config.ts` is configured so locally-served photos are accessible (using `unoptimized` or a custom loader)

**Given** `POST /api/upload/files` is called with a multipart file
**When** busboy parses the stream
**Then** the file extension AND magic bytes are checked — only STL and 3MF are accepted
**And** any file exceeding 25MB is rejected before being written to disk, returning `{ "error": "File exceeds the 25MB limit", "code": "FILE_TOO_LARGE" }` with HTTP 413
**And** any file whose magic bytes match executable formats is rejected with `{ "error": "Executable files are not permitted", "code": "INVALID_FILE_TYPE" }` with HTTP 422
**And** a valid file is written to a temp directory and returns `{ fileId, filename, size }` with HTTP 200
**And** every error in the route handler catch block is logged with `console.error` before returning the response

**Given** `POST /api/upload/photos` is called with a multipart image file
**When** the upload is processed
**Then** the file is validated for image MIME type and written to the photos temp directory
**And** the response returns `{ photoId, filename, previewUrl }` with HTTP 200

**Given** `lib/constants.ts` is created
**When** it is imported
**Then** it exports `MAX_FILE_SIZE_BYTES = 26214400` (25MB), `ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']`, `PAGE_SIZE = 24`

---

## Story 2.3: Upload Wizard Shell & Steps 1–2 (Files & Photos)

As a creator,
I want to open a guided upload wizard and complete the file and photo upload steps,
So that I have my model files and printed photos attached before filling in metadata.

**Acceptance Criteria:**

**Given** I am authenticated and click "Upload" in the Navbar
**When** I navigate to `/upload`
**Then** the `UploadWizard` opens at Step 1 (Files)
**And** the `WizardStepIndicator` shows 5 steps — Step 1 active (sage green), Steps 2–5 upcoming (gray)
**And** `aria-current="step"` is set on the active step indicator

**Given** I am on Step 1 (Files)
**When** I drag and drop a valid STL or 3MF file onto the `FileUploadZone`
**Then** the zone shows a drag-over state (sage green border, mint fill)
**And** after drop, a per-file upload progress bar appears while `POST /api/upload/files` runs
**And** on success, a checkmark and filename appear in the file list with a remove × button
**And** I can add multiple files; the "Continue" button enables when at least one file is uploaded

**Given** a dropped file is invalid (wrong type or over 25MB)
**When** the file is dropped
**Then** a specific inline error appears for that file: e.g., "Only STL and 3MF files are accepted" or "File exceeds the 25MB limit"
**And** the invalid file is not added to the list
**And** other valid files in the same drop are accepted normally

**Given** I click "Continue" from Step 1
**When** I move to Step 2 (Photos)
**Then** the `WizardStepIndicator` updates — Step 1 shows a checkmark (completed), Step 2 is active
**And** the `PhotoUploadZone` shows copy "Show off your printed result" with an explanation of the photo requirement
**And** the "Continue" button is disabled with a visible reason: "At least 1 photo required"

**Given** I upload at least one photo in Step 2
**When** the photo upload to `POST /api/upload/photos` completes
**Then** a thumbnail preview appears with a remove × button
**And** the "Continue" button enables

**Given** I navigate Back from any step
**When** I return to a previous step
**Then** all previously entered data (uploaded files, photos) is preserved via the Zustand `wizardStore`

---

## Story 2.4: Upload Wizard Steps 3–5 (Metadata, Tags, Preview, Publish)

As a creator,
I want to fill in my model's metadata and tags, preview the listing, consent to the license, and publish — or save as a draft to finish later,
So that my model goes live with complete, accurate information.

**Acceptance Criteria:**

**Given** I advance to Step 3 (Details)
**When** the `ModelMetadataForm` renders
**Then** visible labeled fields appear for: Title (required), Description (required), Layer Height in mm (required), Infill % (required), Supports Required (required, Yes/No select), Filament Type (required, select dropdown)
**And** helper text appears below relevant fields (e.g., "Layer height in mm, e.g. 0.2")
**And** "Continue" is disabled until all required fields are filled

**Given** I advance to Step 4 (Tags)
**When** the `TagSelector` renders
**Then** predefined category chip buttons are shown — clicking toggles them (sage green fill = selected, `role="checkbox"`)
**And** a custom tag text input allows me to type and press Enter to add a tag chip
**And** each added custom tag appears as a removable chip with a × button
**And** screen readers announce each added custom tag

**Given** I advance to Step 5 (Preview & Publish)
**When** the `PublishPreview` renders
**Then** I see a live preview of how my model card will appear in the grid
**And** I see a preview of the full model page with photos, metadata, and tags
**And** a license consent checkbox is shown with text: "I confirm this is my original work and grant free-to-download rights"
**And** "Publish" is disabled until the checkbox is checked

**Given** I check the license consent and click "Publish"
**When** `POST /api/models/[id]/publish` is called
**Then** the model's `is_published` is set to `1` and `is_draft` to `0` in the database
**And** I am redirected to the live model page at `/models/[id]`
**And** a success toast appears: "Your model is live!"

**Given** I click "Save Draft" at any step
**When** the draft save action runs
**Then** all current wizard state is persisted to `POST /api/models` (create) or `PATCH /api/models/[id]` (update)
**And** a quiet toast appears: "Draft saved"
**And** if I later return to `/upload` and have an existing draft, I am offered to resume it

**Given** a publish API call fails
**When** the error response is received
**Then** a system-level error toast appears with the specific message from the API response
**And** I remain on Step 5 — I am not sent back to Step 1

---
