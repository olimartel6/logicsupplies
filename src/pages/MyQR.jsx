import { useEffect, useState } from 'react'
import { mockClient } from '../data/mock'
import { Download, Share2 } from 'lucide-react'
import config from '../config'
import { getTier } from '../utils/tiers'

export default function MyQR({ client }) {
  const user = client || mockClient
  const tier = getTier(user.total_points_earned || 0)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    return () => {}
  }, [])

  return (
    <div className="page-content">
      <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
        {config.logo ? (
          <img src={config.logo} alt={config.businessName} style={{ height: 32, marginBottom: 6 }} />
        ) : (
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{config.businessName}</h2>
        )}
        <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>{user.name || 'Client'}</p>
      </div>

      <div className="gold-line" style={{ margin: '8px auto 12px' }} />

      <div style={{ textAlign: 'center', padding: '0 0 12px', position: 'relative' }}>
        <div style={{
          position: 'relative', display: 'inline-block', padding: 4,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dark), var(--accent-light), var(--accent))',
          backgroundSize: '300% 300%',
          animation: 'shimmer 6s ease infinite',
          borderRadius: 24,
          boxShadow: '0 24px 60px rgba(201,169,110,0.25), 0 8px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            padding: 16, background: '#FFFFFF', borderRadius: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(user.id || 'demo-client')}&margin=0`}
              alt="Mon QR Code"
              width={180}
              height={180}
              style={{ borderRadius: 10, display: 'block' }}
            />
          </div>
        </div>
      </div>

      <p style={{
        textAlign: 'center', fontSize: 12, color: 'var(--text-light)',
        fontWeight: 600, marginBottom: 10, lineHeight: 1.4,
      }}>
        Montrez ce code à la caisse pour accumuler vos points
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginBottom: 14 }}>
        <button
          className="btn btn-primary btn-small"
          style={{ width: 'auto', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          disabled={walletLoading}
          onClick={async () => {
            setWalletLoading(true);
            try {
              const { generateWalletPass } = await import('../services/supabase.js');
              const url = await generateWalletPass(user.id);
              if (url) {
                window.location.href = url;
              } else {
                alert('Erreur lors de la génération du pass. Réessayez.');
              }
            } finally {
              setWalletLoading(false);
            }
          }}
        >
          <img src="https://developer.apple.com/assets/elements/icons/wallet/wallet-96x96_2x.png" alt="" style={{ width: 18, height: 18 }} />
          {walletLoading ? 'Génération en cours…' : 'Ajouter à Apple Wallet'}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-accent btn-small"
            style={{ width: 'auto', padding: '7px 14px', fontSize: 12 }}
            onClick={async () => {
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(user.id || 'demo-client')}`;
              try {
                const resp = await fetch(qrUrl);
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `qr-${config.businessName.replace(/\s/g, '-')}.png`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                window.open(qrUrl, '_blank');
              }
            }}
          >
            <Download size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />Enregistrer le code
          </button>
          <button
            className="btn btn-secondary btn-small"
            style={{ width: 'auto', padding: '7px 14px', fontSize: 12 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Mon QR - ${config.businessName}`,
                  text: `Mon QR code fidélité ${config.businessName}`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
          >
            <Share2 size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />Partager
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{
          fontSize: 34, fontWeight: 800,
          color: 'var(--accent)', lineHeight: 1.1,
        }}>{user.points_balance || 0}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {config.pointsLabel}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '7px 14px', margin: '0 auto',
        background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-sm)',
        width: 'fit-content',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', letterSpacing: 0.3 }}>Niveau {tier.name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· points ×{String(tier.multiplier).replace('.', ',')}</span>
      </div>
    </div>
  )
}
