'use client'

import { motion } from 'framer-motion'

/**
 * Fades content up as it scrolls into view. Reduced-motion preferences are
 * honoured by the MotionConfig in ThemeRuntime (movement is dropped).
 */
export default function Reveal({ as = 'div', delay = 0, y = 18, className = '', children, ...props }) {
  const Tag = motion[as] || motion.div
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  )
}
