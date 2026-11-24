/*
# Backfill monthly usage with existing open history

1. Data changes
- `ct_panel_daily`: for each panel, adds the opens that exist only in the all-time counter
  (`ct_panel_stats.open_count` minus what is already in `ct_panel_daily`).
- Those opens are placed in the month of the panel's last open (Brazil time), on the 1st of that month,
  but never earlier than 2026-11-10, the day the all-time counter started.

2. Security
- No changes to tables, policies or grants.

3. Notes
1. Idempotent: re-running adds nothing, since it only fills the missing difference.
2. No user data is stored; counts stay per panel only.
3. On an empty database nothing is inserted.
*/

INSERT INTO ct_panel_daily (panel_id, day, open_count)
SELECT s.panel_id,
  GREATEST(date '2026-11-10', date_trunc('month', s.last_opened_at AT TIME ZONE 'America/Sao_Paulo')::date),
  s.open_count - COALESCE(d.total, 0)
FROM ct_panel_stats s
LEFT JOIN (SELECT panel_id, sum(open_count)::int AS total FROM ct_panel_daily GROUP BY panel_id) d ON d.panel_id = s.panel_id
WHERE s.open_count - COALESCE(d.total, 0) > 0
  AND s.last_opened_at IS NOT NULL
ON CONFLICT (panel_id, day) DO UPDATE SET open_count = ct_panel_daily.open_count + EXCLUDED.open_count;