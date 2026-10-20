'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { getVideoPath, getImagePath } from '@/lib/media'

export default function VideoHero({ heroData: propHeroData, weddingType = 'muslim' }) {
  const containerRef = useRef(null)
  const heroData = propHeroData || {}
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 50, damping: 25 })
  
  const videoY = useTransform(smoothScroll, [0, 1], ["0%", "20%"])
  const contentY = useTransform(smoothScroll, [0, 1], ["0%", "-10%"])
  const textOpacity = useTransform(smoothScroll, [0, 0.4], [1, 0])
  const videoScale = useTransform(smoothScroll, [0, 1], [1.05, 1.2])

  // Parse couple names gracefully
  const rawNames = heroData?.coupleNames?.en || 'Bride & Groom'
  const namesArr = rawNames.includes(' & ') 
    ? rawNames.split(' & ') 
    : [rawNames, '']

  const hasVideo = Boolean(heroData?.videoPath)
  const isHindu = weddingType === 'hindu' || Boolean(heroData?.blessing?.sa)

  // Sacred Opening Invocations (Free of tofu blocks / missing glyphs)
  const defaultOpeningText = isHindu
    ? '॥ ॐ श्री गणेशाय नमः ॥'
    : 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'

  const defaultOpeningSub = isHindu
    ? 'Om Shri Ganeshaya Namah'
    : 'Bismillahir Rahmanir Rahim'

  const openingText = heroData?.openingInvocation || defaultOpeningText
  const openingSub = heroData?.openingSub || defaultOpeningSub

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-[#0a0a0a]">
      {/* 1. THE CINEMATIC CANVAS */}
      <motion.div className="absolute inset-0 z-0" style={{ y: videoY, scale: videoScale }}>
        {hasVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            src={getVideoPath(heroData.videoPath)}
            poster={heroData?.posterPath ? getImagePath(heroData.posterPath) : undefined}
            style={{ objectPosition: heroData?.posterPosition || heroData?.imagePosition || 'center' }}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.1] saturate-[0.85]"
          />
        ) : (heroData?.posterPath || heroData?.heroImage) ? (
          <img
            src={getImagePath(heroData?.posterPath || heroData?.heroImage)}
            alt={rawNames}
            style={{ objectPosition: heroData?.posterPosition || heroData?.imagePosition || 'center' }}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.1] saturate-[0.85]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1a17] via-[#0a0a0a] to-[#151210]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_rgba(10,10,10,0.7)_100%)] z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a0a] z-10" />
      </motion.div>

      {/* 2. THE COMPOSITION */}
      <motion.div 
        style={{ opacity: textOpacity, y: contentY }}
        className="relative z-20 h-full w-full flex flex-col items-center justify-between py-24 md:py-32"
      >
        {/* Top: Sacred Spiritual Opening Invocation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center px-4 space-y-1.5"
        >
          <p className={`${isHindu ? 'font-sanskrit text-2xl md:text-3xl' : 'font-arabic direction-rtl text-2xl md:text-4xl'} text-white tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]`}>
            {openingText}
          </p>
          <p className="font-body text-[10px] md:text-xs text-white/80 uppercase tracking-[0.4em] font-light">
            {openingSub}
          </p>
        </motion.div>

        {/* Center: THE ENHANCED NAME REVEAL */}
        <div className="w-full px-4 text-center">
          <div className="flex items-center justify-center overflow-hidden py-4 flex-wrap">
            
            {/* NAME 1 */}
            <motion.span
              initial={{ x: -50, opacity: 0, filter: 'blur(10px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="font-display text-3xl md:text-5xl lg:text-6xl text-white tracking-tighter"
            >
              {namesArr[0]}
            </motion.span>
            
            {/* THE SCULPTED AMPERSAND */}
            {namesArr[1] && (
              <motion.span 
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.8, duration: 1.2, ease: "backOut" }}
                className="font-display text-3xl md:text-5xl lg:text-7xl text-clay mx-4 md:mx-10 italic font-light drop-shadow-[0_0_15px_rgba(196,164,132,0.3)]"
              >
                &
              </motion.span>
            )}

            {/* NAME 2 */}
            {namesArr[1] && (
              <motion.span
                initial={{ x: 50, opacity: 0, filter: 'blur(10px)' }}
                animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl text-white tracking-tighter"
              >
                {namesArr[1]}
              </motion.span>
            )}
          </div>

          {/* LUXURY FINELINE INDICATOR */}
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "120px", opacity: 0.4 }}
            transition={{ delay: 1.4, duration: 1.5 }}
            className="h-[1px] bg-gradient-to-r from-transparent via-clay to-transparent mx-auto mt-2" 
          />
        </div>

        {/* Bottom: Information & Scroll */}
        <div className="flex flex-col items-center space-y-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <span className="font-body text-[10px] md:text-xs text-white uppercase tracking-[0.6em] font-light block mb-2">
              {heroData?.date?.en || ''}
            </span>
            {(heroData?.date?.bn || heroData?.date?.ur) && (
              <span className={`text-lg md:text-xl text-clay/80 block ${heroData?.date?.bn ? 'font-bangla' : 'font-arabic'}`}>
                {heroData.date.bn || heroData.date.ur}
              </span>
            )}
          </motion.div>

          {/* VERTICAL SCROLL UI */}
          <div className="flex flex-col items-center gap-4">
            <motion.p 
              animate={{ opacity: [0.2, 0.5, 0.2], y: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="font-body text-[8px] uppercase tracking-[1em] text-white"
              style={{ writingMode: 'vertical-rl' }}
            >
              Scroll to explore
            </motion.p>
            <div className="relative h-16 w-[1px] bg-white/10 overflow-hidden">
               <motion.div 
                  animate={{ y: [-64, 64] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-clay to-transparent"
               />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-white mix-blend-overlay z-50" />
    </section>
  )
}