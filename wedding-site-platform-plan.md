# Automated Wedding Website Platform — Production Build Plan

**Reference:** Target output quality = sites like rafar-shawon.vercel.app (Hero video, bilingual story timeline, per-event sections with sub-moments, filterable gallery, guestbook/blessings, contact footer).

---

## 1. Core Architecture Decision

**Multi-tenant single Next.js application**, not isolated per-client deployments.

Why: your requirement is "client gets a link that works for at least a year, renewable, paywalled" — not "client gets their own literal codebase/project." A single app with a database of site records satisfies this perfectly, and is dramatically cheaper and easier to operate:

| | Multi-tenant (recommended) | Isolated per-client deploy |
|---|---|---|
| Time to "go live" after intake | Seconds (DB write) | Minutes (build + deploy per client) |
| Cost at 100 clients | ~1 app's hosting cost | ~100x build minutes/hosting |
| Renewal | Flip a boolean / date field | Re-provision or unpause a whole deployment |
| Template updates | Ship once, all sites benefit | Must redeploy every client site |
| Custom domains | Vercel Domains API, attached to the one project | Per-project domain management, N times over |

This is the exact pattern Vercel built native tooling for (their "Platforms" architecture — used by Hashnode, Cal.com, Zapier, and similar SaaS site-builders): one root domain, wildcard subdomains routed via middleware, and a Domains API for attaching paying customers' own domains — all on one deployment.

**How it works mechanically:**
- `yourbrand.com` — your marketing/intake site
- `*.yourbrand.com` (wildcard DNS + Vercel wildcard domain) — every client site, e.g. `rafa-shawon.yourbrand.com`. Next.js middleware reads the `Host` header, extracts the subdomain, looks up the site record in Postgres, and server-renders that client's site. No per-signup deploy needed — this is instant.
- Custom domain (paid upsell, e.g. `rafaandshawon.com`) — client buys/points their domain at you, you call the Vercel Domains API to attach + auto-provision SSL for it against the same project. Still the same one app underneath.

---

## 2. End-to-End Flow

1. Client lands on your intake site, picks a template, pays (or starts a locked preview).
2. Client fills a structured form: couple names, dates, venue(s), event list (Holud/Akth/Wedding/etc.), optional free-text prompt/story notes.
3. Client either:
   - Uploads a featured image + photos directly (drag-drop, chunked upload for large batches), organized into named folders/categories in the UI, **or**
   - Connects Google Drive via **Picker (drive.file scope only — see §5)**, selects the parent wedding-photos folder; subfolders become categories.
4. Job is queued. Backend worker pipeline runs (see §7):
   - Ingest & store photos → object storage
   - Categorize per folder name → known event types
   - Extract color palette from featured image → theme tokens
   - Generate section copy from prompt/messages via Claude → story timeline, event intros, captions
   - Assemble the site's JSON content record
   - Mark site `live`, activate subdomain
