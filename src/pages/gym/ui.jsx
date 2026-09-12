// Petits composants partages par les pages de la verticale gym.
import { useEffect } from 'react'
import { X } from 'lucide-react'

export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 6 }}>
      <div className="section-title" style={{ marginBottom: 0 }}>{children}</div>
      {action}
    </div>
  )
}

export function Panel({ children, tight, style }) {
  return <div className={`g-panel${tight ? ' g-panel-tight' : ''}`} style={style}>{children}</div>
}

export function Label({ children, style }) {
  return <div className="g-label" style={style}>{children}</div>
}

// Serie de points : n points allumes sur total
export function Dots({ on, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`g-dot${i < on ? ' on' : ''}`} />
      ))}
    </div>
  )
}

// Intensite d'un cours : trois barres, une seule couleur
export function Intensity({ level }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 11 }} title={`Intensité ${level} sur 3`}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          width: 3, height: 3 + i * 3, borderRadius: 1,
          background: i <= level ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.2)',
        }} />
      ))}
    </span>
  )
}

// Barre de progression simple
export function Bar({ pct }) {
  return (
    <div className="g-bar-track">
      <div className="g-bar-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

// Histogramme vertical, une seule couleur de marque, sommet mis en valeur
export function Columns({ data, height = 64, peakIndex }) {
  const max = Math.max(...data.map(d => d.v), 1)
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: height + 20 }}>
      {data.map((d, i) => (
        <div key={i} className="g-col">
          <div
            className={`g-col-bar${i === peakIndex ? ' peak' : ''}`}
            style={{ height: Math.max(3, (d.v / max) * height) }}
          />
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{d.k}</span>
        </div>
      ))}
    </div>
  )
}

// Anneau de progression
export function Ring({ pct, size = 64, stroke = 6, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(100, pct))
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(var(--accent-rgb), 0.16)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)"
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(c * p) / 100} ${c}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
      }}>{children}</div>
    </div>
  )
}

// Feuille modale montante
export function Sheet({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="g-sheet-backdrop" onClick={onClose}>
      <div className="g-sheet" onClick={e => e.stopPropagation()}>
        <div className="g-sheet-grip" />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div>
            {title && <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>{title}</div>}
            {subtitle && <div className="g-meta" style={{ marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-light)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          ><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Portrait d'un entraineur, avec repli sur ses initiales quand la photo manque
export function Avatar({ photo, name, size = 46 }) {
  if (photo) {
    return <img src={photo} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block' }} />
  }
  const initials = (name || '')
    .split(/[\s-]+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('')
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(var(--accent-rgb), 0.14)',
      border: '1px solid rgba(var(--accent-rgb), 0.32)',
      color: 'var(--accent)', fontFamily: 'var(--font-display)',
      fontSize: Math.round(size * 0.36), fontWeight: 600, letterSpacing: 0.5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{initials}</span>
  )
}

export function Toast({ children }) {
  if (!children) return null
  return <div className="toast" style={{ color: '#FFFFFF' }}>{children}</div>
}

export function Stat({ value, label, hint }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, background: 'var(--bg-warm)', borderRadius: 14,
      padding: '16px 12px', textAlign: 'center',
    }}>
      <div className="g-num" style={{ fontSize: 25, color: 'var(--accent)' }}>{value}</div>
      <div className="g-label" style={{ marginTop: 6 }}>{label}</div>
      {hint && <div className="g-meta" style={{ marginTop: 4, fontSize: 10.5 }}>{hint}</div>}
    </div>
  )
}

export const frDate = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })
