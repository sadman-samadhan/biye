'use client'

import { motion } from 'framer-motion'

export default function SectionDivider({ variant = 'line', accentColor = 'clay' }) {
  const gradients = {
    'clay': 'from-transparent via-clay to-transparent',
    'deep-wine': 'from-transparent via-deep-wine to-transparent',
    'saffron': 'from-transparent via-saffron to-transparent',
    'terracotta': 'from-transparent via-terracotta to-transparent'
  }

  const textColors = {
    'clay': 'text-clay',
    'deep-wine': 'text-deep-wine',
    'saffron': 'text-saffron',
    'terracotta': 'text-terracotta'
  }

  if (variant === 'line') {
    return (
      <div className="py-16 md:py-24 flex justify-center">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 120, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={`h-[1px] bg-gradient-to-r ${gradients[accentColor] || gradients.clay}`}
        />
      </div>
    )
  }

  if (variant === 'ornament') {
    return (
      <div className="py-16 md:py-24 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={textColors[accentColor] || textColors.clay}
          style={{ opacity: 0.2 }}
        >
          {/* Islamic geometric ornament */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* Center diamond */}
            <path 
              d="M40 20L50 40L40 60L30 40L40 20Z" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              fill="currentColor"
              opacity="0.3"
            />
            
            {/* Outer circles */}
            <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            
            {/* Corner decorations */}
            <circle cx="40" cy="15" r="2" fill="currentColor" />
            <circle cx="65" cy="40" r="2" fill="currentColor" />
            <circle cx="40" cy="65" r="2" fill="currentColor" />
            <circle cx="15" cy="40" r="2" fill="currentColor" />
            
            {/* Connecting lines */}
            <path d="M40 20L40 15M60 40L65 40M40 60L40 65M20 40L15 40" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </motion.div>
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className="py-16 md:py-24 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div 
            className={`font-arabic text-[48px] leading-none ${textColors[accentColor] || textColors.clay}`}
            style={{ opacity: 0.15 }}
          >
            ❦
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
