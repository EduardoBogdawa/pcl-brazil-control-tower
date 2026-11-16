/*
# BOM audit participants and recoverable deletion

## 1. Changes
- Add `participants` to `public.bom_audit_records`: optional participant names, stored as text with a maximum of 600 characters. Existing audits receive an empty value.
- Add `deleted_at`: nullable timestamp used to remove an audit from the active history without destroying its record.

## 2. Security
- Keep existing row-level security, policies and grants unchanged. The shared application already permits updates for anon and authenticated users.
- Exclusion uses an update instead of granting new delete access. The existing physical-delete restriction remains in place.

## 3. Data preservation
- No records are deleted or overwritten by this change.
- Existing audit dates, auditors, findings and creation timestamps remain unchanged.
*/
ALTER TABLE public.bom_audit_records ADD COLUMN IF NOT EXISTS participants text NOT NULL DEFAULT '' CHECK (char_length(participants) <= 600);
ALTER TABLE public.bom_audit_records ADD COLUMN IF NOT EXISTS deleted_at timestamptz;