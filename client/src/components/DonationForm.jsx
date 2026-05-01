import { useState } from 'react'
import { PayPalButtons } from '@paypal/react-paypal-js'

const CHARITIES = [
  { id: 'education', name: 'Education for All', icon: '📚', desc: 'Fund school supplies & scholarships' },
  { id: 'environment', name: 'Green Earth Fund', icon: '🌱', desc: 'Plant trees & clean oceans' },
  { id: 'health', name: 'Community Health', icon: '🏥', desc: 'Support local clinics & care' },
  { id: 'animals', name: 'Animal Shelter', icon: '🐾', desc: 'Rescue & care for animals' },
]

const QUICK_AMOUNTS = [2, 5, 10, 20, 50]

export default function DonationForm({ onDonationSuccess, onDonationError }) {
  const [amount, setAmount] = useState('')
  const [charity, setCharity] = useState(CHARITIES[0])
  const [donorName, setDonorName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const isValidAmount = amount && parseFloat(amount) >= 1

  const tierLabel = isValidAmount
    ? parseFloat(amount) >= 50
      ? { text: '🎉 Epic Celebration!', cls: 'tier-epic' }
      : parseFloat(amount) >= 20
      ? { text: '💃 Cabbage Patch Dance!', cls: 'tier-large' }
      : parseFloat(amount) >= 5
      ? { text: '🤖 Robot Groove!', cls: 'tier-medium' }
      : { text: '👏 Happy Nod!', cls: 'tier-small' }
    : null

  return (
    <div className="donation-form">
      {/* Step 1: Charity */}
      <div className="form-step">
        <div className="step-header">
          <span className="step-num">1</span>
          <span>Choose a cause</span>
        </div>
        <div className="charity-grid">
          {CHARITIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`charity-card ${charity.id === c.id ? 'selected' : ''}`}
              onClick={() => setCharity(c)}
            >
              <span className="charity-icon">{c.icon}</span>
              <div className="charity-text">
                <span className="charity-name">{c.name}</span>
                <span className="charity-desc">{c.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Name */}
      <div className="form-step">
        <div className="step-header">
          <span className="step-num">2</span>
          <span>Your name <span className="optional">(optional)</span></span>
        </div>
        <input
          type="text"
          placeholder="Anonymous"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          className="text-input"
        />
      </div>

      {/* Step 3: Amount (quick buttons only) */}
      <div className="form-step">
        <div className="step-header">
          <span className="step-num">3</span>
          <span>Donation amount</span>
        </div>
        <div className="quick-amounts">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              className={`quick-amount ${parseFloat(amount) === a ? 'selected' : ''}`}
              onClick={() => setAmount(String(a))}
            >
              S${a}
            </button>
          ))}
        </div>
      </div>

      {/* Dance tier preview */}
      {tierLabel && (
        <div className={`dance-preview ${tierLabel.cls}`}>
          <span>{tierLabel.text}</span>
        </div>
      )}

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* PayPal */}
      {isValidAmount && (
        <div className="paypal-container">
          <PayPalButtons
            style={{
              layout: 'horizontal',
              color: 'gold',
              shape: 'pill',
              label: 'donate',
              tagline: false,
            }}
            disabled={processing}
            createOrder={async () => {
              setError(null)
              setProcessing(true)
              try {
                const res = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: parseFloat(amount).toFixed(2),
                    charity: charity.name,
                  }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to create order')
                return data.id
              } catch (err) {
                setError(err.message)
                setProcessing(false)
                throw err
              }
            }}
            onApprove={async (data) => {
              try {
                const res = await fetch(`/api/orders/${data.orderID}/capture`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    charity: charity.name,
                    donorName: donorName || 'Anonymous',
                  }),
                })
                const result = await res.json()
                if (!res.ok) throw new Error(result.error || 'Failed to capture order')
                setProcessing(false)
                setAmount('')
                setDonorName('')
                if (onDonationSuccess) onDonationSuccess(result.donation)
              } catch (err) {
                setError(err.message)
                setProcessing(false)
                if (onDonationError) onDonationError(err)
              }
            }}
            onError={() => {
              setError('Payment failed. Please try again.')
              setProcessing(false)
            }}
            onCancel={() => setProcessing(false)}
          />
        </div>
      )}
    </div>
  )
}
