/*
# Shared team activities + recoverable deletion

1. New Tables
- `ct_tasks`: team routine activities shown on the overview.
  - `id` (uuid, pk), `name` (text), `owner` (text), `period` ('Semanal' | 'Mensal'), `day` (text), `created_at`, `deleted_at`

2. Modified Tables
- `ct_categories`: add `deleted_at` (timestamptz, null = active).
  The unique rule on `name` now only applies to active categories, so a deleted name can be reused.
- `ct_panels`: add `deleted_at` (timestamptz, null = active).

3. Security
- RLS enabled on `ct_tasks`; open read/add/update for anon + authenticated (the app intentionally has no sign-in).
- "Deleting" sets `deleted_at` (an update), so no DELETE privilege is granted anywhere.
  Removed items stay recoverable by an administrator.

4. Notes
1. No data is removed by this migration.
*/

ALTER TABLE ct_categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE ct_panels ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE ct_categories DROP CONSTRAINT IF EXISTS ct_categories_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS ct_categories_active_name_idx ON ct_categories (lower(name)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ct_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  owner text NOT NULL CHECK (char_length(btrim(owner)) BETWEEN 1 AND 60),
  period text NOT NULL CHECK (period IN ('Semanal','Mensal')),
  day text NOT NULL DEFAULT '' CHECK (char_length(day) <= 60),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE ct_tasks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON ct_tasks TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_tasks" ON ct_tasks;
CREATE POLICY "public_select_tasks" ON ct_tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_tasks" ON ct_tasks;
CREATE POLICY "public_insert_tasks" ON ct_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_tasks" ON ct_tasks;
CREATE POLICY "public_update_tasks" ON ct_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);