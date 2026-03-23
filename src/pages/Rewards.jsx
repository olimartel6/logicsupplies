import { useState } from 'react'
import { mockClient, mockRewards } from '../data/mock'

export default function Rewards() {
  const [toast, setToast] = useState(null)

  const handleRedeem = (reward) => {
    if (mockClient.points_balance >= reward.points_required) {
      setToast(`${reward.name} demandé!`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="page-content">
      {toast && <div className="toast">{toast}</div>}

      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Votre solde</p>
        <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)' }}>{mockClient.points_balance} pts</p>
      </div>

      <h3 className="section-title">Récompenses disponibles</h3>

      {mockRewards.map(reward => {
        const canRedeem = mockClient.points_balance >= reward.points_required
        const progress = Math.min(100, (mockClient.points_balance / reward.points_required) * 100)

        return (
          <div key={reward.id} className="reward-card">
            <div className="reward-info">
              <h3>{reward.name}</h3>
              <p className="reward-points">{reward.points_required} points requis</p>
              <div className="reward-progress">
                <div className="reward-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button
              className={`btn ${canRedeem ? 'btn-primary' : 'btn-secondary'} btn-small`}
              style={{ marginTop: 12 }}
              disabled={!canRedeem}
              onClick={() => handleRedeem(reward)}
            >
              {canRedeem ? 'Échanger' : `${reward.points_required - mockClient.points_balance} pts manquants`}
            </button>
          </div>
        )
      })}
    </div>
  )
}
