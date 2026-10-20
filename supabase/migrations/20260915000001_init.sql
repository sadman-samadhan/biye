-- ==============================================================================
-- AmarBiye (আমার বিয়ে) - Multi-tenant Wedding Platform V1 Migration
-- ==============================================================================

-- 1. Sites Table: Core entity for each wedding website
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,                       -- URL path: /s/{slug}
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'expired')),
  template_id TEXT DEFAULT 'classic',              -- classic
  palette JSONB DEFAULT '{}',                      -- active color overrides: { bone, graphite, warmGrey, accent, deepAccent, warmAccent }
  palette_options JSONB DEFAULT '[]',              -- generated palette choices
  selected_palette_index INT DEFAULT 0,            -- which palette option is active
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  plan_expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on slug for fast route lookups
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- 2. Site Content Table: Full structured content per site (JSONB matching existing data files)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',             -- hero, brideReveal, story, footer
  ceremonies JSONB NOT NULL DEFAULT '[]',          -- list of ceremony objects
  duas JSONB NOT NULL DEFAULT '{"duas": [], "parentBlessings": {}}', -- duas and blessings
  gallery JSONB NOT NULL DEFAULT '[]',             -- array of gallery images
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_content_site_id ON site_content(site_id);

-- 3. Messages Table: Guest wishes per site
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_urdu TEXT,
  message TEXT NOT NULL,
  message_urdu TEXT,
  approved BOOLEAN DEFAULT true,                   -- auto-approve or moderate
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_site_id ON messages(site_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Sites: Public can view live sites
DROP POLICY IF EXISTS "Public can read live sites" ON sites;
CREATE POLICY "Public can read live sites" ON sites
  FOR SELECT USING (status = 'live');

-- Sites: Service role can do anything
DROP POLICY IF EXISTS "Service role full access on sites" ON sites;
CREATE POLICY "Service role full access on sites" ON sites
  USING (true) WITH CHECK (true);

-- Site Content: Public can view content of live sites
DROP POLICY IF EXISTS "Public can read live site content" ON site_content;
CREATE POLICY "Public can read live site content" ON site_content
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = site_content.site_id AND sites.status = 'live')
  );

-- Site Content: Service role full access
DROP POLICY IF EXISTS "Service role full access on site_content" ON site_content;
CREATE POLICY "Service role full access on site_content" ON site_content
  USING (true) WITH CHECK (true);

-- Messages: Public can read approved messages for live sites
DROP POLICY IF EXISTS "Public can read approved messages" ON messages;
CREATE POLICY "Public can read approved messages" ON messages
  FOR SELECT USING (approved = true);

-- Messages: Anyone can post a message
DROP POLICY IF EXISTS "Public can insert messages" ON messages;
CREATE POLICY "Public can insert messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Messages: Service role full access
DROP POLICY IF EXISTS "Service role full access on messages" ON messages;
CREATE POLICY "Service role full access on messages" ON messages
  USING (true) WITH CHECK (true);

-- 6. Storage Bucket Configuration (SQL for Supabase Storage schema)
-- Note: You can also create the 'site-media' bucket in the Supabase Dashboard UI.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to site-media bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-media');

-- Allow service role / authenticated to upload to site-media bucket
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;
CREATE POLICY "Service Role Upload" ON storage.objects
  FOR ALL USING (bucket_id = 'site-media')
  WITH CHECK (bucket_id = 'site-media');
