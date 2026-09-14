'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getImagePath } from '@/lib/getData'
import { blurReveal, staggerContainer } from '@/lib/animations'
import SectionDivider from './SectionDivider'

export default function CeremonySection({ ceremony }) {
  const heroRef = useRef(null)
  const galleryRef = useRef(null)
  const isGalleryInView = useInView(galleryRef, { once: true, margin: "-100px" })
  const [carouselIndex, setCarouselIndex] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  // Parallax effect for background image
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Color mapping
  const accentColors = {
    'deep-wine': 'bg-deep-wine',
    'saffron': 'bg-saffron',
    'terracotta': 'bg-terracotta',
    'clay': 'bg-clay'
  }

  const borderColors = {
    'deep-wine': 'border-deep-wine',
    'saffron': 'border-saffron',
    'terracotta': 'border-terracotta',
    'clay': 'border-clay'
  }

  const accentClass = accentColors[ceremony.accentColor] || 'bg-clay'
  const borderClass = borderColors[ceremony.accentColor] || 'border-clay'

  // Extract up to 5 carousel photos with focal point positions
  const rawCarousel = (ceremony.carouselImages && ceremony.carouselImages.length > 0)
    ? ceremony.carouselImages
    : (ceremony.galleryImages || [])

  const carouselPhotos = rawCarousel.map(item => {
    if (typeof item === 'string') {
      return { url: item, position: '50% 50%' }
    }
    return {
      url: item?.url || item?.filename || '',
      position: item?.position || '50% 50%'
    }
  }).filter(item => Boolean(item.url))

  const handlePrev = () => {
    setCarouselIndex(prev => (prev === 0 ? carouselPhotos.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex(prev => (prev === carouselPhotos.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="relative">
      {/* PARALLAX HERO */}
      <div ref={heroRef} className="relative min-h-[70vh] md:min-h-[85vh] overflow-hidden bg-onyx flex items-center justify-center">
        
        {/* Background Image with Parallax */}
        {ceremony.heroImage && (
          <div className="absolute inset-0 w-full h-full">
            <motion.div
              style={{ y: heroY }}
              className="relative w-full h-[120%] -top-[10%]"
            >
              <Image
                src={getImagePath(ceremony.heroImage)}
                alt={ceremony.title?.en || "Ceremony banner"}
                fill
                quality={90}
                sizes="100vw"
                style={{ objectPosition: ceremony.heroImagePosition || 'center' }}
                className="object-cover"
              />
            </motion.div>
          </div>
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/50 via-transparent to-onyx/50 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] z-10" />

        {/* Hero Content */}
        <motion.div
          className="relative z-20 h-full flex items-center justify-center px-6 py-20"
          style={{ opacity: heroOpacity }}
        >
          <div className="text-center max-w-4xl">
            
            {/* Bangla Title */}
            {(ceremony.title?.bn || ceremony.title?.ur) && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}  
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`${ceremony.title?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-2xl md:text-3xl text-pure-white/90 mb-6`}
              >
                {ceremony.title.bn || ceremony.title.ur}
              </motion.p>
            )}

            {/* English Title */}
            <motion.h2
              initial={{ opacity: 0, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl text-pure-white tracking-tight mb-8"
            >
              {ceremony.title?.en}
            </motion.h2>

            {/* Accent Line */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className={`h-[2px] ${accentClass} mx-auto mb-8`}
            />

            {/* Date & Venue */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-2"
            >
              {(ceremony.date?.en || ceremony.venue?.en) && (
                <p className="font-body text-xs md:text-sm text-pure-white/90 uppercase tracking-[0.3em]">
                  {[ceremony.date?.en, ceremony.venue?.en].filter(Boolean).join(' • ')}
                </p>
              )}
              {(ceremony.date?.bn || ceremony.date?.ur || ceremony.venue?.bn || ceremony.venue?.ur) && (
                <p className={`${(ceremony.date?.bn || ceremony.venue?.bn) ? 'font-bangla' : 'font-arabic direction-rtl'} text-sm text-pure-white/80`}>
                  {[ceremony.date?.bn || ceremony.date?.ur, ceremony.venue?.bn || ceremony.venue?.ur].filter(Boolean).join(' • ')}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* CONTENT SECTION */}
      <div className="py-24 md:py-32 bg-bone">
        <div className="container-standard max-w-6xl mx-auto px-6 md:px-12">
          
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {ceremony.subtitle?.en && (
              <h3 className="font-display text-3xl md:text-4xl text-graphite mb-4">
                {ceremony.subtitle.en}
              </h3>
            )}
            {(ceremony.subtitle?.bn || ceremony.subtitle?.ur) && (
              <p className={`${ceremony.subtitle?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-2xl text-graphite/70`}>
                {ceremony.subtitle.bn || ceremony.subtitle.ur}
              </p>
            )}
          </motion.div>

          {/* Description */}
          <div className="max-w-3xl mx-auto mb-20">
            {ceremony.description?.en && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="font-body text-lg md:text-xl text-graphite/80 leading-relaxed mb-6 italic text-center"
              >
                "{ceremony.description.en}"
              </motion.p>
            )}

            {(ceremony.description?.bn || ceremony.description?.ur) && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`${ceremony.description?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-lg md:text-xl text-graphite/70 leading-relaxed text-center`}
              >
                {ceremony.description.bn || ceremony.description.ur}
              </motion.p>
            )}

            {/* Cultural Note */}
            {ceremony.culturalNote && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`mt-12 border-l-2 ${borderClass} pl-6`}
              >
                {ceremony.culturalNote.en && (
                  <p className="font-body text-base text-graphite/60 italic leading-relaxed mb-3">
                    {ceremony.culturalNote.en}
                  </p>
                )}
                {(ceremony.culturalNote.bn || ceremony.culturalNote.ur) && (
                  <p className={`${ceremony.culturalNote.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-base text-graphite/50 italic leading-relaxed`}>
                    {ceremony.culturalNote.bn || ceremony.culturalNote.ur}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* EMOTIONAL FLOW TIMELINE */}
          {ceremony.flow && ceremony.flow.length > 0 && (
            <div className="relative mb-32">
              {/* Flow Beats */}
              <div className="relative max-w-7xl mx-auto">
                {/* Vertical Timeline Connector - Hidden on mobile */}
                <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] ${accentClass} opacity-20 -translate-x-1/2`} />

                {ceremony.flow.map((beat, index) => {
                  const isEven = index % 2 === 0
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.9, delay: index * 0.1 }}
                      className={`relative mb-24 md:mb-32 last:mb-0 ${
                        isEven ? 'md:pr-[52%]' : 'md:pl-[52%]'
                      }`}
                    >
                      {/* Timeline Dot */}
                      <div className={`hidden md:block absolute top-8 ${isEven ? 'right-0' : 'left-0'} w-4 h-4 ${accentClass} rounded-full ${isEven ? 'translate-x-[calc(50%+1px)]' : '-translate-x-[calc(50%+1px)]'} z-10`}>
                        <div className={`absolute inset-0 ${accentClass} rounded-full animate-ping opacity-20`} />
                      </div>

                      {/* Beat Card */}
                      <div className={`flex flex-col-reverse ${isEven ? 'md:flex-col md:items-end' : 'md:flex-col md:items-start'} gap-6`}>
                        {/* Images */}
                        {beat.images && beat.images.length > 0 && (
                          <div className={`w-full grid ${beat.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            {beat.images.map((img, imgIndex) => (
                              <motion.div
                                key={imgIndex}
                                initial={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                                whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 + imgIndex * 0.1 }}
                                className="relative aspect-[4/3] overflow-hidden rounded-sm"
                              >
                                <Image
                                  src={getImagePath(img)}
                                  alt={`${beat.title.en}`}
                                  fill
                                  quality={90}
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Text Content */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className={`max-w-xl ${isEven ? 'md:text-right' : 'md:text-left'}`}
                        >
                          {/* Beat Marker */}
                          <p className={`font-body text-xs uppercase tracking-[0.3em] text-graphite/40 mb-3 ${isEven ? 'md:direction-ltr' : ''}`}>
                            {beat.beat}
                          </p>

                          {/* English Title */}
                          <h4 className="font-display text-3xl md:text-4xl text-graphite mb-3">
                            {beat.title?.en}
                          </h4>

                          {/* Bangla Title */}
                          {(beat.title?.bn || beat.title?.ur) && (
                            <p className={`${beat.title?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-2xl md:text-3xl text-graphite/70 mb-6`}>
                              {beat.title.bn || beat.title.ur}
                            </p>
                          )}

                          {/* English Description */}
                          {beat.description?.en && (
                            <p className="font-body text-base md:text-lg text-graphite/70 leading-relaxed mb-4 italic">
                              {beat.description.en}
                            </p>
                          )}

                          {/* Bangla Description */}
                          {(beat.description?.bn || beat.description?.ur) && (
                            <p className={`${beat.description?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-base md:text-lg text-graphite/60 leading-relaxed italic`}>
                              {beat.description.bn || beat.description.ur}
                            </p>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

             <SectionDivider></SectionDivider>
            </div>
          )}

          {/* CINEMATIC CAROUSEL SLIDER (Up to 5 images per program section with custom focal point) */}
          {carouselPhotos.length > 0 && (
            <motion.div
              ref={galleryRef}
              variants={staggerContainer}
              initial="hidden"
              animate={isGalleryInView ? "visible" : "hidden"}
              className="mb-24 space-y-6"
            >
              <div className="text-center max-w-xl mx-auto space-y-2">
                <p className="font-body text-xs uppercase tracking-[0.25em] text-graphite/50">
                  Moments &amp; Memories
                </p>
                <h4 className="font-display text-2xl md:text-3xl text-graphite">
                  {ceremony.title?.en} Gallery
                </h4>
              </div>

              {/* Main Carousel Stage */}
              <div className="relative max-w-4xl mx-auto aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden bg-black/90 shadow-2xl border border-black/5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={getImagePath(carouselPhotos[carouselIndex]?.url)}
                      alt={`${ceremony.title?.en || 'Ceremony'} moment ${carouselIndex + 1}`}
                      fill
                      quality={92}
                      sizes="(max-width: 768px) 100vw, 1000px"
                      style={{ objectPosition: carouselPhotos[carouselIndex]?.position || 'center' }}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Left & Right Navigation Arrows */}
                {carouselPhotos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      aria-label="Previous photo"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label="Next photo"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Bottom Bar: Indicators & Counter */}
                {carouselPhotos.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                      {carouselPhotos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          aria-label={`Go to photo ${i + 1}`}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            i === carouselIndex
                              ? `w-7 h-2 ${accentClass} shadow-md`
                              : 'w-2 h-2 bg-white/50 hover:bg-white/90'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs font-mono text-white/95 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      {carouselIndex + 1} / {carouselPhotos.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Miniature Thumbnail Strip */}
              {carouselPhotos.length > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2 overflow-x-auto px-4">
                  {carouselPhotos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`relative w-16 h-12 md:w-20 md:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        i === carouselIndex
                          ? `border-[#A67C52] scale-105 shadow-md ring-2 ring-[#A67C52]/30`
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getImagePath(photo.url)}
                        alt={`Thumb ${i + 1}`}
                        style={{ objectPosition: photo.position || 'center' }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Dua/Quote/Blessing */}
          {(ceremony.dua || ceremony.blessing) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="max-w-3xl mx-auto text-center"
            >
              {(ceremony.dua?.ar || ceremony.blessing?.ar || ceremony.dua?.sa || ceremony.blessing?.sa) && (
                <blockquote className={`${(ceremony.dua?.sa || ceremony.blessing?.sa) ? 'font-serif' : 'font-arabic direction-rtl'} text-2xl md:text-3xl text-graphite leading-relaxed mb-6`}>
                  {ceremony.dua?.ar || ceremony.blessing?.ar || ceremony.dua?.sa || ceremony.blessing?.sa}
                </blockquote>
              )}
              {(ceremony.dua?.en || ceremony.blessing?.en) && (
                <p className="font-body text-lg text-graphite/70 italic leading-relaxed">
                  {ceremony.dua?.en || ceremony.blessing?.en}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
