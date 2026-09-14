import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
for (const line of env.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    process.env[match[1].trim()] = match[2].trim()
  }
}

import { getSiteBySlug, getSiteContent } from '../lib/getData.js'
import { isSupabaseConfigured, supabase, getSupabaseAdmin } from '../lib/supabase.js'

async function test() {
  console.log('isSupabaseConfigured:', isSupabaseConfigured)
  console.log('Checking with anon client:')
  const { data: anonData, error: anonError } = await supabase.from('sites').select('*').eq('slug', 'sakib-and-surma').maybeSingle()
  console.log('Anon query result:', anonData, 'Error:', anonError)

  console.log('Checking with admin client:')
  const { data: adminData, error: adminError } = await getSupabaseAdmin().from('sites').select('*').eq('slug', 'sakib-and-surma').maybeSingle()
  console.log('Admin query result:', adminData, 'Error:', adminError)

  console.log('Calling getSiteBySlug:')
  const site = await getSiteBySlug('sakib-and-surma', false)
  console.log('getSiteBySlug result:', site?.id, site?.slug)

  if (site) {
    const content = await getSiteContent(site.id)
    console.log('getSiteContent found:', Boolean(content), 'Hero coupleNames:', content?.content?.hero?.coupleNames)
  }
}

test()
