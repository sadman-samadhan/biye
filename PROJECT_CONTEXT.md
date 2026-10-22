# ShubhoBiye — project context

ShubhoBiye (শুভ বিয়ে, shubhobiye.com) makes private wedding invitations and websites for Bangladeshi families. Each couple gets **one link** that changes with the wedding: an invitation with RSVP before it, today's events and a livestream on the days, then the full site with photos afterwards. It was built as "AmarBiye" from a single couple's site and rebuilt as v2 in phases 0–10; each phase's notes are in `docs/prs/pNN.md`.

## Stack
- Next.js 16 App Router (Turbopack), React 19, Tailwind v4, framer-motion. JavaScript, no TypeScript. `src/proxy.js` is Next 16's middleware.
- Supabase: Postgres, Auth and Storage. Data access is **server-only**: RLS is on with no policies, and `anon` and `authenticated` are revoked. Every read and write goes through Next server code using the service role, with app-level authorisation and zod validation.
- Media storage sits behind an adapter: a private Supabase bucket by default, or Cloudflare R2 when the `R2_*` variables are set.
- Canvas (`@napi-rs/canvas`) with bundled OFL fonts for the monogram and share card, because Bangla needs proper shaping.

## Map of the code
| Where | What |
|---|---|
| `src/app/(site)/[slug]/…` | A wedding site: `/{slug}` follows the phase; `/invite` and `/memories` are fixed views; `/u/{key}` is the one-tap unlock; also `calendar.ics` and `og.jpg` |
| `src/site/` | Renderers: `SitePage` (access, preview, view choice), `SiteRenderer` (memories site), `invite/InviteRenderer` (invitation and live view), shared `sections/*`, `primitives/*` |
| `src/themes/` | Six themes: `cinematic`, `jharokha`, `noor`, `laal-paar`, `nakshi-kantha`, `patrika`. Each has a `theme.js` (`defineTheme` contract) and, for the newer ones, `sections.jsx`. `variants.js` registers theme layouts per section and page frames; `ornaments.jsx` holds masks and SVG ornaments; `openings/` the opening animations; `fonts.js` the fonts |
| `src/traditions/` | Muslim, Hindu (Bengali and North Indian), Christian, Buddhist, Universal: invocation, verses, ceremonies with rank, bilingual copy (`copy.js`), date extras (Hijri, Bangla calendar) |
| `src/components/editor/` | `SiteEditor` with all panels, shared by `/admin/sites/[id]` (operators) and `/dashboard/[siteId]` (couples) |
| `src/app/api/` | `admin/*` (operators), `sites/[siteId]/*` (site members and operators), `g/[slug]/*` (guests: unlock, messages, RSVP), `cron/daily` |
| `src/marketing/`, `src/i18n/marketing.js` | Marketing site in English (`/`) and Bangla (`/bn`), `/themes`, `/themes/[id]`, `/privacy`, `/terms`. Prices live in `PRICES` |
| `src/demo/` | 60 static demos (`/demo/[theme]/[tradition]` and `/invite`) built from code with a fictional couple and CC-licensed photos (`public/demo`, credits at `/demo/credits`) |
| `lib/` | Pure modules (`phase`, `invitation`, `calendar`, `color`, `dates`, `passcode`, `content/schema`, `slugs`) and `lib/server/*` (auth, site data, guest access, RSVP, media, storage, rate limits, share card) |
| `supabase/migrations/` | Run in order. Each phase's notes say which ones it adds |

## Key rules
- **Phase:** `lib/phase.js`, always in Asia/Dhaka time.
  - *invitation* until the first event day;
  - *live* from then until the day after the last event;
  - *memories* once `memories_published` is set (couples set it in Privacy & sharing).

  `phase_override` wins. `products` (`invite`, `site`) limits which phases exist.
- **Access:**
  - Each site has an invitation scope and a memories scope, each public or passcode.
  - Passcodes are AES-GCM encrypted (`lib/server/passcode-crypto.js`).
  - Guests get a signed per-site cookie carrying the passcode version, so rotating the passcode signs everyone out.
  - Without memories access only photos marked public are resolved. Invitation photos are marked public when saved.
- **Media:**
  - Content stores `media:<uuid>` tokens.
  - Guests get short-lived signed links to resized variants. The full-size master is only for members (single download, or the "Your photos" panel's zip).
  - `MediaGuard` blocks right-click and long-press saving.
- **Themes vs traditions:** a site picks one of each. Themes control layout, type, shapes, ornaments, opening and palettes; traditions control wording, ceremonies and verses. Palettes go through contrast guards (`lib/color.js`); a test checks every theme palette.
- **Couples** are invited by operators (`/api/admin/sites/[id]/members` makes a one-time link). Public sign-up is off.

## Running it
See `README.md`. In short:
- `npm run db:start` (local Supabase in Docker), then paste or apply the migrations;
- `node scripts/make_admin.mjs` to create an operator;
- `npm run dev -- -p 3210` (port 3000 can be blocked on Windows).

Tests:
- `npm test` — unit tests;
- `npm run test:e2e` — Playwright, run against `next start` on port 3210;
- `npm run smoke:security` with `SMOKE_BASE_URL`.

## Still to do outside the code
- Register shubhobiye.com.
- Keep the GitHub repo private.
- Rotate the old secrets.
- Disable sign-ups in Supabase.
- Set prices.
- Get native or clergy review of verses (`src/traditions/SOURCES.md`).
- Have a lawyer read `/privacy` and `/terms`.
- Move to Vercel Pro before taking payments (Hobby forbids commercial use).
