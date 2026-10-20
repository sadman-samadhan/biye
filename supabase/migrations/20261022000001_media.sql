-- ==============================================================================
-- Private media: every photo/video a couple uploads gets a `media` row and lives
-- in a PRIVATE bucket. Guests only ever receive short-lived signed URLs for
-- resized variants; originals are never served to guests.
--
-- INTENT: RLS on, no policies, anon/authenticated revoked. Service role only.
-- Idempotent.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  kind          text NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
  slot          text NOT NULL DEFAULT 'gallery',      -- gallery | hero | spotlight | story | ceremony | monogram | invite | og | video
  album         text,                                 -- gallery filter (ceremony id)
  storage_key   text NOT NULL,                        -- base key: sites/{site_id}/m/{id}
  variants      jsonb NOT NULL DEFAULT '{}',          -- { thumb: {w,h,bytes,ext}, web: {...}, master: {...} }
  width         integer,
  height        integer,
  bytes_total   bigint NOT NULL DEFAULT 0,
  lqip          text,                                 -- tiny blurred data URI placeholder
  is_public     boolean NOT NULL DEFAULT false,       -- may appear on public invitation pages / share cards
  caption       jsonb NOT NULL DEFAULT '{}',
  alt           text,
  original_name text,
  sha256        text,
  uploaded_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_site ON public.media(site_id, created_at);
CREATE INDEX IF NOT EXISTS idx_media_pending ON public.media(status, created_at) WHERE status = 'pending';

-- Atomically add (or subtract) bytes; refuses growth beyond the quota.
CREATE OR REPLACE FUNCTION public.add_storage_usage(p_site uuid, p_delta bigint, p_quota bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE public.sites
  SET storage_used_bytes = GREATEST(0, storage_used_bytes + p_delta)
  WHERE id = p_site
    AND (p_delta <= 0 OR p_quota IS NULL OR storage_used_bytes + p_delta <= p_quota);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_storage_usage(uuid, bigint, bigint) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_storage_usage(uuid, bigint, bigint) TO service_role;

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media FROM anon, authenticated;
GRANT ALL ON public.media TO service_role;

-- Private bucket (no public reads, no anon policies). 15 MB per object: images are
-- resized in the browser before upload; videos are capped by plan in the app.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media-private', 'site-media-private', false, 104857600,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
