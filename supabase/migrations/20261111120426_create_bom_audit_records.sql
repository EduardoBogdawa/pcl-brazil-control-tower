/*
# Shared BOM audit history
1. New table
- bom_audit_records records completed audits: id UUID, audit_date date, scope audited plant/item, auditor responsible person, result outcome, notes findings, created_at registration time.
2. Security
- RLS enabled. This no-login control tower intentionally shares records with all visitors. Separate CRUD policies target anon and authenticated; only select, insert and update are granted, so deletion is unavailable.
3. Validation
- Required text lengths and allowed results enforced in the database. No existing data changed.
*/
CREATE TABLE IF NOT EXISTS public.bom_audit_records (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
audit_date date NOT NULL CHECK (audit_date <= CURRENT_DATE),
scope text NOT NULL CHECK (length(trim(scope)) BETWEEN 1 AND 160),
auditor text NOT NULL CHECK (length(trim(auditor)) BETWEEN 1 AND 100),
result text NOT NULL CHECK (result IN ('ok','findings','pending')),
notes text NOT NULL DEFAULT '' CHECK (length(notes)<=2000),
created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bom_audit_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.bom_audit_records TO anon, authenticated;
CREATE INDEX IF NOT EXISTS bom_audit_records_date_idx ON public.bom_audit_records (audit_date DESC);
DROP POLICY IF EXISTS "bom_read" ON public.bom_audit_records;
CREATE POLICY "bom_read" ON public.bom_audit_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "bom_insert" ON public.bom_audit_records;
CREATE POLICY "bom_insert" ON public.bom_audit_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "bom_update" ON public.bom_audit_records;
CREATE POLICY "bom_update" ON public.bom_audit_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "bom_delete" ON public.bom_audit_records;
CREATE POLICY "bom_delete" ON public.bom_audit_records FOR DELETE TO anon, authenticated USING (false);