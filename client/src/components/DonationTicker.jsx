import { useState, useEffect } from 'react'

export default function DonationTicker({ refreshTrigger }) {
  const [donations, setDonations] = useState([])

  useEffect(() => {
    fetch('/api/donations')
      .then((r) => r.json())
      .then(setDonations)
      .catch(() => {})
  }, [refreshTrigger])

  if (donations.length === 0) {
    return (
      <div className="ticker">
        <div className="ticker-label">LIVE</div>
        <div className="ticker-track">
          <span className="ticker-item">Be the first to donate! 🎉</span>
        </div>
      </div>
    )
  }

  const items = [...donations.slice(0, 10), ...donations.slice(0, 10)]

  return (
    <div className="ticker">
      <div className="ticker-label">LIVE</div>
      <div className="ticker-track">
        <div className="ticker-scroll">
          {items.map((d, i) => (
            <span key={`${d.orderID}-${i}`} className="ticker-item">
              <span className="ticker-donor">{d.donorName}</span>
              {' donated '}
              <span className="ticker-amount">S${d.amount.toFixed(2)}</span>
              {' to '}
              <span className="ticker-charity">{d.charity}</span>
              <span className="ticker-sep">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
