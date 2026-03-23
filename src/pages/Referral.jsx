import { useState } from 'react'
import QRCode from 'react-qr-code'
import { mockClient, mockReferrals } from '../data/mock'

export default function Referral() {
  const [copied, setCopied] = useState(false)
  const referralLink = `https://institutepilation.com/mes-points?ref=${mockClient.referral_code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-content">
      {copied && <div className="toast">Lien copié!</div>}

      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Parrainez vos amies</h2>
        <p style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 4 }}>
          Gagnez 75 points pour chaque amie qui s'inscrit!
        </p>
      </div>

      <div className="card">
        <p style={{ fontSize: 14, color: 'var(--text-light)', textAlign: 'center', marginBottom: 8 }}>
          Votre code de parrainage
        </p>
        <div className="referral-link-box">
          <div className="referral-code">{mockClient.referral_code}</div>
        </div>

        <div className="qr-container">
          <QRCode value={referralLink} size={160} />
        </div>

        <button className="btn btn-primary" onClick={handleCopy}>
          Copier le lien de parrainage
        </button>
      </div>

      <h3 className="section-title" style={{ marginTop: 20 }}>Mes parrainages</h3>
      <div className="card">
        {mockReferrals.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
            Aucun parrainage encore. Partagez votre lien!
          </p>
        ) : (
          mockReferrals.map((ref, i) => (
            <div key={i} className="client-row">
              <div>
                <div style={{ fontWeight: 600 }}>{ref.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ref.date}</div>
              </div>
              <span className={`badge ${ref.status === 'completed' ? 'badge-success' : 'badge-pending'}`}>
                {ref.status === 'completed' ? '+75 pts' : 'En attente'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
