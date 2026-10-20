-- ==============================================================================
-- Accounts & access: couple accounts (site_members), guest access settings
-- (site_access), product/phase columns, content versioning, audit log and a
-- Postgres-backed rate limiter.
--
-- INTENT: every table here has RLS enabled with NO policies and no grants for
-- anon/authenticated. Only the Next.js server (service role) touches them,
-- after its own authorization checks. Idempotent.
-- ==============================================================================

-- 1. Couple / collaborator membership -------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_members (
  site_id    uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (site_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_site_members_user ON public.site_members(user_id);

-- 2. Guest access settings (kept out of `sites` so select('*') can never leak them)
CREATE TABLE IF NOT EXISTS public.site_access (
  site_id            uuid PRIMARY KEY REFERENCES public.sites(id) ON DELETE CASCADE,
  invite_access      text NOT NULL DEFAULT 'public'   CHECK (invite_access IN ('public', 'passcode')),
  site_access        text NOT NULL DEFAULT 'passcode' CHECK (site_access IN ('public', 'passcode')),
  passcode_enc       text,                 -- AES-256-GCM, so the couple can view/share it
  passcode_version   integer NOT NULL DEFAULT 1,
  message_moderation text NOT NULL DEFAULT 'auto' CHECK (message_moderation IN ('auto', 'manual')),
  watermark_mode     text NOT NULL DEFAULT 'off'  CHECK (watermark_mode IN ('off', 'site')),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_access (site_id)
SELECT id FROM public.sites
ON CONFLICT (site_id) DO NOTHING;

-- 3. Product, lifecycle and theme columns on sites -------------------------------
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS plan                text    NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS products            text[]  NOT NULL DEFAULT '{site}',
  ADD COLUMN IF NOT EXISTS phase_override      text,
  ADD COLUMN IF NOT EXISTS memories_published  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storage_used_bytes  bigint  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_quota_bytes bigint,
  ADD COLUMN IF NOT EXISTS public_contact      jsonb   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS theme_settings      jsonb   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tradition_variant   text,
  ADD COLUMN IF NOT EXISTS default_locale      text    NOT NULL DEFAULT 'bn';

ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_products_check;
ALTER TABLE public.sites ADD CONSTRAINT sites_products_check
  CHECK (products <@ ARRAY['invite', 'site']::text[] AND cardinality(products) > 0);

ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_phase_override_check;
ALTER TABLE public.sites ADD CONSTRAINT sites_phase_override_check
  CHECK (phase_override IS NULL OR phase_override IN ('invitation', 'live', 'memories'));

ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_default_locale_check;
ALTER TABLE public.sites ADD CONSTRAINT sites_default_locale_check
  CHECK (default_locale IN ('bn', 'en'));

-- Slugs become root-level URLs (shubhobiye.com/{slug}). NOT VALID so legacy rows
-- with underscores don't block the migration; run VALIDATE after cleaning them.
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_slug_format;
ALTER TABLE public.sites ADD CONSTRAINT sites_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$') NOT VALID;

-- 4. Content versioning (optimistic concurrency) and invitation content ---------
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS invitation jsonb   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version    integer NOT NULL DEFAULT 1;

-- 5. Audit log -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_kind text NOT NULL CHECK (actor_kind IN ('admin', 'member', 'guest', 'system')),
  actor_id   text,
  site_id    uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  action     text NOT NULL,
  meta       jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_site ON public.audit_log(site_id, created_at DESC);

-- 6. Rate limiting ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  hits         integer NOT NULL DEFAULT 0
);

-- Records one hit; returns true while the caller is still within p_limit for the window.
CREATE OR REPLACE FUNCTION public.rl_hit(p_key text, p_limit integer, p_window_s integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hits integer;
BEGIN
  INSERT INTO public.rate_limits AS r (key, window_start, hits)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    hits = CASE WHEN r.window_start < now() - make_interval(secs => p_window_s) THEN 1 ELSE r.hits + 1 END,
    window_start = CASE WHEN r.window_start < now() - make_interval(secs => p_window_s) THEN now() ELSE r.window_start END
  RETURNING hits INTO v_hits;
  RETURN v_hits <= p_limit;
END;
$$;

-- Returns true when the key is currently over its limit, without recording a hit.
CREATE OR REPLACE FUNCTION public.rl_blocked(p_key text, p_limit integer, p_window_s integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT hits >= p_limit FROM public.rate_limits
      WHERE key = p_key AND window_start >= now() - make_interval(secs => p_window_s)),
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.rl_hit(text, integer, integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rl_blocked(text, integer, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rl_hit(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.rl_blocked(text, integer, integer) TO service_role;

-- 7. Lock every new table down -------------------------------------------------
ALTER TABLE public.site_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_access  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.site_members, public.site_access, public.audit_log, public.rate_limits FROM anon, authenticated;
GRANT ALL ON public.site_members, public.site_access, public.audit_log, public.rate_limits TO service_role;
