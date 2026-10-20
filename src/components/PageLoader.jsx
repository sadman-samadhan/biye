'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // Don't show full-screen loader on admin routes
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    setMounted(true)
    if (isAdmin) {
      setIsLoading(false)
      return
    }

    // Add loading class to body
    document.body.classList.add('loading')

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 25)

    // Quick, elegant display time
    const timer = setTimeout(() => {
      setIsLoading(false)
      document.body.classList.remove('loading')
    }, 1200)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
      document.body.classList.remove('loading')
    }
  }, [isAdmin])

  if (!mounted || isAdmin || !isLoading) return null

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-bone flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="text-center max-w-xl px-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-arabic text-xl md:text-2xl text-graphite/70 mb-4 direction-rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl text-graphite tracking-tight mb-4"
            >
              ShubhoBiye
            </motion.h1>

            <div className="relative w-48 mx-auto h-[1.5px] bg-warm-grey overflow-hidden rounded-full my-4">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                className="absolute left-0 top-0 h-full bg-clay"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-body text-xs text-graphite/60 uppercase tracking-widest"
            >
              Curating Celebration
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
