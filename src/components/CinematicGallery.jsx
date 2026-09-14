'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { getAllGalleryImages, getImagePath } from '@/lib/getData'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Moments', labelBn: 'সকল মুহূর্ত' },
  { id: 'wedding', label: 'Wedding', labelBn: 'শুভ বিবাহ' },
  { id: 'holud', label: 'Holud', labelBn: 'গায়ে হলুদ' },
  { id: 'akth', label: 'Akth / Sacred', labelBn: 'আখত / আশীর্বাদ' },
  { id: 'reception', label: 'Reception', labelBn: 'সংবর্ধনা / বৌভাত' },
  { id: 'portraits', label: 'Portraits', labelBn: 'প্রতিকৃতি' },
  { id: 'relatives', label: 'Family & Friends', labelBn: 'পরিবার ও স্বজন' },
]

const ITEMS_PER_PAGE = 12

export default function CinematicGallery({ images: propImages }) {
  const allImages = useMemo(() => {
    if (propImages && Array.isArray(propImages) && propImages.length > 0) {
      return propImages.map((img, idx) => ({
        id: img.id || `gallery-img-${idx}`,
        filename: img.filename || img.src,
        src: getImagePath(img.filename || img.src),
        category: img.category || 'wedding',
        alt: img.alt || 'Wedding Moment',
        width: img.width || 1600,
        height: img.height || 2000,
        caption: img.caption || ''
      }))
    }
    return getAllGalleryImages()
  }, [propImages])

  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  // Derive unique categories from actual images
  const availableCategories = useMemo(() => {
    const uniqueCats = new Set(allImages.map(img => img.category).filter(Boolean))
    const list = [{ id: 'all', label: 'All Moments', labelBn: 'সকল মুহূর্ত' }]
    
    uniqueCats.forEach(cat => {
      const match = DEFAULT_CATEGORIES.find(c => c.id === cat)
      if (match) {
        list.push(match)
      } else {
        list.push({
          id: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          labelBn: ''
        })
      }
    })
    return list
  }, [allImages])

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [activeCategory])

  const filteredImages = useMemo(() => {
    return activeCategory === 'all' 
      ? allImages 
      : allImages.filter(img => img.category === activeCategory)
  }, [activeCategory, allImages])

  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount)
  }, [filteredImages, visibleCount])

  const hasMore = visibleCount < filteredImages.length

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  return (
    <section className="py-32 bg-bone transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-graphite tracking-tight mb-4">
            Captured Moments
          </h2>
          <p className="font-bangla text-2xl md:text-3xl text-graphite/70">
            স্মৃতিময় মুহূর্তসমূহ
          </p>
        </div>

        {/* Category Filter */}
        {availableCategories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-16">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group relative px-6 py-3 transition-colors duration-300 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'text-graphite font-medium'
                    : 'text-graphite/50 hover:text-graphite/80'
                }`}
              >
                <span className="font-body text-sm uppercase tracking-wide block mb-1">
                  {cat.label}
                </span>
                {(cat.labelBn || cat.labelUrdu) && (
                  <span className={`${cat.labelBn ? 'font-bangla' : 'font-arabic direction-rtl'} text-xs block`}>
                    {cat.labelBn || cat.labelUrdu}
                  </span>
                )}
                
                <div
                  className={`absolute bottom-0 left-0 h-[2px] bg-clay transition-all duration-300 ${
                    activeCategory === cat.id ? 'w-full' : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {displayedImages.map((img) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={img.id}
                className="break-inside-avoid mb-6 cursor-pointer overflow-hidden rounded-lg group relative bg-black/5"
                data-cursor="view"
                onClick={() => setSelectedImage(img)}
              >
                <div className="relative overflow-hidden film-grain">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      className="w-full h-auto object-cover"
                      quality={85}
                    />
                  </motion.div>
                  
                  {/* Gradient overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
                  />

                  {/* Category label reveal */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="absolute bottom-0 left-0 right-0 p-6 z-10"
                  >
                    <p className="font-body text-[10px] text-white uppercase tracking-[0.2em]">
                      {img.category}
                    </p>
                    {img.caption && (
                      <p className="font-body text-xs text-white/70 mt-1">
                        {img.caption}
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-transparent border border-clay text-clay hover:bg-clay hover:text-white transition-all duration-300 font-body text-xs uppercase tracking-[0.2em] cursor-pointer"
            >
              Load More Moments ({filteredImages.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-pointer"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition-colors z-50"
              >
                <X size={28} />
              </button>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl max-h-[90vh] overflow-hidden flex flex-col items-center"
              >
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  width={selectedImage.width}
                  height={selectedImage.height}
                  className="max-h-[80vh] w-auto object-contain rounded-sm"
                  quality={95}
                />
                <div className="mt-4 text-center">
                  <p className="font-body text-xs uppercase tracking-[0.2em] text-white/60">
                    {selectedImage.category}
                  </p>
                  {selectedImage.caption && (
                    <p className="font-body text-sm text-white/90 mt-1">
                      {selectedImage.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
