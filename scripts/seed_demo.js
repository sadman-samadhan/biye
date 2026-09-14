/**
 * Seed Script: Rafa & Shawon Demo Site for AmarBiye
 * 
 * Usage:
 *   node scripts/seed_demo.js
 * 
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   in .env.local or process environment.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Simple .env.local parser if dotenv is not installed
function loadEnv() {
  const envPath = resolve(rootDir, '.env.local');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding Rafa & Shawon demo site...');

  // 1. Read JSON data files
  const content = JSON.parse(readFileSync(resolve(rootDir, 'data/content.json'), 'utf8'));
  const ceremoniesData = JSON.parse(readFileSync(resolve(rootDir, 'data/ceremonies.json'), 'utf8'));
  const duasData = JSON.parse(readFileSync(resolve(rootDir, 'data/duas.json'), 'utf8'));
  const imagesData = JSON.parse(readFileSync(resolve(rootDir, 'data/demo-gallery.json'), 'utf8'));

  // Default Classic Elegance palette
  const classicPalette = {
    name: 'Classic Elegance',
    bone: '#F8F6F0',
    graphite: '#1A1815',
    warmGrey: '#8C857B',
    accent: '#A65D57',      // clay
    deepAccent: '#4A1525',  // deep-wine
    warmAccent: '#D49B4B'   // saffron
  };

  // 2. Upsert site
  const slug = 'demo';
  console.log(`Checking existing site with slug: ${slug}...`);

  let siteId;
  const { data: existingSite } = await supabase
    .from('sites')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existingSite) {
    siteId = existingSite.id;
    console.log(`Updating existing site ID: ${siteId}`);
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        status: 'live',
        wedding_type: 'muslim',
        template_id: 'classic',
        owner_name: 'AmarBiye Demo',
        palette: classicPalette,
        updated_at: new Date().toISOString()
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Error updating site:', updateError);
      process.exit(1);
    }
  } else {
    console.log(`Inserting new site: ${slug}...`);
    const { data: newSite, error: insertError } = await supabase
      .from('sites')
      .insert({
        slug,
        status: 'live',
        wedding_type: 'muslim',
        template_id: 'classic',
        owner_name: 'AmarBiye Demo',
        palette: classicPalette,
        palette_options: [classicPalette],
        selected_palette_index: 0
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating site:', insertError);
      process.exit(1);
    }
    siteId = newSite.id;
  }

  // 3. Upsert site content
  console.log('Upserting site_content...');
  const { error: contentError } = await supabase
    .from('site_content')
    .upsert({
      site_id: siteId,
      content: content,
      ceremonies: ceremoniesData.ceremonies || [],
      duas: duasData,
      gallery: imagesData.gallery || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'site_id' });

  if (contentError) {
    console.error('Error upserting site_content:', contentError);
    process.exit(1);
  }

  console.log('✅ Successfully seeded Rafa & Shawon site!');
  console.log(`   Site Slug: ${slug}`);
  console.log(`   Public URL: /s/${slug}`);
}

seed().catch(err => {
  console.error('Unexpected error during seeding:', err);
  process.exit(1);
});
