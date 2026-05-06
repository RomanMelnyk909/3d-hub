CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================
-- Epic 2: Model Upload & Publishing Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  layer_height_mm REAL,
  infill_percent INTEGER,
  supports_required INTEGER,
  filament_type TEXT,
  license TEXT NOT NULL DEFAULT 'free',
  is_published INTEGER NOT NULL DEFAULT 0,
  is_draft INTEGER NOT NULL DEFAULT 1,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  published_at INTEGER
);

CREATE TABLE IF NOT EXISTS model_files (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS model_photos (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  is_predefined INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS model_tags (
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (model_id, tag_id)
);

-- Required indexes (AC #1)
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_is_published ON models(is_published);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);

-- Supporting indexes
CREATE INDEX IF NOT EXISTS idx_model_files_model_id ON model_files(model_id);
CREATE INDEX IF NOT EXISTS idx_model_photos_model_id ON model_photos(model_id);
CREATE INDEX IF NOT EXISTS idx_model_photos_model_display_order ON model_photos(model_id, display_order);
CREATE INDEX IF NOT EXISTS idx_model_tags_model_id ON model_tags(model_id);
CREATE INDEX IF NOT EXISTS idx_model_tags_tag_id ON model_tags(tag_id);

-- ============================================================
-- Category seed (idempotent — INSERT OR IGNORE)
-- ============================================================

INSERT OR IGNORE INTO categories (id, name, slug, created_at) VALUES
  ('cat-001', 'Home & Organization', 'home-organization', 1746403200),
  ('cat-002', 'Workshop & Tools',    'workshop-tools',    1746403200),
  ('cat-003', 'Art & Decoration',    'art-decoration',    1746403200),
  ('cat-004', 'Hobby & Gaming',      'hobby-gaming',      1746403200),
  ('cat-005', 'Electronics & Tech',  'electronics-tech',  1746403200),
  ('cat-006', 'Fashion & Jewelry',   'fashion-jewelry',   1746403200),
  ('cat-007', 'Outdoor & Garden',    'outdoor-garden',    1746403200),
  ('cat-008', 'Toys & Miniatures',   'toys-miniatures',   1746403200),
  ('cat-009', 'Education',           'education',         1746403200),
  ('cat-010', 'Automotive',          'automotive',        1746403200),
  ('cat-011', 'Other',               'other',             1746403200);

-- ============================================================
-- Predefined tag seed (idempotent — INSERT OR IGNORE)
-- ============================================================

INSERT OR IGNORE INTO tags (id, name, is_predefined) VALUES
  ('tag-001', 'functional',   1),
  ('tag-002', 'decorative',   1),
  ('tag-003', 'workshop',     1),
  ('tag-004', 'tools',        1),
  ('tag-005', 'miniature',    1),
  ('tag-006', 'home',         1),
  ('tag-007', 'garden',       1),
  ('tag-008', 'gaming',       1),
  ('tag-009', 'jewelry',      1),
  ('tag-010', 'educational',  1),
  ('tag-011', 'organizer',    1),
  ('tag-012', 'holder',       1),
  ('tag-013', 'mount',        1),
  ('tag-014', 'enclosure',    1),
  ('tag-015', 'no-supports',  1);
