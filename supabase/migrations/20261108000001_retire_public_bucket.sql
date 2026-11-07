-- ==============================================================================
-- Retire the legacy PUBLIC bucket (site-media).
--
-- Run this ONLY AFTER `scripts/migrate_media.mjs --apply` has moved every photo
-- into the private bucket and a fresh dry run reports "Would migrate 0 file(s)".
--
-- Afterwards the old /storage/v1/object/public/site-media/... URLs stop working
-- (they return an error instead of the photo). The files stay in the bucket as a
-- backup, readable only with the service role. Idempotent: safe to run again.
-- ==============================================================================

UPDATE storage.buckets SET public = false WHERE id = 'site-media';

-- No anonymous or signed-in access to its files (also done by the lockdown migration)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;
