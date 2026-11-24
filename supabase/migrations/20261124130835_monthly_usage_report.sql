/*
# Monthly usage report

1. New Functions
- `ct_usage_report_monthly(p_months int)`: read-only summary grouped by calendar month (Brazil time).
  The period is the last N calendar months including the current one (N limited to 1-24).
  Returns opens per panel in the period and in the N months before (for the trend),
  total opens per month of the period, and the first day with recorded data.

2. Removed Functions
- `ct_usage_report(int)`: the old per-day report, replaced by the monthly one. No data involved.

3. Security
- Runs with the caller's rights and only reads `ct_panel_daily` (already readable by anon + authenticated).

4. Notes
1. Opens are still stored per day in `ct_panel_daily`; only the report grouping changes.
2. No table or row is changed.
*/

CREATE OR REPLACE FUNCTION ct_usage_report_monthly(p_months int)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_months int := LEAST(GREATEST(COALESCE(p_months, 1), 1), 24);
  v_today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  v_cur_month date := date_trunc('month', v_today)::date;
  v_start date := (v_cur_month - make_interval(months => v_months - 1))::date;
  v_prev date := (v_start - make_interval(months => v_months))::date;
BEGIN
  RETURN jsonb_build_object(
    'months', v_months,
    'start', v_start,
    'today', v_today,
    'since', (SELECT min(day) FROM ct_panel_daily),
    'panels', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('panel_id', panel_id, 'cur', cur, 'prev', prev))
      FROM (
        SELECT panel_id,
          COALESCE(sum(open_count) FILTER (WHERE day >= v_start), 0)::int AS cur,
          COALESCE(sum(open_count) FILTER (WHERE day < v_start), 0)::int AS prev
        FROM ct_panel_daily
        WHERE day >= v_prev AND day <= v_today
        GROUP BY panel_id
      ) p
    ), '[]'::jsonb),
    'monthly', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('month', month, 'count', total) ORDER BY month)
      FROM (
        SELECT date_trunc('month', day)::date AS month, sum(open_count)::int AS total
        FROM ct_panel_daily
        WHERE day >= v_start AND day <= v_today
        GROUP BY 1
      ) m
    ), '[]'::jsonb)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION ct_usage_report_monthly(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ct_usage_report_monthly(int) TO anon, authenticated;

DROP FUNCTION IF EXISTS ct_usage_report(int);