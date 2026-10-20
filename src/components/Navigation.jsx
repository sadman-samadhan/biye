'use client'

import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { playHoverSound, playClickSound, initAudio } from '@/lib/sounds'
import { useRouter, usePathname } from 'next/navigation'

export default function Navigation({ heroData: propHeroData, ceremonies: propCeremonies }) {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroData = propHeroData || {}
  const router = useRouter()
  const pathname = usePathname()

  // Build navigation items dynamically
  const navItems = useMemo(() => {
    const items = [
      { label: 'Home', labelBn: 'হোম', href: '#home' },
      { label: 'Our Story', labelBn: 'আমাদের গল্প', href: '#story' },
    ]

    if (propCeremonies && Array.isArray(propCeremonies) && propCeremonies.length > 0) {
      propCeremonies.filter(c => c.enabled !== false).forEach(c => {
        items.push({
          label: c.title?.en || c.id,
          labelBn: c.title?.bn || c.title?.ur || '',
          href: `#${c.id}`
        })
      })
    } else {
      items.push(
        { label: 'Akth', labelBn: 'আখত', href: '#akth' },
        { label: 'Holud', labelBn: 'হলুদ', href: '#holud' },
        { label: 'Wedding', labelBn: 'শুভ বিবাহ', href: '#wedding' }
      )
    }

    items.push(
      { label: 'Gallery', labelBn: 'চিত্রশালা', href: '#gallery' },
      { label: 'Blessings', labelBn: 'আশীর্বাদ / দোয়া', href: '#duas' },
      { label: 'Messages', labelBn: 'শুভকামনা', href: '#messages' }
    )

    return items
  }, [propCeremonies])

  // Hide nav on scroll down, show on scroll up
  useEffect(() => {
    return scrollY.on('change', (latest) => {
      if (latest > lastScrollY && latest > 150) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      setLastScrollY(latest)
    })
  }, [scrollY, lastScrollY])

  // Track active section
  useEffect(() => {
    initAudio()

    const handleScroll = () => {
      const sections = navItems.map(item => item.href.replace('#', ''))
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [navItems])

  // Smooth scroll to section
  const scrollToSection = (href) => {
    const id = href.replace('#', '')
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Account for fixed nav height
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
    setMobileMenuOpen(false)
  }

  const handleNavClick = (href) => {
    playClickSound()
    if (href.startsWith('#')) {
      // If we are already on a page containing these anchors (e.g. / or /s/[slug])
      if (document.getElementById(href.replace('#', ''))) {
        scrollToSection(href)
      } else {
        router.push('/' + href)
      }
    } else {
      router.push(href)
    }
  }

  // Generate couple initials
  const rawNames = heroData?.coupleNames?.en || 'Amar & Biye'
  const monogram = rawNames.includes(' & ')
    ? rawNames.split(' & ').map(name => name.trim()[0]).join(' & ')
    : rawNames.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Fixed Navigation */}
      <motion.nav
        initial={false}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-bone/90 backdrop-blur-md border-b border-warm-grey/30"
      >
        <div className="container-wide max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo / Monogram */}
            <button
              onClick={() => scrollToSection('#home')}
              className="font-display text-[28px] text-graphite tracking-tight hover:text-clay transition-colors cursor-pointer"
            >
              {monogram}
            </button>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '')
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    onMouseEnter={() => playHoverSound()}
                    className={`font-body text-xs uppercase tracking-wider transition-colors relative group py-2 cursor-pointer ${
                      isActive ? 'text-graphite font-medium' : 'text-graphite/60 hover:text-graphite'
                    }`}
                  >
                    {item.label}
                    
                    {/* Active indicator */}
                    <motion.span
                      initial={false}
                      animate={{
                        width: isActive ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 h-[1px] bg-clay"
                    />
                    
                    {/* Hover indicator */}
                    {!isActive && (
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-clay/50 group-hover:w-full transition-all duration-300" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-graphite hover:text-clay transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-current transform transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-current transform transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-bone/98 backdrop-blur-xl lg:hidden pt-28 px-6 pb-12 overflow-y-auto"
          >
            <div className="flex flex-col items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-center py-2"
                >
                  <span className="font-display text-2xl text-graphite block mb-1">
                    {item.label}
                  </span>
                  {item.labelBn && (
                    <span className="font-bangla text-sm text-clay/80 block">
                      {item.labelBn}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
