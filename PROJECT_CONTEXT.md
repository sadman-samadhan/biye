# AmarBiye (আমার বিয়ে) — Master Project Context & Session State

> **Persistent Workspace Context Document**
> This document preserves the full state, architecture, database schemas, API routes, and operational decisions from the massive 1,120-step development session (`710860e0-4c7d-4410-9f4b-7d71577ef764`), ensuring total continuity across any chat session or IDE reload.

---

## 1. Project Overview & Goal
- **Original Codebase:** Single-couple static wedding site for Rafa & Shawon (`rafar-shawon.vercel.app`).
- **Transformed Product:** **AmarBiye** — a zero-monthly-cost, multi-tenant luxury wedding website platform tailored for Bangladesh and South Asian weddings.
- **Milestone Goal:** Bootstrap to 50 paying clients (priced at ৳3,499 BDT launch special) using free-tier services (Supabase + Vercel + Gemini Flash) before introducing paid infrastructure.

---

## 2. System Architecture & Multi-Tenancy

### Routing Schema
1. **Marketing Landing Page:** `/` ([src/app/page.jsx](file:///d:/Sakibbye/Rafar-Biye/src/app/page.jsx))
   - Features AmarBiye branding, live preview showcase, Gemini AI palette explainer, pricing (৳3,499 BDT), WhatsApp order CTA (`+8801954638110`), and admin login link.
2. **Dynamic Tenant Wedding Sites:** `/s/[slug]` ([src/app/s/[slug]/page.jsx](file:///d:/Sakibbye/Rafar-Biye/src/app/s/[slug]/page.jsx))
   - Dynamically loads tenant content from Supabase by slug.
   - Built-in fallback: `/s/rafa-shawon` and `/s/demo` load demo data seamlessly even if Supabase is unconfigured.
   - Draft Mode Banner: When `status === 'draft'`, displays an amber warning bar with direct link to admin.
3. **Operator Admin Portal:**
   - `/admin/login` — Password protected gateway (`ADMIN_PASSWORD` in `.env.local`).
   - `/admin` — Dashboard overview with 0/50 client milestone progress bar and quick stats.
   - `/admin/sites` — Search, filter (Live/Draft/Expired), toggle status, and delete.
   - `/admin/sites/new` — Client intake form with image upload & live Gemini AI palette generation.
   - `/admin/sites/[id]` — Edit couple details, ceremonies, switch color palette, moderate guest messages.

---

## 3. Database Schema (Supabase)

### Migrations
- `supabase/migrations/01_init.sql`:
  - `sites`: `id`, `slug` (unique), `wedding_date`, `status` ('draft' | 'live' | 'archived'), `created_at`.
  - `site_content`: `site_id` (FK), `wedding_type` ('muslim' | 'hindu' | 'general'), `content` (JSONB with hero, blessing, ceremonies, story, duas, gallery, metadata).
  - `messages`: `id`, `site_id`, `guest_name`, `message`, `is_approved`, `created_at`.
  - Storage buckets: `site-media` (public read).
- `supabase/migrations/02_tradition_and_bangla.sql`:
  - Expanded cultural ceremony support and Bengali typography support.

---

## 4. Key Subsystems & APIs

### 1. Dynamic Color Palette & Gemini Vision AI
- **Presets:** Classic Elegance, Royal Gold & Navy, Garden Romance, Terracotta Sunset, Modern Minimalist (`lib/palettes.js`).
- **AI Extraction API:** `src/app/api/palette/route.js`
  - Uses `models/gemini-3.6-flash` (fallback to `gemini-flash-latest`).
  - Takes base64 or file path of hero image, extracts 6 role-based colors (`bone`, `graphite`, `clay`, `deepClay`, etc.) ensuring WCAG AA contrast.
- **Runtime Injection:** `src/components/DynamicPalette.jsx` injects CSS custom properties directly into `:root`.

### 2. Monogram Generator
- **API:** `src/app/api/monogram/route.js`
- Uses `@napi-rs/canvas` or node canvas to generate luxury Bengali/English couple monograms, converted to PNG buffer and uploaded via `uploadSiteImage` in `lib/storage.js`.

### 3. Lossless Image Pipeline
- `lib/storage.js` uses `sharp` for lossless WebP compression and uploads directly to Supabase Storage under `site-media/{siteId}/{category}/`.

### 4. Custom Cursor & Hydration Fix
- `CustomCursor.jsx` is strictly scoped to `src/app/s/[slug]/layout.jsx`. It does NOT mount on the marketing landing page or admin portal, eliminating hydration mismatches and keeping admin controls standard.

---

## 5. Environment Configuration (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `ADMIN_PASSWORD`

---

---

## 6. Visual Crop Viewfinder & Focal Point Subsystem
- **Component:** [`src/components/admin/FocalPointPicker.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/components/admin/FocalPointPicker.jsx)
- **Features:**
  - **Crop Rectangle Viewfinder:** Shows the full, uncropped photo with an interactive golden framing rectangle (calculated dynamically using aspect ratio ratios against `targetRatioNumber`). Everything outside the crop frame has a dimmed mask (`bg-black/65 backdrop-blur-[1px]`).
  - **Live Preview Mode:** Toggles between `Crop Rectangle View` and `Final Cropped Preview` to show the exact final rendering inside the target container with live CSS `object-position`.
  - **Pixel-Level Slider & Clean Presets:** Includes 0% to 100% continuous vertical framing slider and clean percentage presets (`Top 0%`, `Upper 25%`, `Center 50%`, `Lower 75%`, `Bottom 100%`, `Reset`).
- **Configured Photo Types across Editor (`/admin/sites/[id]`) and Intake (`/admin/sites/new`):**
  1. **Hero Banner:** 16:10 landscape frame (`aspect-[16/10]`, `targetRatioNumber={1.6}`)
  2. **Couple Spotlight / Section C ("Our Families Said Yes"):** 16:9 banner frame (`aspect-[16/9]`, `targetRatioNumber={1.77}`)
  3. **Journey Milestones:** 4:3 frame (`aspect-[4/3]`, `targetRatioNumber={1.33}`)
  4. **Ceremony Hero Banners:** 16:9 banner frame (`aspect-[16/9]`, `targetRatioNumber={1.77}`)

---

---

## 7. Chronological Ceremony Sequence & Serial Reordering Subsystem
- **Component Files:**
  - Configuration & Presets: [`lib/traditions.js`](file:///d:/Sakibbye/Rafar-Biye/lib/traditions.js)
  - Admin New Intake: [`src/app/admin/sites/new/page.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/app/admin/sites/new/page.jsx)
  - Admin Site Editor: [`src/app/admin/sites/[id]/page.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/app/admin/sites/[id]/page.jsx)
  - Client Site & Navigation: [`src/app/s/[slug]/page.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/app/s/[slug]/page.jsx) & [`src/components/Navigation.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/components/Navigation.jsx)
- **Cultural Presets & Serial Flow:**
  - **🌙 Muslim Wedding:** Gaye Holud (হলুদ), Akht / Nikah (আখত), The Wedding / Biye (শুভ বিবাহ), Bou Bhat / Walima (বৌভাত ও ওয়ালিমা), with presets for Mehendi, Sangeet, and Qawwali.
  - **🪔 Hindu Wedding:** Ashirbad (আশীর্বাদ), Aiburobhat (আইবুড়ো ভাত), Gaye Holud (গায়ে হলুদ ও স্নান), Saat Paake Bandha & Biye (সাত পাক ও শুভ বিবাহ), Bou Bhat & Phool Shojja (বৌভাত ও সংবর্ধনা).
- **Features:**
  - **Quick Selection Toggles:** Tap-to-toggle inclusion chips for pre-wedding celebrations (Holud, Akht, Ashirbad, Aiburobhat).
  - **Mandatory Wedding Lock:** The Wedding anchor ceremony is permanently locked as mandatory with an emerald badge; it cannot be disabled, unchecked, or deleted.
  - **Optional Reception Toggle:** Reception / Bou Bhat / Walima has an active toggle checkbox to enable/disable.
  - **Automatic Chronological Canonical Ordering:** Enabling any ceremony immediately slots it into natural chronological order (`sortCeremoniesChronologically`), eliminating repetitive up/down button clicks while preserving manual `↑` / `↓` buttons for custom changes.
  - **Client-Side Synchronization:** Renders the events and top navigation bar in the exact serial order configured by the operator.

---

## 8. Program Media & 5-Photo Cinematic Carousel Subsystem
- **Component Files:**
  - Carousel Picker: [`src/components/admin/CeremonyCarouselPicker.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/components/admin/CeremonyCarouselPicker.jsx)
  - Public Client Carousel: [`src/components/CeremonySection.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/components/CeremonySection.jsx)
- **Features:**
  - **Hero Banner:** 16:9 banner with `FocalPointPicker` viewfinder crop.
  - **Up to 5 Carousel Photos:** Every program section supports up to 5 dedicated carousel photos (`ceremony.carouselImages`).
  - **Focal Point & Viewfinder for Every Photo:** Each carousel photo features a thumbnail preview showing its cropped position, an interactive viewfinder toggle with golden framing rectangle and continuous vertical framing slider, and deletion control.
  - **Cinematic Public Presentation:** Public website renders a luxury interactive carousel with left/right arrow navigation, smooth AnimatePresence transitions, slide indicators, counter badges, and responsive miniature thumbnail strips with `objectPosition` crop styles.

---

## 9. Two-Stage Safe Deletion & Storage Purge Lifecycle
- **Endpoint:** [`src/app/api/admin/sites/[id]/route.js`](file:///d:/Sakibbye/Rafar-Biye/src/app/api/admin/sites/[id]/route.js)
- **Admin Dashboard:** [`src/app/admin/sites/page.jsx`](file:///d:/Sakibbye/Rafar-Biye/src/app/admin/sites/page.jsx)
- **Storage Purge Implementation:** [`lib/storage.js`](file:///d:/Sakibbye/Rafar-Biye/lib/storage.js) (`deleteSiteStorage`)
- **Lifecycle Flow:**
  1. **Stage 1 (Soft Delete / Move to Trash):**
     - Clicking trash on an active site updates its database status to `'archived'`.
     - The site enters the **Trash / Preview** tab in the admin dashboard.
     - Public/Admin preview (`/s/[slug]`) remains accessible so operators can review the site before irreversible purge.
     - A single click on **Restore** returns the site to `'draft'` status.
  2. **Stage 2 (Permanent Purge):**
     - When an archived site is permanently deleted, `deleteSiteStorage(siteId, slug)` is triggered.
     - Recursively lists and deletes files strictly within `site-media/${siteId}/*` and `site-media/${slug}/*`.
     - Completely frees up cloud storage while keeping all other tenant sites and media intact.
     - Database rows across `messages`, `site_content`, and `sites` are then permanently deleted.

---

## 10. Universal Sharp Compression & Safe Video Pipeline
- **Sharp Image Pipeline:** All image uploads pass through Sharp's lossless/high-fidelity WebP compression pipeline (`quality: 90, effort: 6, max-width: 2000px`).
- **Safe Video Handling:** Videos are checked (≤ 20MB) and uploaded to `site-media/${siteId}/video/` without passing into Sharp, preventing memory or decoding errors.

---

## 11. Verification & Build Status
- **Next.js 16.1.6 (Turbopack)**: `npm run build` succeeds with **0 errors** across all 14 routes.
- **Active Dev Server**: Running on `http://localhost:3000`.



