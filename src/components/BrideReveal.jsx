'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { getBrideRevealContent, getImagePath } from '@/lib/getData'

export default function BrideReveal({ brideRevealData: propData }) {
  const revealData = propData || getBrideRevealContent()
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Subtle parallax and smooth scale
  const imageY = useTransform(scrollYProgress, [0, 1], ['-2%', '2%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  const imageSrc = revealData?.imagePath ? getImagePath(revealData.imagePath) : null
  const descBn = revealData?.description?.bn || revealData?.description?.ur || ''
  const isDescBn = Boolean(revealData?.description?.bn) || /[\u0980-\u09FF]/.test(descBn)

  return (
    <section ref={containerRef} className="relative min-h-[90vh] md:h-[110vh] bg-[#0a0a0a] overflow-hidden flex items-center">
      {/* Background Layer */}
      <motion.div 
        style={{ y: imageY, scale: imageScale }} 
        className="absolute inset-0 z-0"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="Couple spotlight"
            fill
            quality={90}
            sizes="100vw"
            style={{ objectPosition: revealData?.imagePosition || 'center' }}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#12110e] via-[#1a1715] to-[#0a0a0a]" />
        )}
        {/* Layered Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </motion.div>

      {/* Content Overlay - Asymmetric Layout */}
      <div className="relative z-10 h-full w-full max-w-[1400px] mx-auto px-6 md:px-24 flex flex-col justify-center py-20">
        <div className="max-w-2xl">
          
          {/* Floating Label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 0.5, x: 0 }}
            transition={{ duration: 1.5 }}
            className="font-body text-[9px] uppercase tracking-[0.8em] text-white mb-12 border-l border-clay pl-4"
          >
            A Sacred Milestone
          </motion.div>

          {/* Refined Title */}
          {revealData?.title?.en && (
            <motion.h2 
              initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
              className="font-display text-3xl md:text-5xl text-white tracking-[-0.04em] leading-[0.9] mb-4"
            >
              {revealData.title.en}
            </motion.h2>
          )}

          {(revealData?.title?.bn || revealData?.title?.ur) && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 1.2 }}
              className={`${revealData?.title?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-2xl md:text-3xl text-clay mb-10`}
            >
              {revealData.title.bn || revealData.title.ur}
            </motion.p>
          )}
          
          <div className="space-y-8">
            {/* English Description */}
            {revealData?.description?.en && (
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.8 }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="font-body text-base md:text-md text-white/70 leading-relaxed font-light max-w-md italic border-clay/30"
              >
                {revealData.description.en}
              </motion.p>
            )}

            {/* Bangla / Alternate language */}
            {descBn && (
              <motion.p 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 0.75, x: 0 }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className={`${isDescBn ? 'font-bangla text-base md:text-lg' : 'font-arabic text-md md:text-xl direction-rtl'} text-clay/90 leading-relaxed max-w-lg`}
              >
                {descBn}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        className="absolute bottom-12 right-12 font-body text-[8px] text-white tracking-[1em] uppercase vertical-text hidden md:block"
        style={{ writingMode: 'vertical-rl' }}
      >
        AmarBiye
      </motion.div>
    </section>
  )
}