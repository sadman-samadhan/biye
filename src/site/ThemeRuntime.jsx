'use client'

import { MotionConfig } from 'framer-motion'

/** Client-side motion settings for a themed page: respects "reduce motion". */
export default function ThemeRuntime({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
