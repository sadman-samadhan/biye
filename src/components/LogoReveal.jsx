'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { getImagePath } from '@/lib/getData'

export default function LogoReveal({ logoUrl, coupleNames, blessingData, weddingType = 'muslim' }) {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Parallax and scale effects
  const logoY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])
  const logoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])

  const isHindu = weddingType === 'hindu'

  const defaultFrame = isHindu
    ? '/monogram-frames/sanatan-frame.png'
    : '/monogram-frames/islamic-frame.png'

  const resolvedLogo = logoUrl ? getImagePath(logoUrl) : defaultFrame

  const topSacredInvocation = isHindu
    ? '॥ ॐ श्री गणेशाय नमः ॥'
    : 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'

  const topLabel = isHindu
    ? 'With Divine Blessings of Lord Ganesha & Elders'
    : 'In the Name of Allah, the Most Gracious, the Most Merciful'

  const quoteEn = blessingData?.en || (isHindu
    ? 'May our hearts unite in eternal love and companionship'
    : 'And He placed between you affection and mercy')

  const scripturalQuote = blessingData?.sa || blessingData?.ar || (isHindu
    ? 'ॐ यदेतद्धृदयं तव तदस्तु हृदयं मम। यदिदं हृदयं मम तदस्तु हृदयं तव।'
    : 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً')

  const referenceText = blessingData?.reference || (isHindu ? 'Atharva Veda 7.36.1' : "Surah Ar-Rum 30:21")

  return (
    <section ref={containerRef} className="relative min-h-[50vh] overflow-hidden flex items-center justify-center bg-bone/40 transition-colors duration-500">
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12 py-24">
        
        {/* Top Sacred Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 0.9, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-center mb-10 space-y-1.5"
        >
          <p className={`${isHindu ? 'font-sanskrit text-xl md:text-2xl' : 'font-arabic text-2xl md:text-3xl direction-rtl'} text-clay font-medium`}>
            {topSacredInvocation}
          </p>
          <div className="font-body text-[10px] uppercase tracking-[0.4em] text-graphite/60 font-medium">
            {topLabel}
          </div>
        </motion.div>

        {/* Logo Container with Parallax */}
        <motion.div
          style={{ 
            y: logoY, 
            scale: logoScale,
            opacity,
            willChange: 'transform, opacity'
          }}
          className="relative w-full aspect-square max-w-[340px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] mx-auto flex items-center justify-center"
        >
          {/* Animated Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.25 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0 bg-clay/20 rounded-full blur-[60px] pointer-events-none"
          />

          {/* Crisp High-DPI Logo Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex items-center justify-center p-2"
          >
            <Image
              src={resolvedLogo}
              alt="Wedding Monogram"
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 420px, 520px"
              style={{
                imageRendering: '-webkit-optimize-contrast',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'antialiased'
              }}
              className="object-contain drop-shadow-[0_4px_24px_rgba(166,124,82,0.18)]"
              priority
            />
          </motion.div>

          {/* Decorative Corner Accents */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.2, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-clay"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.2, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1.1 }}
            className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-clay"
          />
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="text-center mt-12 space-y-4"
        >
          {quoteEn && (
            <p className="font-body text-base md:text-lg text-graphite/70 italic leading-relaxed max-w-2xl mx-auto">
              &ldquo;{quoteEn}&rdquo;
            </p>
          )}
          {scripturalQuote && (
            <p className={`${isHindu ? 'font-sanskrit text-lg md:text-2xl' : 'font-arabic text-lg md:text-2xl direction-rtl'} text-clay/90 leading-relaxed`}>
              {scripturalQuote}
            </p>
          )}
          {referenceText && (
            <p className="font-body text-xs uppercase tracking-[0.4em] text-graphite/40 pt-2">
              {referenceText}
            </p>
          )}
        </motion.div>

        {/* Decorative Bottom Element */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 96 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-clay to-transparent mx-auto mt-16"
        />
      </div>
    </section>
  )
}
