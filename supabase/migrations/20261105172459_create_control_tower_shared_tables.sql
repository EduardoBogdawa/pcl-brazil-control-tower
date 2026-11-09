/*
# Shared storage for the Control Tower

1. New Tables
- `ct_categories`: navigation categories shown in the sidebar.
  - `id` (uuid, pk)
  - `name` (text, unique) - key used to group panels (e.g. "CM")
  - `label` (text) - text shown in the sidebar (e.g. "Packaging / SPI")
  - `section` (text) - sidebar group heading (e.g. "FERRAMENTAS"), may be empty
  - `description` (text) - shown on the overview card
  - `color` (text) - hex accent color
  - `position` (int) - ordering
  - `show_on_overview` (bool)
  - `created_at`
- `ct_panels`: every panel/link card.
  - `id` (text, pk) - stable panel id
  - `category` (text) - category name
  - `data` (jsonb) - full panel record (name, desc, url, status, instruction, links...)
  - `created_at`, `updated_at`

2. Security
- RLS enabled on both tables.
- The app has no sign-in and the owner asked for it to be open: anyone can read, add and edit.
  No DELETE grant or policy, since the app has no delete action.
- Check constraints limit field sizes to reduce abuse.
*/

CREATE TABLE IF NOT EXISTS ct_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 40),
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 40),
  section text NOT NULL DEFAULT '' CHECK (char_length(section) <= 40),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 140),
  color text NOT NULL DEFAULT '#34383d' CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  position int NOT NULL DEFAULT 0,
  show_on_overview boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ct_panels (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 1 AND 100),
  category text NOT NULL CHECK (char_length(category) BETWEEN 1 AND 40),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object' AND pg_column_size(data) <= 100000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ct_panels_category_idx ON ct_panels (category);

ALTER TABLE ct_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_panels ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON ct_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON ct_panels TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_categories" ON ct_categories;
CREATE POLICY "public_select_categories" ON ct_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_categories" ON ct_categories;
CREATE POLICY "public_insert_categories" ON ct_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_categories" ON ct_categories;
CREATE POLICY "public_update_categories" ON ct_categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_panels" ON ct_panels;
CREATE POLICY "public_select_panels" ON ct_panels FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_panels" ON ct_panels;
CREATE POLICY "public_insert_panels" ON ct_panels FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_panels" ON ct_panels;
CREATE POLICY "public_update_panels" ON ct_panels FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);