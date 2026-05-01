import { useState, useEffect, useCallback } from 'react'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import RobotScene from './components/RobotScene'
import DonationForm from './components/DonationForm'
import StatsPanel from './components/StatsPanel'
import DonationTicker from './components/DonationTicker'
import { useWebSocket } from './hooks/useWebSocket'
import { playDonationSound } from './hooks/useSoundEffects'
import { getThankYouMessage, speakMessage } from './hooks/useRobotVoice'
import './App.css'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID'

function getDanceTier(amount) {
  if (amount >= 50) return 'epic'
  if (amount >= 20) return 'large'
  if (amount >= 5) return 'medium'
  return 'small'
}

function App() {
  const [currentDonation, setCurrentDonation] = useState(null)
  const [danceTier, setDanceTier] = useState(null)
  const [speechMessage, setSpeechMessage] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [view, setView] = useState('donate')

  const wsUrl = `ws://${window.location.hostname}:3001`
  const { lastMessage, isConnected } = useWebSocket(wsUrl)

  const triggerDonation = useCallback((donation) => {
    const tier = getDanceTier(donation.amount)
    setCurrentDonation(donation)
    setDanceTier(tier)
    setRefreshTrigger((prev) => prev + 1)

    const message = getThankYouMessage(tier)
    setSpeechMessage(message)

    if (soundEnabled) playDonationSound(tier)
    if (voiceEnabled) setTimeout(() => speakMessage(message), 600)
  }, [soundEnabled, voiceEnabled])

  useEffect(() => {
    if (lastMessage?.type === 'DONATION_RECEIVED') {
      triggerDonation(lastMessage.donation)
    }
  }, [lastMessage, triggerDonation])

  const handleDonationSuccess = useCallback((donation) => {
    triggerDonation(donation)
  }, [triggerDonation])

  const handleDanceComplete = useCallback(() => {
    setCurrentDonation(null)
    setDanceTier(null)
    setSpeechMessage(null)
  }, [])

  return (
    <PayPalScriptProvider
      options={{
        'client-id': PAYPAL_CLIENT_ID,
        currency: 'SGD',
        intent: 'capture',
      }}
    >
      <div className="kiosk-app">
        {/* ===== TOP BAR ===== */}
        <header className="kiosk-header">
          <div className="header-left">
            <span className="logo">🤖</span>
            <div className="brand">
              <h1>DonateBot</h1>
              <span className="tagline">Fintech × Robotics Donation Kiosk</span>
            </div>
          </div>
          <div className="header-right">
            <div className={`status-pill ${isConnected ? 'online' : 'offline'}`}>
              <span className="status-dot" />
              {isConnected ? 'Live' : 'Offline'}
            </div>
            <button
              type="button"
              className={`icon-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              type="button"
              className={`icon-btn ${voiceEnabled ? 'active' : ''}`}
              onClick={() => setVoiceEnabled((v) => !v)}
              aria-label={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? '🗣️' : '🤐'}
            </button>
          </div>
        </header>

        {/* ===== MAIN KIOSK LAYOUT ===== */}
        <main className="kiosk-main">
          {/* LEFT: Robot 3D View */}
          <section className="kiosk-robot">
            <div className="robot-viewport">
              <RobotScene
                donation={currentDonation}
                danceTier={danceTier}
                speechMessage={speechMessage}
                onDanceComplete={handleDanceComplete}
              />
              {currentDonation && (
                <div className={`dance-badge tier-${danceTier}`}>
                  {danceTier === 'epic'
                    ? '🎉 EPIC!'
                    : danceTier === 'large'
                    ? '💃 Cabbage Patch!'
                    : danceTier === 'medium'
                    ? '🤖 Robot Groove!'
                    : '👏 Thank You!'}
                </div>
              )}
            </div>
            <div className="robot-info-strip">
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <span>Donate &amp; watch me dance!</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💡</span>
                <span>Bigger donations = bigger moves</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <span>Secure PayPal payments</span>
              </div>
            </div>
          </section>

          {/* RIGHT: Robot Screen — Donation UI */}
          <section className="kiosk-screen">
            <div className="screen-frame">
              <div className="screen-bezel">
                <div className="bezel-camera" />
                <span className="bezel-label">DonateBot Display</span>
              </div>
              <div className="screen-tabs">
                <button
                  type="button"
                  className={`tab ${view === 'donate' ? 'active' : ''}`}
                  onClick={() => setView('donate')}
                >
                  💳 Donate
                </button>
                <button
                  type="button"
                  className={`tab ${view === 'stats' ? 'active' : ''}`}
                  onClick={() => setView('stats')}
                >
                  📊 Progress
                </button>
              </div>
              <div className="screen-content">
                {view === 'donate' ? (
                  <DonationForm
                    onDonationSuccess={handleDonationSuccess}
                    onDonationError={(err) => console.error('Donation error:', err)}
                  />
                ) : (
                  <StatsPanel refreshTrigger={refreshTrigger} />
                )}
              </div>
            </div>
          </section>
        </main>

        {/* ===== BOTTOM TICKER ===== */}
        <DonationTicker refreshTrigger={refreshTrigger} />

        {/* ===== FOOTER ===== */}
        <footer className="kiosk-footer">
          <div className="footer-left">
            <span>DonateBot v1.0</span>
            <span className="sep">·</span>
            <span>PayPal Sandbox</span>
            <span className="sep">·</span>
            <span>SGD</span>
          </div>
          <div className="footer-right">
            <span>Fintech × Robotics</span>
            <span className="sep">·</span>
            <span>University Project Demo</span>
          </div>
        </footer>
      </div>
    </PayPalScriptProvider>
  )
}

export default App
