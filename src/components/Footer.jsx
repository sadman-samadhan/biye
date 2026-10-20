'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, Heart } from 'lucide-react'

// Contact cards render only when the couple explicitly chose to publish contact details.
export default function Footer({ footerData, siteName = 'AmarBiye', contactEmail, contactPhone }) {
  const currentYear = new Date().getFullYear()

  const email = contactEmail || ''
  const phone = contactPhone || ''
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const thankYouBn = footerData?.thankYou?.bn || footerData?.thankYou?.ur || ''

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <footer className="bg-graphite text-bone pt-20 pb-10 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-clay/30 to-transparent" />
      
      <div className="container mx-auto px-6" data-cursor-text="Contact">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col items-center text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 text-saffron"
          >
            Get in Touch
          </motion.h2>
          
          <motion.div variants={itemVariants} className="max-w-lg mb-12">
            <p className="font-body text-clay/80 text-lg leading-relaxed mb-2">
              {footerData?.thankYou?.en || 'We would love to hear from you. For any inquiries or just to send your blessings, please reach out.'}
            </p>
            {thankYouBn && (
              <p className={`${footerData?.thankYou?.bn ? 'font-bangla' : 'font-arabic'} text-clay/70 text-base`}>
                {thankYouBn}
              </p>
            )}
          </motion.div>

          <div className={`flex flex-col md:flex-row gap-8 md:gap-16 ${email || phone ? 'mb-20' : 'mb-8'}`}>
            {/* Email */}
            {email && (
              <motion.a
                variants={itemVariants}
                href={`mailto:${email}`}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-clay/30 transition-all duration-300 w-64"
                data-cursor-text="Email Us"
              >
                <div className="w-12 h-12 rounded-full bg-deep-wine/20 flex items-center justify-center text-saffron group-hover:scale-110 transition-transform duration-300">
                  <Mail size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-display text-lg text-clay">Email</span>
                  <span className="font-body text-sm text-bone/90 break-all">{email}</span>
                </div>
              </motion.a>
            )}

            {/* WhatsApp */}
            {phone && (
              <motion.a
                variants={itemVariants}
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-clay/30 transition-all duration-300 w-64"
                data-cursor-text="Chat on WhatsApp"
              >
                <div className="w-12 h-12 rounded-full bg-deep-wine/20 flex items-center justify-center text-saffron group-hover:scale-110 transition-transform duration-300">
                  <Phone size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-display text-lg text-clay">WhatsApp</span>
                  <span className="font-body text-sm text-bone/90 tracking-wide">{phone}</span>
                </div>
              </motion.a>
            )}
          </div>

          <motion.div 
            variants={itemVariants}
            className="w-full max-w-4xl h-px bg-white/10 mb-8"
          />

          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-center w-full max-w-4xl gap-4 font-body text-xs text-clay/60"
          >
            <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Crafted with <Heart size={13} className="text-deep-wine fill-deep-wine animate-pulse" /> on{' '}
              <Link
                href="/"
                className="text-saffron hover:underline font-medium"
              >
                AmarBiye
              </Link>
            </p>
          </motion.div>

        </motion.div>
      </div>
    </footer>
  )
}
