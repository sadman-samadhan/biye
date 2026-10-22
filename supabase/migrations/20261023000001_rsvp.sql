-- ==============================================================================
-- RSVPs from the invitation. Guests reply through the app (POST /api/g/:slug/rsvp);
-- the couple reads and exports them from the editor.
--
-- INTENT: RLS on, no policies, anon/authenticated revoked. Service role only.
-- Idempotent.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rsvps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  phone       text CHECK (phone IS NULL OR char_length(phone) <= 30),
  side        text CHECK (side IS NULL OR side IN ('bride', 'groom', 'both')),
  attending   boolean NOT NULL,
  party_size  integer NOT NULL DEFAULT 1 CHECK (party_size BETWEEN 0 AND 20),
  events      text[] NOT NULL DEFAULT '{}',          -- ceremony ids
  note        text CHECK (note IS NULL OR char_length(note) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsvps_site ON public.rsvps(site_id, created_at DESC);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rsvps FROM anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;
