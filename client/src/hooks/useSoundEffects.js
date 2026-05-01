// Generate sound effects using Web Audio API — no audio files needed

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  if (!audioCtx) return
  // Resume context if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime)

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.start()
  oscillator.stop(audioCtx.currentTime + duration)
}

function playSequence(notes, interval = 0.15) {
  notes.forEach(([freq, dur, type], i) => {
    setTimeout(() => playTone(freq, dur, type || 'sine', 0.25), i * interval * 1000)
  })
}

export function playSmallDonation() {
  // Simple happy "ding ding"
  playSequence([
    [800, 0.15, 'sine'],
    [1000, 0.2, 'sine'],
  ], 0.12)
}

export function playMediumDonation() {
  // Cheerful ascending notes
  playSequence([
    [600, 0.12, 'sine'],
    [750, 0.12, 'sine'],
    [900, 0.15, 'sine'],
    [1100, 0.25, 'sine'],
  ], 0.1)
}

export function playLargeDonation() {
  // Triumphant fanfare
  playSequence([
    [500, 0.15, 'square'],
    [600, 0.12, 'square'],
    [750, 0.12, 'square'],
    [900, 0.15, 'square'],
    [1100, 0.3, 'sine'],
    [1100, 0.3, 'sine'],
  ], 0.12)
}

export function playEpicDonation() {
  // Full celebration — fanfare + sparkle
  playSequence([
    [400, 0.15, 'square'],
    [500, 0.1, 'square'],
    [600, 0.1, 'square'],
    [800, 0.15, 'square'],
    [1000, 0.2, 'sine'],
    [1200, 0.15, 'sine'],
    [1400, 0.15, 'sine'],
    [1600, 0.4, 'sine'],
  ], 0.1)
}

export function playDonationSound(tier) {
  switch (tier) {
    case 'small': return playSmallDonation()
    case 'medium': return playMediumDonation()
    case 'large': return playLargeDonation()
    case 'epic': return playEpicDonation()
    default: return playSmallDonation()
  }
}
