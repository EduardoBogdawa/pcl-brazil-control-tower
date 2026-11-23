/*
# Panel attachments storage

1. What this does
- Creates a file storage area `panel-attachments` where the team can attach documents
  (PowerPoint, PDF, Word, Excel, images) to a panel's instruction.
- Each panel keeps the list of its attachments in its own panel data; files live here.

2. Bucket settings
- Public read: anyone who opens the Control Tower can download an attached file via its link
  (requested by the owner: "qualquer um que acessar possa abrir").
- Size limit: 25 MB per file.
- Only office documents, PDF, plain text/CSV and common images are accepted; the server rejects anything else.

3. Security
- anon + authenticated may only INSERT new files into this bucket (the app has no database sign-in).
- No SELECT policy: files cannot be listed through the API; they are opened only via their link.
- No UPDATE/DELETE policy: files cannot be overwritten or deleted. Removing an attachment in the app
  only unlinks it from the panel, so it stays recoverable.

4. Notes
1. No existing data is changed.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'panel-attachments', 'panel-attachments', true, 26214400,
  ARRAY[
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "panel_attachments_insert" ON storage.objects;
CREATE POLICY "panel_attachments_insert" ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'panel-attachments');