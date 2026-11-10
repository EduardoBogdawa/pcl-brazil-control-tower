/*
# PC&L Team weekly agenda

1. New Tables
- `ct_agenda_items`: recurring weekly topics of the PC&L Team (the whiteboard "Agenda"),
  shown in the Calendário category and in "Resumo do dia" on the overview.
  - `id` (uuid, pk)
  - `weekday` (smallint 1-7; 1 = segunda ... 7 = domingo)
  - `title` (text, 1-80 chars)
  - `position` (integer) - order inside the day
  - `created_at`, `updated_at`, `deleted_at` (null = active)

2. New Data
- Initial items copied from the team's whiteboard, only if the table is empty.

3. Security
- RLS enabled. The app intentionally has no sign-in and the agenda is shared by the team,
  so anon + authenticated may read, add and update items.
- Removing an item sets `deleted_at` (an update), so no DELETE privilege is granted.

4. Notes
1. No existing data is changed or removed.
*/

CREATE TABLE IF NOT EXISTS ct_agenda_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 80),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS ct_agenda_items_weekday_idx ON ct_agenda_items (weekday, position) WHERE deleted_at IS NULL;

ALTER TABLE ct_agenda_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON ct_agenda_items TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_agenda" ON ct_agenda_items;
CREATE POLICY "public_select_agenda" ON ct_agenda_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_agenda" ON ct_agenda_items;
CREATE POLICY "public_insert_agenda" ON ct_agenda_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_agenda" ON ct_agenda_items;
CREATE POLICY "public_update_agenda" ON ct_agenda_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO ct_agenda_items (weekday, title, position)
SELECT v.weekday, v.title, v.position
FROM (VALUES
  (1, 'VOR / OES', 1), (1, 'Embalagem Cliente', 2), (1, 'Ordens Antigas', 3), (1, 'Indiretos', 4),
  (2, 'JNI', 1),
  (3, 'BCDA BYD', 1),
  (4, 'Inv. R', 1), (4, 'MPS', 2),
  (5, 'Sites; Feriados', 1),
  (6, 'Químicos', 1), (6, 'Inv. Exped', 2),
  (7, 'Químicos', 1), (7, 'Inv. Exped', 2)
) AS v(weekday, title, position)
WHERE NOT EXISTS (SELECT 1 FROM ct_agenda_items);