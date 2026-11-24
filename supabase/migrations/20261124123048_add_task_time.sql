/*
# Add optional time to team board activities

1. Modified Tables
- `ct_tasks`
  - `time` (text, nullable): start time of the activity in 24h "HH:MM" format, e.g. "09:30".
    Empty (null) when the activity has no fixed time.

2. Security
- No policy changes. Existing anon/authenticated SELECT, INSERT and UPDATE grants already cover
  the new column, so the board can read and save it.

3. Notes
1. Existing activities are kept unchanged and simply have no time set.
2. A check constraint guarantees only valid 00:00-23:59 values are stored.
*/

ALTER TABLE ct_tasks ADD COLUMN IF NOT EXISTS time text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ct_tasks_time_format') THEN
    ALTER TABLE ct_tasks ADD CONSTRAINT ct_tasks_time_format
      CHECK (time IS NULL OR time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
  END IF;
END $$;