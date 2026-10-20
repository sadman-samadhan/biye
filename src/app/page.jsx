'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import BrandLogo from '@/components/brand/BrandLogo'
import DeveloperCredit from '@/components/brand/DeveloperCredit'
import {
  Sparkles,
  ArrowRight,
  Palette,
  Video,
  HeartHandshake,
  MessageCircleHeart,
  Smartphone,
  ShieldCheck,
  Check,
  ExternalLink,
  PhoneCall
} from 'lucide-react'

export default function LandingPage() {
  const WHATSAPP_NUMBER = '8801954638110'
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi ShubhoBiye! I'm interested in creating a bespoke wedding website."
  )}`

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F3F2EE] selection:bg-[#A67C52] selection:text-white overflow-x-hidden">
      {/* 1. TOP NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0E0E10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="ShubhoBiye home">
            <BrandLogo tone="dark" height={40} priority />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-body tracking-wider uppercase text-zinc-400">
            <a href="#showcase" className="hover:text-white transition-colors">
              Showcase
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#palette-ai" className="hover:text-white transition-colors">
              AI Palette
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hidden sm:block"
            >
              Sign in
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] text-white text-xs uppercase tracking-widest font-medium rounded-xl transition-all shadow-md shadow-[#A67C52]/20 flex items-center gap-2"
            >
              <span>Order on WhatsApp</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-36 px-6 md:px-12 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#A67C52]/15 via-[#6B2C3E]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4A574] text-xs uppercase tracking-widest font-medium"
          >
            <Sparkles size={13} />
            <span>The Digital Heirloom for Your Wedding</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05]"
          >
            Every Love Story Deserves <br className="hidden sm:inline" />
            <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#FAF9F6] via-[#D4A574] to-[#A67C52]">
              Its Own Living Stage.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-base md:text-lg text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Bespoke, cinematic wedding websites crafted for Bangladeshi and South Asian celebrations.
            Immersive video heroes, Gemini AI color matching tailored to your wedding photography,
            ceremony timelines, and an interactive blessing board for loved ones worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/demo"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#A67C52] to-[#8C643E] hover:from-[#B88B5E] hover:to-[#9C7046] text-white font-body text-xs uppercase tracking-[0.2em] font-medium rounded-2xl shadow-xl shadow-[#A67C52]/25 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>Experience Live Demo Site</span>
              <ExternalLink size={16} />
            </Link>

            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-body text-xs uppercase tracking-[0.2em] font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>View Packages (From ৳3,499)</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 3. INTERACTIVE SHOWCASE */}
      <section id="showcase" className="py-24 px-6 md:px-12 border-t border-white/5 relative bg-black/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#A67C52] font-semibold">
              Live Signature Showcase
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              A Cinematic Wedding Story
            </h2>
            <p className="font-body text-sm text-zinc-400 max-w-xl mx-auto">
              Signature wedding website: complete with cinematic teasers, multi-ceremony timeline,
              and parent blessings.
            </p>
          </div>

          {/* Showcase Device Frame */}
          <div className="relative rounded-3xl p-3 md:p-6 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl overflow-hidden group">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-zinc-950">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#A67C52_0%,#3B1A24_45%,#0E0E10_100%)] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-[#A67C52]/30 border border-[#A67C52]/50 text-[#D4A574] text-xs uppercase tracking-widest font-semibold inline-block">
                      Signature Template: Classic Elegance
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl text-white">
                      Live Demo Site
                    </h3>
                    <p className="text-xs text-zinc-300 font-body">
                      Hosted at <code className="font-mono text-[#D4A574]">shubhobiye.com/demo</code>
                    </p>
                  </div>

                  <Link
                    href="/demo"
                    target="_blank"
                    className="px-6 py-3.5 bg-white text-black hover:bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-lg flex items-center gap-2 shrink-0"
                  >
                    <span>Launch Full Website</span>
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GEMINI AI PALETTE FEATURE */}
      <section id="palette-ai" className="py-24 px-6 md:px-12 border-t border-white/5 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
              <Sparkles size={13} />
              Powered by Google Gemini 2.0 Flash Vision
            </div>

            <h2 className="font-display text-4xl md:text-5xl text-white leading-tight">
              Color Palettes Extracted Directly From Your Photography.
            </h2>

            <p className="text-zinc-400 text-sm leading-relaxed">
              No generic wedding templates. Simply share your hero wedding portrait or saree/sherwani photograph,
              and our AI analyzes the tones to generate a 6-color harmonized palette ensuring AA WCAG contrast:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-[#A67C52]/20 text-[#D4A574] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span><strong>Bone &amp; Graphite:</strong> Eye-friendly typography contrast tailored for mobile screens.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-[#A67C52]/20 text-[#D4A574] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span><strong>Clay, Wine &amp; Saffron Accents:</strong> Mapped seamlessly to ceremony timelines and dividers.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-[#A67C52]/20 text-[#D4A574] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span><strong>Dynamic Live Swapping:</strong> Switch between Royal Gold, Garden Romance, or Custom in seconds.</span>
              </div>
            </div>
          </div>

          {/* Palette Interactive Swatch Demo */}
          <div className="p-8 bg-zinc-900/60 border border-white/10 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                Live Palette Tokens
              </span>
              <span className="text-xs text-[#D4A574] font-medium">
                Instant CSS :root Injection
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="w-full h-10 rounded-lg bg-[#FAF9F6] border border-white/20" />
                <div className="text-[11px] font-medium text-white">Background</div>
                <div className="text-[10px] text-zinc-500 font-mono">--color-bone</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="w-full h-10 rounded-lg bg-[#2B2B2B] border border-white/20" />
                <div className="text-[11px] font-medium text-white">Primary Text</div>
                <div className="text-[10px] text-zinc-500 font-mono">--color-graphite</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="w-full h-10 rounded-lg bg-[#A67C52] border border-white/20" />
                <div className="text-[11px] font-medium text-white">Primary Accent</div>
                <div className="text-[10px] text-zinc-500 font-mono">--color-clay</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="w-full h-10 rounded-lg bg-[#6B2C3E] border border-white/20" />
                <div className="text-[11px] font-medium text-white">Deep Accent</div>
                <div className="text-[10px] text-zinc-500 font-mono">--color-deep-wine</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="w-full h-10 rounded-lg bg-[#D4A574] border border-white/20" />
                <div className="text-[11px] font-medium text-white">Warm Accent</div>
                <div className="text-[10px] text-zinc-500 font-mono">--color-saffron</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="w-full h-10 rounded-lg bg-[#E8E2DB] border border-white/20" />
                <div className="text-[11px] font-medium text-white">Borders &amp; Lines</div>
                <div className="text-[10px] text-zinc-500 font-mono">--color-warm-grey</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features" className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#A67C52] font-semibold">
              The ShubhoBiye Standard
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              Crafted With Uncompromising Luxury
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4 hover:border-[#A67C52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <Video size={22} />
              </div>
              <h3 className="font-display text-2xl text-white">Cinematic Video Hero</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Full-screen atmospheric video hero with smooth parallax scrolling, custom ampersand reveals, and audio ambience.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4 hover:border-[#A67C52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <HeartHandshake size={22} />
              </div>
              <h3 className="font-display text-2xl text-white">Ceremony Timelines</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Dedicated chapters for Akth / Nikah, Gaye Holud, Wedding Reception, and Walima with maps, cultural notes, and flows.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4 hover:border-[#A67C52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <MessageCircleHeart size={22} />
              </div>
              <h3 className="font-display text-2xl text-white">Digital Guestbook</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Guests leave heartwarming wishes in English, Bengali, or Urdu. Instant moderation controls in your admin dashboard.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4 hover:border-[#A67C52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <Palette size={22} />
              </div>
              <h3 className="font-display text-2xl text-white">Lossless Compression</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Built-in Sharp image optimization transforms your heavy photography into lightning-fast, crystal clear WebP images.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4 hover:border-[#A67C52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <Smartphone size={22} />
              </div>
              <h3 className="font-display text-2xl text-white">Mobile Perfection</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Flawless layout on iPhone, Android, and desktop. Bespoke interactive cursors on wedding sites and fluid Framer Motion animations.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4 hover:border-[#A67C52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 border border-[#A67C52]/20 flex items-center justify-center text-[#D4A574]">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-display text-2xl text-white">Private &amp; Secure</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                A private passcode for guests, photos that can’t be opened without it, and your own address at shubhobiye.com/your-names.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING */}
      <section id="pricing" className="py-24 px-6 md:px-12 border-t border-white/5 bg-black/60">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#A67C52] font-semibold">
              Simple &amp; Transparent
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              One Price. Zero Subscriptions.
            </h2>
            <p className="text-sm text-zinc-400">
              Celebrate your milestone without monthly software fees. Pay once via bKash, Nagad, or Bank Transfer.
            </p>
          </div>

          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-[#A67C52]/40 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-6 py-2 bg-[#A67C52] text-white text-xs uppercase tracking-widest font-semibold rounded-bl-2xl">
              Launch Special • 50% Off
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-8">
              <div>
                <h3 className="font-display text-3xl text-white font-medium">
                  The Signature Wedding Heirloom
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Full white-glove setup by the ShubhoBiye team within 24–48 hours.
                </p>
              </div>

              <div className="text-right">
                <div className="text-zinc-500 line-through text-sm font-medium">
                  ৳6,999 BDT
                </div>
                <div className="font-display text-4xl md:text-5xl text-[#D4A574] font-bold">
                  ৳3,499 <span className="text-sm text-zinc-400 font-normal">BDT</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
              {[
                'Personalized URL: shubhobiye.com/your-names',
                'Cinematic Video Hero & Background Ambient Music',
                'Gemini AI Color Harmony extracted from your attire',
                'Up to 4 Custom Ceremony Timelines (Akth, Holud, etc.)',
                'Full Gallery with 50+ losslessly compressed photos',
                'Digital Guestbook / Blessings with Instant Moderation',
                '1 Year Free High-Speed Cloud Hosting',
                'QR Code provided for wedding invitation cards',
                'Manual bKash / Nagad verification with 0% extra fees',
                'Same-day WhatsApp support & revisions'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4 text-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-[#A67C52] via-[#D4A574] to-[#8C643E] hover:opacity-95 text-white font-body text-xs uppercase tracking-[0.2em] font-semibold rounded-2xl shadow-xl shadow-[#A67C52]/30 transition-all flex items-center justify-center gap-3"
              >
                <PhoneCall size={16} />
                <span>Book Your Wedding Site on WhatsApp</span>
              </a>
              <p className="text-xs text-zinc-500 mt-3">
                No credit card required. Chat directly with us to get started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t border-white/10 text-zinc-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <BrandLogo tone="dark" height={30} />
            <span className="text-zinc-600">© {new Date().getFullYear()}</span>
            <DeveloperCredit tone="dark" className="text-zinc-400" />
          </div>

          <div className="flex items-center gap-6">
            <Link href="/demo" className="hover:text-white transition-colors">
              Live Showcase
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              WhatsApp Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}