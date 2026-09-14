'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SectionDivider from '@/components/SectionDivider'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'

export default function DesignPhilosophy() {
  return (
    <>
      <Navigation />
      <ScrollProgress />
      <BackToTop />

      <main className="bg-bone min-h-screen pt-32 pb-24 film-grain">
        {/* HERO SECTION */}
        <section className="container-standard max-w-4xl mx-auto px-6 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl text-graphite mb-6">
              Design Philosophy
            </h1>
            <p className="font-arabic text-3xl text-clay mb-8 direction-rtl">
              ڈیزائن کا فلسفہ
            </p>
            <div className="h-[1px] w-24 bg-clay/30 mx-auto" />
          </motion.div>
        </section>

        {/* CONTENT SECTIONS */}
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          
          {/* THEORETICAL INTERVENTION */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-whisper/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-warm-grey/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="font-display text-3xl text-clay mb-6">
              Theoretical Intervention
            </h2>
            <p className="font-body text-lg text-graphite/80 leading-relaxed mb-6">
              The AmarBiye wedding platform is more than a celebratory digital space; it is a 
              <strong> cultural and design celebration</strong> in interface craftsmanship. By building a 
              multilingual platform that honors Bangla and English alongside sacred scriptural traditions, 
              we craft digital heirlooms that honor heritage with modern cinematic aesthetics.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8 border-t border-warm-grey/30 pt-8">
              <div>
                <h3 className="font-display text-xl text-graphite mb-3">Multilingual Sovereignty</h3>
                <p className="font-body text-sm text-graphite/70">
                  Translation is not merely a utility but an act of digital sovereignty. 
                  Every script is given equal visual weight, asserting the right to exist 
                  in high-fidelity, interactive digital environments.
                </p>
              </div>
              <div className="direction-rtl">
                <h3 className="font-arabic text-xl text-graphite mb-3">لسانی خودمختاری</h3>
                <p className="font-arabic text-sm text-graphite/70">
                  ترجمہ محض ایک سہولت نہیں بلکہ ڈیجیٹل خودمختاری کا ایک عمل ہے۔ ہر رسم الخط 
                  کو مساوی بصری وزن دیا گیا ہے، جو اعلیٰ معیار کے انٹرایکٹو ماحول میں 
                  موجود رہنے کے حق کی تصدیق کرتا ہے۔
                </p>
              </div>
            </div>
          </motion.section>

          {/* POWER RELATIONS */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-whisper/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-warm-grey/50 shadow-sm"
          >
            <h2 className="font-display text-3xl text-clay mb-6">
              Encoding Power Relations
            </h2>
            <p className="font-body text-lg text-graphite/80 leading-relaxed">
              Interface design choices are never neutral; they encode power relations. 
              The decision to implement <strong>Right-to-Left (RTL)</strong> rendering 
              seamlessly across the site is a subversion of the standard Left-to-Right 
              bias that dominates the global software industry. We center the user 
              experience of our families and community, ensuring that their primary 
              scripts are not treated as secondary "translations" but as core pillars 
              of the platform's identity.
            </p>
          </motion.section>

          {/* DESIGN AS PEDAGOGY */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12"
          >
            <div className="p-8 bg-clay/5 rounded-2xl border border-clay/10">
              <h3 className="font-display text-2xl text-clay mb-4">Postcolonial Critique</h3>
              <p className="font-body text-sm text-graphite/70 leading-relaxed">
                By utilizing cinematic framing and high-performance animations, the platform 
                elevates South Asian cultural narratives to the aesthetic standards of 
                premium global brands, rejecting the "archaic" or "static" labels often 
                attached to non-Western cultural websites.
              </p>
            </div>
            <div className="p-8 bg-deep-wine/5 rounded-2xl border border-deep-wine/10">
              <h3 className="font-display text-2xl text-deep-wine mb-4">Aesthetic Resistance</h3>
              <p className="font-body text-sm text-graphite/70 leading-relaxed">
                Beauty is a form of resistance. The meticulous attention to typography, 
                motion, and responsiveness serves to demonstrate that cultural preservation 
                and cutting-edge technical innovation can—and must—coexist.
              </p>
            </div>
          </motion.section>

          {/* BENGALI REPRESENTATION */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-whisper/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-warm-grey/50 shadow-sm text-center"
          >
            <h2 className="font-display text-3xl text-clay mb-6">
              Cultural Convergence
            </h2>
            <p className="font-bangla text-3xl text-graphite mb-6">
              আমাদের যাত্রা, আমাদের সংস্কৃতি
            </p>
            <p className="font-body text-lg text-graphite/80 leading-relaxed">
              The inclusion of Bangla script alongside Arabic and Urdu reflects the 
              rich, transregional heritage of our families. It is a celebration of 
              convergence—where tradition meets modernity, and where diverse 
              linguistic identities find a unified home in the digital realm.
            </p>
          </motion.section>

        </div>

        <SectionDivider variant="ornament" accentColor="clay" />

        {/* FOOTER CALL TO ACTION */}
        <section className="text-center max-w-2xl mx-auto px-6 pb-12">
          <p className="font-body text-graphite/60 italic mb-8">
            "We build not just for the present, but to encode our memories into the 
            digital landscape for generations to come."
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-graphite text-bone font-body text-sm uppercase tracking-widest hover:bg-clay transition-colors rounded-sm"
          >
            Return to Home
          </motion.a>
        </section>
      </main>

      <Footer />
    </>
  )
}
