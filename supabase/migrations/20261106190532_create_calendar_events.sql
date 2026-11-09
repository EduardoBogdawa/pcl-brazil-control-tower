/*
# Shared team calendar

1. New Tables
- `ct_events`: events shown in the "Calendário" category, month by month.
  - `id` (uuid, pk)
  - `title` (text, 1-120 chars)
  - `description` (text, up to 2000 chars)
  - `start_date` (date) - first day the event happens
  - `start_time` / `end_time` (time, optional) - empty means all-day
  - `owners` (text[]) - people responsible for the event (at least one)
  - `participants` (text[]) - people taking part
  - `recurrence` ('none' | 'daily' | 'weekly' | 'monthly' | 'yearly')
  - `recurrence_until` (date, optional) - last date a recurring event repeats
  - `color` (text, hex color like #E4002B)
  - `created_at`, `updated_at`, `deleted_at` (null = active)

2. New Data
- Category `Calendário` (section FERRAMENTAS) so it appears in the menu.

3. Security
- RLS enabled. The app intentionally has no sign-in and data is shared by the team,
  so anon + authenticated may read, add and update events.
- "Deleting" sets `deleted_at` (an update), so no DELETE privilege is granted.

4. Notes
1. No existing data is changed or removed.
*/

CREATE TABLE IF NOT EXISTS ct_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  start_date date NOT NULL,
  start_time time,
  end_time time,
  owners text[] NOT NULL DEFAULT '{}' CHECK (cardinality(owners) BETWEEN 1 AND 20),
  participants text[] NOT NULL DEFAULT '{}' CHECK (cardinality(participants) <= 50),
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none','daily','weekly','monthly','yearly')),
  recurrence_until date,
  color text NOT NULL DEFAULT '#E4002B' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time),
  CHECK (recurrence_until IS NULL OR recurrence_until >= start_date)
);

CREATE INDEX IF NOT EXISTS ct_events_start_date_idx ON ct_events (start_date) WHERE deleted_at IS NULL;

ALTER TABLE ct_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON ct_events TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_events" ON ct_events;
CREATE POLICY "public_select_events" ON ct_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_events" ON ct_events;
CREATE POLICY "public_insert_events" ON ct_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_events" ON ct_events;
CREATE POLICY "public_update_events" ON ct_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO ct_categories (name, label, section, description, color, position, show_on_overview)
SELECT 'Calendário', 'Calendário', 'FERRAMENTAS', 'Agenda da equipe com eventos, responsáveis e recorrências.', '#E4002B', 45, true
WHERE NOT EXISTS (SELECT 1 FROM ct_categories WHERE lower(name) = lower('Calendário') AND deleted_at IS NULL);