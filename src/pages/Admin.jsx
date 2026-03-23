import { useState } from 'react'
import { mockAllClients, mockPendingRedemptions } from '../data/mock'

export default function Admin({ onLogout }) {
  const [tab, setTab] = useState('clients')
  const [toast, setToast] = useState(null)
  const [addPointsClient, setAddPointsClient] = useState(null)
  const [pointsToAdd, setPointsToAdd] = useState('')
  const [amountSpent, setAmountSpent] = useState('')

  const totalPoints = mockAllClients.reduce((sum, c) => sum + c.points_balance, 0)
  const totalClients = mockAllClients.length

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddPoints = (client) => {
    if (addPointsClient?.id === client.id) {
      setAddPointsClient(null)
    } else {
      setAddPointsClient(client)
      setPointsToAdd('')
      setAmountSpent('')
    }
  }

  const submitPoints = () => {
    const pts = amountSpent ? parseInt(amountSpent) * 10 : parseInt(pointsToAdd)
    if (pts > 0) {
      showToast(`+${pts} points ajoutés à ${addPointsClient.name}`)
      setAddPointsClient(null)
    }
  }

  return (
    <div className="page-content" style={{ paddingTop: 0 }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ color: 'white', fontSize: 18 }}>Panneau Admin</h2>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Institut d'Épilation Laser</p>
          </div>
          <button className="btn btn-small" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', width: 'auto' }} onClick={onLogout}>
            Déconnexion
          </button>
        </div>

        <div className="admin-stats-grid">
          <div className="card admin-stat">
            <div className="admin-stat-number">{totalClients}</div>
            <div className="admin-stat-label">Clients</div>
          </div>
          <div className="card admin-stat">
            <div className="admin-stat-number">{totalPoints.toLocaleString()}</div>
            <div className="admin-stat-label">Points totaux</div>
          </div>
          <div className="card admin-stat">
            <div className="admin-stat-number">{mockPendingRedemptions.length}</div>
            <div className="admin-stat-label">En attente</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'clients' ? 'active' : ''}`} onClick={() => setTab('clients')}>
          Clients
        </button>
        <button className={`tab ${tab === 'redemptions' ? 'active' : ''}`} onClick={() => setTab('redemptions')}>
          Échanges
        </button>
        <button className={`tab ${tab === 'scan' ? 'active' : ''}`} onClick={() => setTab('scan')}>
          Scanner QR
        </button>
      </div>

      {tab === 'clients' && (
        <div className="card">
          {mockAllClients.map(client => (
            <div key={client.id}>
              <div className="client-row" onClick={() => handleAddPoints(client)} style={{ cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{client.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{client.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{client.points_balance} pts</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>depuis {client.created_at}</div>
                </div>
              </div>
              {addPointsClient?.id === client.id && (
                <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="input-group">
                    <label>Montant de l'achat ($)</label>
                    <input
                      type="number"
                      placeholder="Ex: 150 (= 1500 pts)"
                      value={amountSpent}
                      onChange={e => { setAmountSpent(e.target.value); setPointsToAdd('') }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Ou points manuels</label>
                    <input
                      type="number"
                      placeholder="Ex: 25"
                      value={pointsToAdd}
                      onChange={e => { setPointsToAdd(e.target.value); setAmountSpent('') }}
                    />
                  </div>
                  <button className="btn btn-success btn-small" onClick={submitPoints}>
                    Ajouter les points
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'redemptions' && (
        <div className="card">
          {mockPendingRedemptions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Aucun échange en attente</p>
          ) : (
            mockPendingRedemptions.map(r => (
              <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.client_name}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{r.reward}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.created_at} — {r.points_spent} pts</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-small" onClick={() => showToast(`${r.reward} confirmé pour ${r.client_name}`)}>
                    Confirmer
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => showToast(`Échange refusé`)}>
                    Refuser
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'scan' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
          <h3 style={{ marginBottom: 8 }}>Scanner un QR client</h3>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>
            Scannez le QR code du client pour valider sa visite ou enregistrer un achat.
          </p>
          <button className="btn btn-primary" onClick={() => showToast('Visite validée! +25 points')}>
            Simuler un scan (demo)
          </button>
        </div>
      )}
    </div>
  )
}
