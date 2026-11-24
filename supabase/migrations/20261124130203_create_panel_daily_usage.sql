/*
# Anonymous daily panel usage

1. New Tables
- `ct_panel_daily`: how many times each panel was opened on each day (Brazil time).
  - `panel_id` (text, fk -> ct_panels.id)
  - `day` (date)
  - `open_count` (int, >= 0)
  - Primary key (panel_id, day)
  No user, e-mail or device is stored: usage is measured per panel only, never per person.

2. Modified Functions
- `ct_track_open(p_panel_id text)`: besides the all-time counter in `ct_panel_stats`,
  now also adds one open to today's row in `ct_panel_daily`.

3. New Functions
- `ct_usage_report(p_days int)`: read-only summary for the usage report.
  Returns opens per panel in the last N days and in the N days before (for the trend),
  the total opens per day of the period, and the first day with daily data.
  N is limited to 1-365.

4. Security
- RLS enabled on `ct_panel_daily`; anon + authenticated may only SELECT (shared team data).
- No INSERT/UPDATE/DELETE grants: writes only happen through `ct_track_open` (owner rights),
  so visitors can only add exactly one open to an existing panel.
- `ct_usage_report` runs with the caller's rights and only reads the table above.

5. Notes
1. Daily history starts now; earlier opens remain only in the all-time total.
2. No existing data is changed.
*/

CREATE TABLE IF NOT EXISTS ct_panel_daily (
  panel_id text NOT NULL REFERENCES ct_panels(id),
  day date NOT NULL,
  open_count int NOT NULL DEFAULT 0 CHECK (open_count >= 0),
  PRIMARY KEY (panel_id, day)
);

CREATE INDEX IF NOT EXISTS ct_panel_daily_day_idx ON ct_panel_daily (day);

ALTER TABLE ct_panel_daily ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON ct_panel_daily TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_panel_daily" ON ct_panel_daily;
CREATE POLICY "public_select_panel_daily" ON ct_panel_daily FOR SELECT TO anon, authenticated USING (true);

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
  INSERT INTO ct_panel_daily (panel_id, day, open_count)
  VALUES (p_panel_id, (now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (panel_id, day) DO UPDATE
    SET open_count = ct_panel_daily.open_count + 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION ct_track_open(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ct_track_open(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION ct_usage_report(p_days int)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_days int := LEAST(GREATEST(COALESCE(p_days, 30), 1), 365);
  v_today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  v_start date := v_today - (v_days - 1);
  v_prev date := v_start - v_days;
BEGIN
  RETURN jsonb_build_object(
    'days', v_days,
    'start', v_start,
    'today', v_today,
    'since', (SELECT min(day) FROM ct_panel_daily),
    'panels', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('panel_id', panel_id, 'cur', cur, 'prev', prev))
      FROM (
        SELECT panel_id,
          sum(open_count) FILTER (WHERE day >= v_start)::int AS cur,
          sum(open_count) FILTER (WHERE day < v_start)::int AS prev
        FROM ct_panel_daily
        WHERE day >= v_prev AND day <= v_today
        GROUP BY panel_id
      ) p
    ), '[]'::jsonb),
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('day', day, 'count', total) ORDER BY day)
      FROM (
        SELECT day, sum(open_count)::int AS total
        FROM ct_panel_daily
        WHERE day >= v_start AND day <= v_today
        GROUP BY day
      ) d
    ), '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION ct_usage_report(int) TO anon, authenticated;