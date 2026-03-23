import { mockClient, mockTransactions, mockRewards } from '../data/mock'

const typeLabels = { purchase: 'Achat', visit: 'Visite', referral: 'Parrainage', redemption: 'Échange' }

export default function Dashboard() {
  const nextReward = mockRewards.find(r => r.points_required > mockClient.points_balance)
  const progress = nextReward ? Math.min(100, (mockClient.points_balance / nextReward.points_required) * 100) : 100

  return (
    <div className="page-content">
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Bonjour,</p>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{mockClient.name}</h2>
      </div>

      <div className="points-display">
        <div className="points-number">{mockClient.points_balance}</div>
        <div className="points-label">points</div>
      </div>

      {nextReward && (
        <div className="card">
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 8 }}>
            Prochaine récompense
          </p>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>{nextReward.name}</p>
          <div className="reward-progress">
            <div className="reward-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {mockClient.points_balance} / {nextReward.points_required} points
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>
            {mockTransactions.filter(t => t.type === 'purchase').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Achats</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>
            {mockTransactions.filter(t => t.type === 'visit').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visites</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>
            {mockTransactions.filter(t => t.type === 'referral').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Parrainages</div>
        </div>
      </div>

      <h3 className="section-title">Historique</h3>
      <div className="card">
        {mockTransactions.map(t => (
          <div key={t.id} className="transaction-item">
            <div className="transaction-info">
              <div className={`transaction-type ${t.type}`}>{typeLabels[t.type]}</div>
              <div className="transaction-desc">{t.description}</div>
              <div className="transaction-date">{t.created_at}</div>
            </div>
            <div className={`transaction-points ${t.points >= 0 ? 'positive' : 'negative'}`}>
              {t.points >= 0 ? '+' : ''}{t.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
