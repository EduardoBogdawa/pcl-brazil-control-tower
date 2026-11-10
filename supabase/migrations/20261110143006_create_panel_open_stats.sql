/*
# Shared "most used panels" counter

1. New Tables
- `ct_panel_stats`: how many times each panel was opened by anyone using the Control Tower.
  - `panel_id` (text, pk) - id of the panel in `ct_panels`
  - `open_count` (int) - total opens
  - `last_opened_at` (timestamptz)

2. New Functions
- `ct_track_open(p_panel_id text)`: adds exactly one open to a panel that exists and is not deleted.
  Runs with owner rights so visitors can only increment by one; they cannot write arbitrary numbers.

3. Security
- RLS enabled on `ct_panel_stats`.
- anon + authenticated may only SELECT (the app has no sign-in and the ranking is shared).
- No INSERT/UPDATE/DELETE grants: all writes go through `ct_track_open`.

4. Notes
1. No existing data is changed.
*/

CREATE TABLE IF NOT EXISTS ct_panel_stats (
  panel_id text PRIMARY KEY REFERENCES ct_panels(id),
  open_count int NOT NULL DEFAULT 0 CHECK (open_count >= 0),
  last_opened_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ct_panel_stats ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON ct_panel_stats TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_panel_stats" ON ct_panel_stats;
CREATE POLICY "public_select_panel_stats" ON ct_panel_stats FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION ct_track_open(p_panel_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ct_panels WHERE id = p_panel_id AND deleted_at IS NULL) THEN
    RETURN;
  END IF;
  INSERT INTO ct_panel_stats (panel_id, open_count, last_opened_at)
  VALUES (p_panel_id, 1, now())
  ON CONFLICT (panel_id) DO UPDATE
    SET open_count = ct_panel_stats.open_count + 1, last_opened_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION ct_track_open(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ct_track_open(text) TO anon, authenticated;