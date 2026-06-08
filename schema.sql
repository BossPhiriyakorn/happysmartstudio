-- =============================================================================
-- Architecture TMV — Platform database schema (SQLite / Cloudflare D1)
-- =============================================================================
-- Run once per database:
--   Local file:  sqlite3 ./data/production.sqlite < schema.sql
--   Cloudflare:  wrangler d1 execute <DB_NAME> --remote --file=./schema.sql
--
-- Conventions:
--   - TEXT primary keys (app-generated: room_*, kw_*, team_*, img_*)
--   - Timestamps ISO-8601 UTC in TEXT columns
--   - JSON in TEXT only where noted (hotspots are normalized; prefer columns)
--   - Single-tenant default site_id = 'default' (multi-site ready)
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- Schema version tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  applied_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO schema_migrations (version, name)
VALUES (1, 'initial_platform_schema');

-- -----------------------------------------------------------------------------
-- Sites (tenant root — one row per deployed studio instance)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  default_locale  TEXT NOT NULL DEFAULT 'th',
  is_published    INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO sites (id, slug, display_name)
VALUES ('default', 'default', 'HappySmart Studio');

-- -----------------------------------------------------------------------------
-- Branding / hero copy (maps to AppContext Branding)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_branding (
  site_id              TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  home_label           TEXT NOT NULL DEFAULT '',
  icon_mode            TEXT NOT NULL DEFAULT 'text',
  logo_url             TEXT NOT NULL DEFAULT '',
  short_name           TEXT NOT NULL,
  intro_kicker         TEXT NOT NULL DEFAULT '',
  intro_title          TEXT NOT NULL DEFAULT '',
  hero_title           TEXT NOT NULL DEFAULT '',
  hero_description     TEXT NOT NULL DEFAULT '',
  studio_badge         TEXT NOT NULL DEFAULT '',
  feed_section_title   TEXT NOT NULL DEFAULT '',
  team_section_title   TEXT NOT NULL DEFAULT '',
  team_section_description TEXT NOT NULL DEFAULT '',
  hq_address_line1     TEXT NOT NULL DEFAULT '',
  hq_address_line2     TEXT NOT NULL DEFAULT '',
  hq_address_map_url   TEXT NOT NULL DEFAULT '',
  hq_address2_enabled  INTEGER NOT NULL DEFAULT 0 CHECK (hq_address2_enabled IN (0, 1)),
  hq_address2_line1    TEXT NOT NULL DEFAULT '',
  hq_address2_line2    TEXT NOT NULL DEFAULT '',
  hq_address2_map_url  TEXT NOT NULL DEFAULT '',
  footer_title         TEXT NOT NULL DEFAULT '',
  footer_description   TEXT NOT NULL DEFAULT '',
  contact_hero_title   TEXT NOT NULL DEFAULT '',
  contact_hero_desc    TEXT NOT NULL DEFAULT '',
  contact_channels_title TEXT NOT NULL DEFAULT '',
  contact_channels_desc  TEXT NOT NULL DEFAULT '',
  contact_no_channels  TEXT NOT NULL DEFAULT '',
  contact_hq_label     TEXT NOT NULL DEFAULT '',
  contact_hours_title  TEXT NOT NULL DEFAULT '',
  contact_hours_desc   TEXT NOT NULL DEFAULT '',
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO site_branding (
  site_id, name, home_label, short_name, intro_kicker, intro_title,
  hero_title, hero_description, studio_badge,
  feed_section_title, team_section_title, team_section_description,
  hq_address_line1, hq_address_line2,
  footer_title, footer_description,
  contact_hero_title, contact_hero_desc,
  contact_channels_title, contact_channels_desc, contact_no_channels,
  contact_hq_label, contact_hours_title, contact_hours_desc
) VALUES (
  'default',
  'HappySmart Studio',
  'หน้าแรก',
  'HS.',
  'Architecture Studio',
  'HappySmart Studio',
  'ค้นพบ\nพื้นที่ที่\nใช่สำหรับคุณ',
  'ผสานรูปแบบ หน้าที่ และความเรียบง่ายในแบบโมเดิร์น',
  'สตูดิโอ 2026',
  'แรงบันดาลใจประจำวัน',
  'ทีมงาน',
  'ทีมดีไซน์และสถาปนิกที่พร้อมดูแลโปรเจกต์ของคุณ',
  '128 Design Avenue',
  'Creative District, BKK 10110',
  'สร้างอนาคต\nออกแบบปัจจุบัน',
  'สตูดิโอสถาปัตยกรรมชั้นนำด้านคอนเซ็ปต์โมเดิร์น ลอฟท์ และมินิมอล',
  'มาร่วมสร้าง\nไปด้วยกัน',
  'เริ่มการปรึกษาหรือทักทายเรา ทีมดีไซน์พร้อมรับฟัง',
  'ช่องทางติดต่อ',
  'เลือกช่องทางที่สะดวก — กดปุ่มด้านล่างเพื่อติดต่อเรา',
  'ยังไม่ได้ตั้งค่าช่องทางติดต่อ',
  'ที่อยู่',
  'เวลาให้คำปรึกษา',
  'จันทร์–ศุกร์: 9:00 – 18:00\nเสาร์ (นัดหมาย): 10:00 – 16:00'
);

-- -----------------------------------------------------------------------------
-- Style pages (portfolio categories / [slug] routes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS style_pages (
  id            TEXT NOT NULL,
  site_id       TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_visible    INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id)
);

CREATE INDEX IF NOT EXISTS idx_style_pages_site_sort
  ON style_pages (site_id, sort_order);

-- style_pages: ไม่ seed — สร้างเมนูจาก /edit ได้

-- -----------------------------------------------------------------------------
-- Navigation menu links
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_links (
  id            TEXT PRIMARY KEY,
  site_id       TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  href          TEXT NOT NULL,
  page_id       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_external   INTEGER NOT NULL DEFAULT 0 CHECK (is_external IN (0, 1)),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (site_id, page_id) REFERENCES style_pages(site_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_links_site_sort
  ON menu_links (site_id, sort_order);

-- -----------------------------------------------------------------------------
-- Search / filter keywords (master list)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS keywords (
  id            TEXT NOT NULL,
  site_id       TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id),
  UNIQUE (site_id, name)
);

CREATE INDEX IF NOT EXISTS idx_keywords_site_name
  ON keywords (site_id, name);

-- keywords: ไม่ seed — เพิ่มจาก /edit ได้

-- -----------------------------------------------------------------------------
-- Portfolio rooms / project cards
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id              TEXT NOT NULL,
  site_id         TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id         TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price           TEXT NOT NULL DEFAULT '',
  legacy_image_url TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  featured_rank   INTEGER CHECK (featured_rank IS NULL OR (featured_rank >= 1 AND featured_rank <= 3)),
  is_published    INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id),
  FOREIGN KEY (site_id, page_id) REFERENCES style_pages(site_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_rooms_site_page
  ON rooms (site_id, page_id, sort_order);

-- Room ↔ keyword tags (stores display names as in app — sync on keyword rename)
CREATE TABLE IF NOT EXISTS room_keyword_tags (
  site_id       TEXT NOT NULL,
  room_id       TEXT NOT NULL,
  keyword_name  TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (site_id, room_id, keyword_name),
  FOREIGN KEY (site_id, room_id) REFERENCES rooms(site_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_keyword_tags_name
  ON room_keyword_tags (site_id, keyword_name);

-- -----------------------------------------------------------------------------
-- Media assets registry (Cloudflare R2 object metadata)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_assets (
  id                TEXT PRIMARY KEY,
  site_id           TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  r2_bucket         TEXT NOT NULL,
  r2_key            TEXT NOT NULL,
  public_url        TEXT NOT NULL,
  mime_type         TEXT NOT NULL DEFAULT 'image/jpeg',
  size_bytes        INTEGER,
  width_px          INTEGER,
  height_px         INTEGER,
  original_filename TEXT,
  alt_text          TEXT,
  entity_type       TEXT,
  entity_id         TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (site_id, r2_key)
);

CREATE INDEX IF NOT EXISTS idx_media_assets_site_entity
  ON media_assets (site_id, entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- Portfolio images per room (crop ratio + R2 reference)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_images (
  id              TEXT NOT NULL,
  site_id         TEXT NOT NULL,
  room_id         TEXT NOT NULL,
  url             TEXT NOT NULL DEFAULT '',
  r2_key          TEXT,
  media_id        TEXT,
  aspect_ratio    TEXT NOT NULL DEFAULT '4:3'
    CHECK (aspect_ratio IN ('1:1', '4:3', '16:9', '9:16', '3:4')),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id),
  FOREIGN KEY (site_id, room_id) REFERENCES rooms(site_id, id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_portfolio_images_room
  ON portfolio_images (site_id, room_id, sort_order);

-- -----------------------------------------------------------------------------
-- Product hotspots on portfolio images
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS image_hotspots (
  id              TEXT NOT NULL,
  site_id         TEXT NOT NULL,
  portfolio_image_id TEXT NOT NULL,
  x_percent       REAL NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent       REAL NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  name            TEXT NOT NULL,
  description     TEXT,
  price           TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id),
  FOREIGN KEY (site_id, portfolio_image_id)
    REFERENCES portfolio_images(site_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_image_hotspots_image
  ON image_hotspots (site_id, portfolio_image_id, sort_order);

-- -----------------------------------------------------------------------------
-- Home page carousel slides
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_slides (
  id              TEXT NOT NULL,
  site_id         TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL DEFAULT '',
  r2_key          TEXT,
  media_id        TEXT,
  title           TEXT NOT NULL DEFAULT '',
  page_id         TEXT NOT NULL,
  aspect_ratio    TEXT DEFAULT '4:3'
    CHECK (aspect_ratio IS NULL OR aspect_ratio IN ('1:1', '4:3', '16:9', '9:16', '3:4')),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_visible      INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id),
  FOREIGN KEY (site_id, page_id) REFERENCES style_pages(site_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_home_slides_site_sort
  ON home_slides (site_id, sort_order);

-- -----------------------------------------------------------------------------
-- Team members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id              TEXT NOT NULL,
  site_id         TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT '',
  image_url       TEXT NOT NULL DEFAULT '',
  r2_key          TEXT,
  media_id        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_visible      INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_site_sort
  ON team_members (site_id, sort_order);

-- -----------------------------------------------------------------------------
-- Contact settings (multi-channel)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_settings (
  site_id       TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'ติดต่อ',
  line_url      TEXT,
  phone         TEXT,
  email         TEXT,
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- contact_settings: ไม่ seed — ป้ายปุ่ม «ติดต่อ» ใช้ค่า hardcode ในแอป (DEFAULT_CONTACT_LABEL)
-- ช่องทาง line/phone/email ตั้งจาก /edit แล้วบันทึกครั้งแรก

-- -----------------------------------------------------------------------------
-- Optional key-value settings (feature flags, analytics ids, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  site_id     TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (site_id, key)
);

-- -----------------------------------------------------------------------------
-- Audit log (optional — content changes in production)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_audit_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id       TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  actor         TEXT,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT,
  payload_json  TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_site_time
  ON content_audit_log (site_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- Site analytics (page views & portfolio card opens)
-- Append-only event log for the /edit Analytics dashboard.
-- Labels are denormalized at record time so stats survive renames/deletes.
-- Maps to lib/analytics/types.ts: page_view | card_view
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id         TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL CHECK (event_type IN ('page_view', 'card_view')),
  path            TEXT,
  path_label      TEXT,
  room_id         TEXT,
  room_name       TEXT,
  page_id         TEXT,
  page_label      TEXT,
  occurred_at     TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (
    (event_type = 'page_view'
      AND path IS NOT NULL AND path_label IS NOT NULL
      AND room_id IS NULL AND room_name IS NULL AND page_id IS NULL AND page_label IS NULL)
    OR
    (event_type = 'card_view'
      AND path IS NULL AND path_label IS NULL
      AND room_id IS NOT NULL AND room_name IS NOT NULL
      AND page_id IS NOT NULL AND page_label IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_time
  ON analytics_events (site_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_type_path
  ON analytics_events (site_id, event_type, path)
  WHERE event_type = 'page_view';

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_type_room
  ON analytics_events (site_id, event_type, room_id)
  WHERE event_type = 'card_view';

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_type_page
  ON analytics_events (site_id, event_type, page_id)
  WHERE event_type = 'card_view';

-- Roll-up views for dashboard queries (optional — app may aggregate in SQL)
CREATE VIEW IF NOT EXISTS v_analytics_totals AS
SELECT
  site_id,
  SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS total_page_views,
  SUM(CASE WHEN event_type = 'card_view' THEN 1 ELSE 0 END) AS total_card_views,
  MAX(occurred_at) AS last_event_at
FROM analytics_events
GROUP BY site_id;

CREATE VIEW IF NOT EXISTS v_analytics_page_view_counts AS
SELECT
  site_id,
  path,
  path_label AS label,
  COUNT(*) AS view_count
FROM analytics_events
WHERE event_type = 'page_view'
GROUP BY site_id, path, path_label;

CREATE VIEW IF NOT EXISTS v_analytics_card_view_counts AS
SELECT
  site_id,
  room_id,
  room_name,
  page_id,
  page_label,
  COUNT(*) AS view_count
FROM analytics_events
WHERE event_type = 'card_view'
GROUP BY site_id, room_id, room_name, page_id, page_label;

INSERT OR IGNORE INTO schema_migrations (version, name)
VALUES (2, 'analytics_events');

-- Migration 3: branding icon mode + logo URL (existing databases)
ALTER TABLE site_branding ADD COLUMN icon_mode TEXT NOT NULL DEFAULT 'text';
ALTER TABLE site_branding ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';

INSERT OR IGNORE INTO schema_migrations (version, name)
VALUES (3, 'branding_icon_fields');

-- Migration 4: studio addresses with map links + optional second address
ALTER TABLE site_branding ADD COLUMN hq_address_map_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_branding ADD COLUMN hq_address2_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE site_branding ADD COLUMN hq_address2_line1 TEXT NOT NULL DEFAULT '';
ALTER TABLE site_branding ADD COLUMN hq_address2_line2 TEXT NOT NULL DEFAULT '';
ALTER TABLE site_branding ADD COLUMN hq_address2_map_url TEXT NOT NULL DEFAULT '';

INSERT OR IGNORE INTO schema_migrations (version, name)
VALUES (4, 'studio_address_map_links');

-- -----------------------------------------------------------------------------
-- Triggers: bump parent updated_at
-- -----------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_sites_updated_at
AFTER UPDATE ON sites
BEGIN
  UPDATE sites SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_site_branding_updated_at
AFTER UPDATE ON site_branding
BEGIN
  UPDATE site_branding SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE site_id = NEW.site_id;
END;
