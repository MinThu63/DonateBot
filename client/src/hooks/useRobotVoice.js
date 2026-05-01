// Robot voice using Web Speech API

const MESSAGES = {
  small: [
    "Thank you!",
    "You're kind!",
    "Appreciate it!",
    "That helps!",
    "Yay, a donation!",
  ],
  medium: [
    "Wow, thank you so much!",
    "You're making a difference!",
    "That's really generous!",
    "Amazing, thank you!",
    "You rock!",
  ],
  large: [
    "Oh my gosh, incredible!",
    "You are a superstar!",
    "What an amazing donation!",
    "The community thanks you!",
    "You're a true hero!",
  ],
  epic: [
    "Unbelievable! You are legendary!",
    "This is the most amazing thing ever!",
    "You just changed lives! Thank you!",
    "Standing ovation for you!",
    "The world needs more people like you!",
  ],
}

const IDLE_GREETINGS = [
  "Hello there!",
  "Hey, come say hi!",
  "Want to make someone's day?",
  "Every little bit helps!",
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getThankYouMessage(tier) {
  return pickRandom(MESSAGES[tier] || MESSAGES.small)
}

export function getIdleGreeting() {
  return pickRandom(IDLE_GREETINGS)
}

export function speakMessage(text, rate = 1.0, pitch = 1.4) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch // Higher pitch = more robotic/cute
  utterance.volume = 0.8

  // Try to pick a robotic-sounding voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(
    (v) => v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('English')
  )
  if (preferred) utterance.voice = preferred

  window.speechSynthesis.speak(utterance)
}
