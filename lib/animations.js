// Reusable Framer Motion variants

export const blurReveal = {
  hidden: {
    opacity: 0,
    filter: "blur(20px)",
    scale: 1.05,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const imageReveal = {
  hidden: {
    opacity: 0,
    filter: "blur(10px) brightness(1.1)",
    scale: 1.03,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px) brightness(1)",
    scale: 1,
    transition: {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    }
  }
}

export const textOverlayReveal = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.4,
      ease: [0.22, 1, 0.36, 1],
    }
  }
}

export const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    }
  }
}

export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export const fadeIn = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
}