5. Client gets an email: "Your site is ready" + link + dashboard login.
6. Client can log into a lightweight dashboard to: swap/reorder photos, edit AI-generated text, change template, buy a custom domain.
7. Renewal: cron checks `plan_expiry_date`; reminder emails at T-30/T-7/T-1; on expiry, site goes to a "renew to reactivate" holding page (soft takedown, don't delete data) until paid again.

---

## 3. Tech Stack

- **Framework:** Next.js (App Router) — matches your existing stack, and this is precisely what the multi-tenant "Platforms" pattern is built around.
- **Backend logic:** API routes / server actions within the same Next.js app for anything fast (form submission, dashboard reads). A **separate worker process** for anything slow (image processing, AI calls, Drive downloads) — these must NOT run inside a serverless request, since they can take minutes and hit timeout/cost limits.
- **Job queue:** BullMQ + Redis (Upstash, serverless-friendly) — stages: ingest → categorize → palette → content-gen → optimize → assemble → publish.
- **Database:** Postgres (Neon or Supabase — both serverless-friendly, pair well with Vercel).
- **Object storage:** Cloudflare R2 (S3-compatible API, **zero egress fees** — this matters a lot here, since wedding galleries are bandwidth-heavy and you're serving hundreds of images per site visit).
- **Image processing:** `sharp` for resizing/responsive variants/format conversion (WebP/AVIF); `node-vibrant` (or color-thief) for palette extraction — algorithmic, not AI-vision-based, for determinism and cost.
- **AI:** Claude API for content generation (story copy, captions, section intros) from the client's free-text prompt + structured fields. Keep this to *text generation*, not palette decisions — an LLM guessing hex codes from a description of an image is far less reliable than actual pixel clustering.
- **Auth:** Clerk or Auth.js for client dashboard accounts. Separate, narrow-scope Google OAuth (Picker + `drive.file` only) for the Drive import feature — do not conflate this with account login.
- **Domains/hosting:** Vercel (Pro plan tier, needed for the wildcard/unlimited custom domains capability) + Vercel Domains API.
- **Payments:** SSLCommerz (bKash + Nagad + Rocket + cards in one integration) for Bangladesh-first launch.
- **Email:** Resend or Postmark for transactional mail (site-ready notice, renewal reminders, receipts).
- **Monitoring:** Sentry for errors; a job dashboard (e.g. Bull Board) so you can see stuck/failed pipeline jobs at a glance.

---

## 4. Data Model (core tables)

```
users
  id, name, email, phone, password_hash / oauth_id, created_at

sites
  id, slug (subdomain), custom_domain (nullable),
  owner_user_id, template_id, palette (jsonb),
  status (draft | processing | live | expired | suspended),
  plan_expiry_date, created_at

site_content (or jsonb column on sites)
  couple_names, wedding_date, venues,
  events: [{ name, date, location, description, order }],
  story_timeline: [{ year, title, body_en, body_bn, image_ref }],
  blessings_enabled: bool,
  contact_email, contact_whatsapp

media
  id, site_id, storage_key, category (event slug),
  caption, sort_order, width, height, is_featured: bool

orders
  id, site_id, amount, currency, gateway ('sslcommerz'),
  gateway_txn_id, status, type ('initial'|'renewal'|'custom_domain'),
  created_at

jobs
  id, site_id, stage, status, error_log, started_at, completed_at
```

---

## 5. Photo Ingestion — Direct Upload + Google Drive

**Direct upload:** chunked/resumable upload (e.g. tus protocol or S3 multipart via presigned URLs directly to R2) so large batches of high-res wedding photos don't choke a single request. Client organizes into categories in the UI as they upload (drag into named buckets, or auto-detect from filename/EXIF date clustering as a starting suggestion).

**Google Drive:** Use the **Google Picker API with the `drive.file` scope**, not `drive.readonly`.
- `drive.readonly` is a *restricted* scope — since you'd be transmitting/storing that data on your servers, Google requires a third-party security assessment (CASA) before you can go live with real users. That's weeks of delay and real cost for a side project.
- `drive.file` is non-sensitive: the client picks their folder/files through Google's own Picker UI, and your app only ever receives access to exactly what was selected — no verification pipeline required.
- Once picked, your worker pulls the folder tree via the Drive API using the per-file grants from the Picker session, and treats each immediate subfolder name as a category (Holud, Nikkah/Akth, Wedding, Mehndi, Walima, Reception, Gallery, etc.), fuzzy-matched against a known category list. Ambiguous folder names get a cheap Claude classification call, but **always leave a manual override step in the dashboard** before publish — automation gets you 90% there, the client fixes the last 10%.

---

## 6. Color Palette Extraction

1. Run the featured image through `node-vibrant` — it natively returns 6 semantic swatches: Vibrant, Muted, Dark Vibrant, Dark Muted, Light Vibrant, Light Muted.
2. Map these to theme roles: `--color-bg`, `--color-accent`, `--color-text`, `--color-muted`, `--color-highlight`.
3. **Accessibility pass:** check WCAG contrast ratio between chosen text/background pairs; if a pairing fails, programmatically darken/lighten until it passes. This step is what keeps the auto-generated theme from producing unreadable text on some couples' photos — don't skip it.
4. Templates are built entirely on these CSS variables (no hardcoded colors), so any template + any palette combination just works.

---

## 7. AI Content Generation (Claude)

Inputs: structured fields (names, dates, venues, events) + optional free-text prompt ("we met in 2019 during the pandemic, married Dec 2024, love old Dhaka food...").

Generate: hero tagline, per-year story timeline entries, per-event intro paragraphs, a handful of photo captions per section.

Guardrails:
- **Always show a review/edit step** in the dashboard before publish — never auto-publish AI text unedited. This is someone's wedding; tone matters, and the couple should have final say.
- Offer a "regenerate this section" button, not just accept/reject.
- Multilingual toggle per section (English/Bangla/Urdu, matching the reference site's approach), generated on request rather than by default, to keep cost down.

---

## 8. Templates

Build 3–5 starter templates as different **component sets sharing one content schema** — this is what makes "pick a template" cheap. Each template implements: Hero, StoryTimeline, EventSection (repeated per event), Gallery (filterable), Blessings/Duas, GuestbookForm, Footer — reading from the same `site_content` JSON and the same CSS variable palette. Swapping templates for a live site later is just changing `template_id`.

Suggested starting set: one traditional/Islamic style (closely modeled on your reference site), one modern-minimal, one floral/romantic — covers the bulk of Bangladeshi wedding aesthetics without overbuilding up front.

---

## 9. Deployment & Domain Flow

- **Subdomain:** live the moment the site record is created — wildcard DNS + middleware handles routing automatically, no per-signup API call needed.
- **Custom domain (paid upsell):** client points a CNAME/A record at you (or buys through you), you call the Vercel Domains API to attach + verify + auto-SSL it to the same project. Vercel handles certificate issuance/renewal for every attached domain.

---

## 10. Paywall & Renewal

- Site is only publicly visible after a successful SSLCommerz payment webhook confirms the order — before that, client sees a locked preview.
- `plan_expiry_date` set to +365 days on payment.
- Daily cron checks upcoming expirations → reminder emails at T-30/T-7/T-1.
- On expiry: soft takedown (holding page: "This site's subscription has expired — renew to reactivate"), data retained, not deleted, so a late renewal just flips the site back on instantly.

---

## 11. Realistic Build Phasing

**Phase 0 (~2 weeks) — prove the concept end to end**
One hardcoded template, direct upload only, manual palette pass, manual publish (you flip the DB record yourself). Run this with 1–2 real couples for free to validate the actual output quality before automating anything.

**Phase 1 (~4–6 weeks) — core automation**
Job queue, real palette extraction, AI content generation, 2–3 templates, SSLCommerz integration, automatic subdomain activation on payment.

**Phase 2 (~4 weeks) — the full self-serve loop**
Google Drive Picker import, client dashboard (edit content, reorder/swap photos, change template), renewal automation + reminder emails, custom domain upsell flow.

**Phase 3 — polish & growth**
Multilingual content generation, view analytics for clients, guestbook/blessings moderation, referral/agency partner flow.

---

## 12. Rough Monthly Cost (at small scale, ~20–50 live sites)

| Item | Approx. cost |
|---|---|
| Vercel Pro (needed for wildcard + unlimited custom domains) | ~$20/mo base |
| Postgres (Neon/Supabase) | Free–$25/mo |
| Cloudflare R2 storage + bandwidth | <$10/mo (zero egress fees is the key win here) |
| Upstash Redis (queue) | Free–$10/mo |
| Claude API (content generation) | Low — a few cents to low dollars per site depending on prompt length; check current per-token pricing on docs.claude.com before finalizing your own client pricing |
| SSLCommerz | ~2–2.5% per transaction, plus check current setup fee |
| Root domain | ~$10–15/yr |

Total infra is likely well under $100/mo at this scale — the real cost driver as you grow is image storage/bandwidth and AI usage, both of which scale with actual paying clients, not fixed overhead.

---

## 13. Key Risks to Plan for Up Front

1. **Google Drive OAuth scope** — solved above via Picker + `drive.file`; do not build against `drive.readonly` and discover the CASA requirement late.
2. **Image bandwidth** — wedding galleries are hundreds of high-res photos; responsive `srcset`s, lazy loading, and R2's no-egress-fee model are not optional nice-to-haves here, they're what keeps this profitable at scale.
3. **AI copy tone risk** — always human-review before publish; never auto-publish AI-written wedding narration.
4. **Merchant registration** — SSLCommerz (and Bangladeshi payment gateways generally) require merchant verification paperwork (trade license, etc.) — start this process early since verification can take 1–3 weeks, independent of your dev timeline.
5. **Vercel plan tier** — confirm current Pro-tier limits/pricing for wildcard domains + custom domains before committing, since this is central to the whole architecture and terms can shift.

---

## 14. Suggested Immediate Next Step

Rebuild something close to your reference site (Rafa & Shawon) as your **first schema-driven template** — you already know it produces a result clients like. Get the intake form + a fully manual pipeline (you personally assemble the JSON and flip the site live) working end-to-end with one real couple before writing a single line of queue/automation code. Validate the output first; automate second.
