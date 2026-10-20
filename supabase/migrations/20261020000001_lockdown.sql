-- ==============================================================================
-- Lockdown: the public anon/authenticated roles get NO direct table or storage access.
-- All reads and writes go through Next.js server code using the service role, which
-- applies its own authorization. A leaked anon key is therefore harmless.
--
-- Why: the policies in 20260915000001_init.sql named "Service role full access ..."
-- had no `TO service_role` clause, so they applied to every role (anon included)
-- and allowed anyone to read, edit and delete all sites, content and messages.
-- Idempotent: safe to run more than once.
-- ==============================================================================

-- 1. Drop every permissive policy on app tables
DROP POLICY IF EXISTS "Service role full access on sites" ON public.sites;
DROP POLICY IF EXISTS "Service role full access on site_content" ON public.site_content;
DROP POLICY IF EXISTS "Service role full access on messages" ON public.messages;
DROP POLICY IF EXISTS "Public can read live sites" ON public.sites;
DROP POLICY IF EXISTS "Public can read live site content" ON public.site_content;
DROP POLICY IF EXISTS "Public can read approved messages" ON public.messages;
DROP POLICY IF EXISTS "Public can insert messages" ON public.messages;

-- 2. RLS stays on with no policies, and table privileges are revoked as a second wall
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sites, public.site_content, public.messages FROM anon, authenticated;

-- Future tables and functions created by migrations are private by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM public, anon, authenticated;

-- 3. Status values the app actually writes ('archived' = trash)
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_status_check;
ALTER TABLE public.sites ADD CONSTRAINT sites_status_check
  CHECK (status IN ('draft', 'live', 'expired', 'archived'));

-- 4. Guest messages are decided by the server, never by the client
ALTER TABLE public.messages ALTER COLUMN approved SET DEFAULT false;

-- 5. Storage: no anonymous listing, upload, overwrite or delete.
-- The bucket stays public for reads until the private media pipeline replaces it;
-- public-bucket reads by exact URL do not go through these policies.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;

UPDATE storage.buckets
SET file_size_limit = 26214400,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
WHERE id = 'site-media';
