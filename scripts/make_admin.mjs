#!/usr/bin/env node
/**
 * Grant (or revoke) ShubhoBiye operator access.
 *
 *   node --env-file=.env.local scripts/make_admin.mjs you@example.com            # promote existing user
 *   node --env-file=.env.local scripts/make_admin.mjs you@example.com 'password'  # create + promote
 *   node --env-file=.env.local scripts/make_admin.mjs you@example.com --revoke
 *
 * Sets app_metadata.role = 'admin' (users cannot edit app_metadata themselves).
 */
import { createClient } from '@supabase/supabase-js'

const [email, arg] = process.argv.slice(2)
if (!email || !email.includes('@')) {
  console.error('Usage: scripts/make_admin.mjs <email> [password | --revoke]')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

async function findUserByEmail(target) {
  for (let page = 1; page < 100; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase())
    if (match) return match
    if (data.users.length < 200) return null
  }
  return null
}

let user = await findUserByEmail(email)

if (!user) {
  if (!arg || arg === '--revoke') {
    console.error(`No user with email ${email}. Pass a password to create one.`)
    process.exit(1)
  }
  if (arg.length < 12) {
    console.error('Use a password of at least 12 characters for an operator account.')
    process.exit(1)
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password: arg, email_confirm: true })
  if (error) throw error
  user = data.user
  console.log(`Created ${email}`)
}

const revoke = arg === '--revoke'
const appMetadata = { ...(user.app_metadata || {}) }
if (revoke) delete appMetadata.role
else appMetadata.role = 'admin'

const { error } = await supabase.auth.admin.updateUserById(user.id, { app_metadata: appMetadata })
if (error) throw error
console.log(revoke ? `Revoked admin from ${email}` : `${email} is now an admin. They must sign in again for it to apply.`)
