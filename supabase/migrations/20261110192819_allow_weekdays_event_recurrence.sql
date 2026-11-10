/*
# Allow "weekdays" recurrence on calendar events

1. Modified Tables
- `ct_events`
  - `recurrence` now also accepts 'weekdays' (repeats Monday to Friday, skipping weekends).
2. Security
- No change to RLS, policies or grants.
3. Notes
1. Only the allowed-values rule is replaced; existing rows and values are untouched.
*/

ALTER TABLE ct_events DROP CONSTRAINT IF EXISTS ct_events_recurrence_check;
ALTER TABLE ct_events ADD CONSTRAINT ct_events_recurrence_check
  CHECK (recurrence IN ('none','daily','weekdays','weekly','monthly','yearly'));