import { useState, useEffect } from 'react'

export default function StatsPanel({ refreshTrigger }) {
  const [stats, setStats] = useState(null)
  const [donations, setDonations] = useState([])

  async function fetchData() {
    try {
      const [statsRes, donationsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/donations'),
      ])
      setStats(await statsRes.json())
      setDonations(await donationsRes.json())
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  if (!stats) return null

  return (
    <div className="stats-panel">
      <h2>Donation Progress</h2>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(stats.goalProgress, 100)}%` }}
          />
        </div>
        <div className="progress-text">
          <span>S${stats.totalAmount.toFixed(2)}</span>
          <span>Goal: S${stats.goalAmount.toFixed(2)}</span>
        </div>
      </div>

      {stats.goalReached && (
        <div className="goal-reached">🎉 Goal Reached! Thank you everyone!</div>
      )}

      {/* Quick stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalDonations}</div>
          <div className="stat-label">Donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">S${stats.totalAmount.toFixed(2)}</div>
          <div className="stat-label">Total Raised</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.goalProgress.toFixed(0)}%</div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      {/* Recent donations */}
      {donations.length > 0 && (
        <div className="recent-donations">
          <h3>Recent Donations</h3>
          <ul>
            {donations.slice(0, 5).map((d, i) => (
              <li key={d.orderID || i} className="donation-item">
                <div className="donation-info">
                  <span className="donor-name">{d.donorName}</span>
                  <span className="donation-charity">{d.charity}</span>
                </div>
                <span className="donation-amount">S${d.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
