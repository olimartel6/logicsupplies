import { useState, useEffect } from 'react'
import { Sparkles, DollarSign, Gem, Lock, X, PartyPopper, Timer } from 'lucide-react'
import confetti from 'canvas-confetti'
import config from '../config'
import { createRedemption, getClientById } from '../services/supabase'

function fireConfetti() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'var(--accent)'
  const accentDark = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark').trim() || 'var(--accent-dark)'
  const accentLight = getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim() || 'var(--accent-light)'
  const colors = [accent, accentDark, accentLight, '#FFFFFF']
  const end = Date.now() + 900
  ;(function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors, scalar: 1.1 })
}

const rewardIcons = {
  discount_percent: <Sparkles size={22} />,
  discount_fixed: <DollarSign size={22} />,
  free_service: <Gem size={22} />
}

export default function Rewards({ client, business, setClient }) {
  const [toast, setToast] = useState(null)
  const [redeeming, setRedeeming] = useState(null)
  const [redemptionQR, setRedemptionQR] = useState(null) // { code, rewardName, expiresAt }
  const [confirming, setConfirming] = useState(null) // recompense en attente de confirmation

  const rewards = (client?.id === 'demo' && config.rewards?.length > 0) ? config.rewards : ((business?.rewards && business.rewards.length > 0) ? business.rewards : config.rewards)

  useEffect(() => {
    return () => {}
  }, [redemptionQR])

  const handleRedeem = (reward) => {
    if (!client || client.points_balance < reward.points_required) return
    // Confirmation dans l'app : evite une boite de dialogue native au milieu d'une demo
    setConfirming(reward)
  }

  const doRedeem = async (reward) => {
    setRedeeming(reward.id)
    try {
      // Mode demo : aucun enregistrement cote serveur, mais l'echange doit
      // rester demontrable de bout en bout.
      if (client.id === 'demo' || !business?.id) {
        const code = 'DEMO' + Math.random().toString(36).slice(2, 6).toUpperCase()
        setClient({ ...client, points_balance: client.points_balance - reward.points_required })
        setRedemptionQR({
          code,
          rewardName: reward.name,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        })
        fireConfetti()
        return
      }
      const redemption = await createRedemption(business.id, client.id, reward.name, reward.points_required)
      const fresh = await getClientById(client.id)
      if (fresh) setClient(fresh)
      setRedemptionQR({
        code: redemption.redemption_code,
        rewardName: reward.name,
        expiresAt: redemption.expires_at,
      })
      fireConfetti()
    } catch (e) {
      setToast('Erreur: ' + (e.message || 'réessayez'))
      setTimeout(() => setToast(null), 3000)
    } finally {
      setRedeeming(null)
    }
  }

  // Countdown component
  const ExpiryTimer = ({ expiresAt }) => {
    const [remaining, setRemaining] = useState('')
    useEffect(() => {
      const tick = () => {
        const diff = new Date(expiresAt) - new Date()
        if (diff <= 0) { setRemaining('Expiré'); return }
        const min = Math.floor(diff / 60000)
        const sec = Math.floor((diff % 60000) / 1000)
        setRemaining(`${min}:${sec.toString().padStart(2, '0')}`)
      }
      tick()
      const interval = setInterval(tick, 1000)
      return () => clearInterval(interval)
    }, [expiresAt])
    return <span>{remaining}</span>
  }

  return (
    <div className="page-content">
      {toast && <div className="toast">{toast}</div>}

      {/* Confirmation */}
      {confirming && (
        <div
          onClick={() => setConfirming(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #FFFFFF)', border: '1px solid var(--border, transparent)',
              borderRadius: 24, padding: 30, maxWidth: 340, width: '100%', textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            }}
          >
            {confirming.image && (
              <img src={confirming.image} alt="" style={{
                width: 72, height: 72, borderRadius: 18, objectFit: 'cover', marginBottom: 16,
              }} />
            )}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
              {confirming.name}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 10, lineHeight: 1.5 }}>
              {confirming.points_required.toLocaleString('fr-CA')} points seront retirés de votre solde.
              Un code à présenter sur place sera généré immédiatement.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                className="btn btn-secondary btn-small" style={{ flex: 1 }}
                onClick={() => setConfirming(null)}
              >Annuler</button>
              <button
                className="btn btn-accent btn-small" style={{ flex: 1 }}
                onClick={() => { const r = confirming; setConfirming(null); doRedeem(r) }}
              >Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Redemption QR Modal */}
      {redemptionQR && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border, transparent)',
            borderRadius: 24, padding: 36,
            maxWidth: 360, width: '100%', textAlign: 'center',
            position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          }}>
            <button
              onClick={() => setRedemptionQR(null)}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 32, height: 32, borderRadius: '50%',
                border: '1px solid var(--border, rgba(0,0,0,0.08))', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-light)',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--accent)' }}><PartyPopper size={44} strokeWidth={1.6} /></div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Récompense prête!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>
              {redemptionQR.rewardName}
            </p>

            <div style={{
              display: 'inline-block', padding: 16,
              background: 'white', borderRadius: 16,
              border: '1px solid rgba(var(--accent-rgb, 201,169,110),0.2)',
              boxShadow: 'var(--shadow)',
              marginBottom: 16,
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(redemptionQR.code)}`}
                alt="QR Rédemption"
                width={200}
                height={200}
                style={{ borderRadius: 8 }}
              />
            </div>

            <div style={{
              background: 'var(--bg-warm)', borderRadius: 12, padding: '10px 16px',
              marginBottom: 12, fontSize: 22, fontWeight: 800, letterSpacing: 4,
              color: 'var(--accent-dark)',
            }}>
              {redemptionQR.code}
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5 }}>
              {config.redeemHint || 'Montrez ce QR à la caisse pour réclamer votre récompense'}
            </p>

            <div style={{
              marginTop: 12, fontSize: 13, fontWeight: 600,
              color: 'var(--warning)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
            }}>
              <Timer size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Expire dans <ExpiryTimer expiresAt={redemptionQR.expiresAt} />
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          Votre solde
        </div>
        <div style={{
          fontSize: 52, fontWeight: 800, marginTop: 4,
          color: 'var(--accent)',
        }}>
          {(client?.points_balance || 0).toLocaleString('fr-CA')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>points disponibles</div>
      </div>

      <div className="gold-line" style={{ margin: '16px auto 28px' }} />
      <div className="section-title">Récompenses</div>

      {rewards.map(reward => {
        const canRedeem = (client?.points_balance || 0) >= reward.points_required
        const progress = Math.min(100, ((client?.points_balance || 0) / reward.points_required) * 100)
        const remaining = reward.points_required - (client?.points_balance || 0)

        return (
          <div key={reward.id} className="reward-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              {reward.image ? (
                <img
                  src={reward.image}
                  alt={reward.name}
                  style={{
                    width: 52, height: 52, borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover', flexShrink: 0,
                    border: canRedeem ? '2px solid var(--accent)' : 'none',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
              ) : (
                <div style={{
                  width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: canRedeem ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'rgba(var(--accent-rgb, 201,169,110),0.10)',
                  color: canRedeem ? '#FFFFFF' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)', flexShrink: 0,
                }}>
                  {rewardIcons[reward.type] || <Gem size={22} />}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div className="reward-info">
                  <h3>{reward.name}</h3>
                  <p className="reward-points">{reward.points_required.toLocaleString()} points</p>
                </div>
                <div className="reward-progress">
                  <div
                    className={`reward-progress-bar${progress >= 100 ? ' complete' : progress >= 80 ? ' near-target' : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <button
              className={`btn ${canRedeem ? 'btn-accent' : 'btn-secondary'} btn-small`}
              style={{ marginTop: 16, width: '100%' }}
              disabled={!canRedeem || redeeming === reward.id}
              onClick={() => handleRedeem(reward)}
            >
              {redeeming === reward.id ? 'En cours...' : canRedeem ? (
                <>Échanger maintenant</>
              ) : (
                <><Lock size={14} /> Encore {remaining.toLocaleString('fr-CA')} points</>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
