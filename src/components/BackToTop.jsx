'use client'

import { motion, useScroll } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function BackToTop() {
  const { scrollY } = useScroll()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      if (latest > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    })
  }, [scrollY])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-clay/90 backdrop-blur-sm flex items-center justify-center hover:bg-clay transition-colors shadow-lg"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      aria-label="Back to top"
    >
      <svg 
        className="w-6 h-6 text-pure-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </motion.button>
  )
}
