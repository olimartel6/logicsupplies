import { useState } from 'react'
import { Trophy, Heart, Send, Download, ArrowDownRight, MapPin, Flame } from 'lucide-react'
import config from '../../config'
import { Panel, SectionTitle, Label, Columns, Ring, Bar, Toast, frDate, Avatar } from './ui'

export default function Progress() {
  const gym = config.gym
  const [thread, setThread] = useState(gym.thread)
  const [draft, setDraft] = useState('')
  const [showAllVisits, setShowAllVisits] = useState(false)
  const [toast, setToast] = useState(null)

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600) }
  const locName = (id) => gym.locations.find(l => l.id === id)?.name || ''
  const maxWeek = Math.max(...gym.goal.weeks)

  const send = () => {
    if (!draft.trim()) return
    setThread(t => [...t, { id: Date.now(), from: 'me', at: "À l'instant", text: draft.trim() }])
    setDraft('')
    flash('Message envoyé à Maxime')
  }

  const visits = showAllVisits ? gym.visits : gym.visits.slice(0, 4)

  return (
    <div className="page-content">
      <Toast>{toast}</Toast>

      <div style={{ padding: '18px 0 14px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 700, color: 'var(--text)' }}>Progrès</h2>
        <p className="g-meta" style={{ marginTop: 5, lineHeight: 1.5 }}>
          Votre assiduité, vos mesures, le défi du mois et le lien direct avec votre entraîneur.
        </p>
      </div>

      {/* ---- Serie hebdomadaire ---- */}
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <Label>Assiduité</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
              <Flame size={17} color="var(--accent)" />
              <span className="g-num" style={{ fontSize: 24, color: 'var(--accent)' }}>{gym.goal.streakWeeks}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>semaines de suite</span>
            </div>
            <div className="g-meta" style={{ marginTop: 4 }}>
              Objectif de {gym.goal.sessionsPerWeek} séances par semaine · meilleure série : {gym.goal.bestStreak} semaines
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginTop: 18, height: 56 }}>
          {gym.goal.weeks.map((n, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: '100%', borderRadius: 4,
                height: Math.max(4, (n / maxWeek) * 40),
                background: n >= gym.goal.sessionsPerWeek
                  ? 'linear-gradient(180deg, var(--accent), var(--accent-dark))'
                  : 'rgba(var(--accent-rgb), 0.22)',
              }} />
              <span style={{ fontSize: 8.5, color: 'var(--text-muted)', fontWeight: 600 }}>{i === 11 ? 'Auj.' : `S${i + 1}`}</span>
            </div>
          ))}
        </div>
        <div className="g-meta" style={{ marginTop: 10 }}>
          Douze dernières semaines. Les barres pleines sont les semaines où l'objectif a été atteint.
        </div>
      </Panel>

      {/* ---- Visites par mois ---- */}
      <Panel>
        <Label>Visites par mois</Label>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 14px' }}>
          <span className="g-num" style={{ fontSize: 24, color: 'var(--accent)' }}>{gym.visitStats.thisMonth}</span>
          <span className="g-meta">ce mois-ci, contre {gym.visitStats.lastMonth} le mois dernier</span>
        </div>
        <Columns
          data={gym.visitStats.byMonth.map(m => ({ k: m.m, v: m.n }))}
          peakIndex={gym.visitStats.byMonth.reduce((b, m, i, a) => (m.n > a[b].n ? i : b), 0)}
          height={64}
        />
      </Panel>

      {/* ---- Defi du mois ---- */}
      <SectionTitle>Défi du mois</SectionTitle>
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Ring pct={(gym.challenge.myProgress / gym.challenge.target) * 100} size={70}>
            <div className="g-num" style={{ fontSize: 19, color: 'var(--accent)' }}>{gym.challenge.myProgress}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>/ {gym.challenge.target}</div>
          </Ring>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Trophy size={15} color="var(--accent)" />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{gym.challenge.name}</span>
            </div>
            <div className="g-meta" style={{ marginTop: 5, lineHeight: 1.5 }}>{gym.challenge.description}</div>
            <div className="g-label" style={{ marginTop: 7 }}>
              Se termine le {gym.challenge.endsOn} · {gym.challenge.participants} participants
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, paddingTop: 4 }}>
          {gym.challenge.leaderboard.map(row => (
            <div key={row.rank} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12, marginBottom: 4,
              background: row.isMe ? 'rgba(var(--accent-rgb), 0.10)' : 'transparent',
              border: row.isMe ? '1px solid rgba(var(--accent-rgb), 0.3)' : '1px solid transparent',
            }}>
              <span className="g-num" style={{
                width: 22, fontSize: 15, flexShrink: 0,
                color: row.isMe ? 'var(--accent)' : 'var(--text-muted)',
              }}>{row.rank}</span>
              <span style={{
                flex: 1, fontSize: 14, minWidth: 0,
                fontWeight: row.isMe ? 700 : 500,
                color: row.isMe ? 'var(--accent)' : 'var(--text)',
              }}>{row.name}</span>
              <div style={{ width: 82, flexShrink: 0 }}>
                <Bar pct={(row.value / gym.challenge.leaderboard[0].value) * 100} />
              </div>
              <span className="g-num" style={{ fontSize: 14, width: 22, textAlign: 'right', color: 'var(--text-light)', flexShrink: 0 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---- Mesures ---- */}
      <SectionTitle>Mesures</SectionTitle>
      <Panel>
        {gym.measures.map(m => (
          <div key={m.label} className="g-list-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</div>
              <div className="g-meta" style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                <ArrowDownRight size={12} color="var(--accent)" />{m.delta}
              </div>
            </div>
            <span className="g-num" style={{ fontSize: 19, color: 'var(--accent)', flexShrink: 0 }}>{m.value}</span>
          </div>
        ))}
        <div className="g-meta" style={{ marginTop: 12, lineHeight: 1.5 }}>
          Relevées à l'évaluation trimestrielle. La prochaine est prévue au début de décembre.
        </div>
      </Panel>

      {/* ---- Sante connectee ---- */}
      <SectionTitle>Santé connectée</SectionTitle>
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Heart size={17} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>Apple Santé</div>
            <div className="g-meta" style={{ marginTop: 2 }}>{gym.health.connected ? 'Connecté' : 'Non connecté'}</div>
          </div>
          <button className="g-btn g-btn-ghost" onClick={() => flash('Réglage de la synchronisation')}>Gérer</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {gym.health.metrics.map(m => (
            <div key={m.label} style={{ flex: 1, minWidth: 0, background: 'var(--bg-warm)', borderRadius: 12, padding: '13px 8px', textAlign: 'center' }}>
              <div className="g-num" style={{ fontSize: 16, color: 'var(--accent)' }}>{m.value}</div>
              <div className="g-label" style={{ marginTop: 5, fontSize: 8.5, letterSpacing: 0.8 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div className="g-meta" style={{ marginTop: 12, lineHeight: 1.5 }}>{gym.health.note}</div>
      </Panel>

      {/* ---- Historique de visites ---- */}
      <SectionTitle action={
        <button className="g-btn g-btn-ghost" onClick={() => flash('Historique envoyé à votre adresse courriel')}>
          <Download size={12} style={{ verticalAlign: '-2px', marginRight: 6 }} />Exporter
        </button>
      }>Historique de visites</SectionTitle>
      <Panel>
        {visits.map((v, i) => (
          <div key={i} className="g-list-row">
            <span style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><MapPin size={16} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v.kind}</div>
              <div className="g-meta" style={{ marginTop: 2 }}>
                {frDate(v.date)}, {v.time} · {locName(v.location)}
              </div>
            </div>
            <span className="g-num" style={{ fontSize: 14, color: 'var(--text-light)', flexShrink: 0 }}>{v.duration} min</span>
          </div>
        ))}
        {!showAllVisits && gym.visits.length > 4 && (
          <button className="g-btn g-btn-ghost" style={{ width: '100%', marginTop: 14 }} onClick={() => setShowAllVisits(true)}>
            Voir les {gym.visits.length} dernières visites
          </button>
        )}
        <div className="g-meta" style={{ marginTop: 14, lineHeight: 1.5 }}>
          {gym.visitStats.total} visites au total, {gym.visitStats.avgDuration} minutes en moyenne. Chaque entrée est enregistrée au lecteur, sans double comptage.
        </div>
      </Panel>

      {/* ---- Messages avec le coach ---- */}
      <SectionTitle>Votre entraîneur</SectionTitle>
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <Avatar photo={gym.coaches[0].photo} name={gym.coaches[0].name} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{gym.coaches[0].name}</div>
            <div className="g-meta" style={{ marginTop: 2 }}>{gym.coaches[0].role}</div>
          </div>
        </div>

        <div style={{ padding: '16px 0 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {thread.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '84%', padding: '12px 15px',
                borderRadius: m.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.from === 'me' ? 'rgba(var(--accent-rgb), 0.14)' : 'var(--bg-warm)',
                border: m.from === 'me' ? '1px solid rgba(var(--accent-rgb), 0.28)' : '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{m.text}</div>
                <div className="g-meta" style={{ marginTop: 6, fontSize: 10.5 }}>{m.at}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input
            className="g-input" style={{ paddingLeft: 16 }}
            value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Écrire à votre entraîneur"
          />
          <button
            onClick={send}
            style={{
              width: 48, flexShrink: 0, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Envoyer"
          ><Send size={17} /></button>
        </div>
      </Panel>
    </div>
  )
}
