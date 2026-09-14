let audioContext = null
let audioBuffers = {}

// Initialize Web Audio API
export const initAudio = () => {
  if (typeof window === 'undefined') return
  
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
}

// Create subtle UI sound
const createSound = (frequency, duration) => {
  if (!audioContext) return
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.value = frequency
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.03, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}

export const playHoverSound = () => {
  createSound(800, 0.05) // Subtle high-frequency click
}

export const playClickSound = () => {
  createSound(600, 0.08) // Slightly lower, longer
}
