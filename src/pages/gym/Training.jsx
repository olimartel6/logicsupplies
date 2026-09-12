import { useState, useMemo } from 'react'
import { Search, Plus, Timer, Dumbbell, TrendingUp, Check, X } from 'lucide-react'
import config from '../../config'
import { Panel, SectionTitle, Label, Intensity, Sheet, Toast, frDate } from './ui'

// Courbe de progression d'un record : une seule couleur de marque
function Spark({ data, w = 96, h = 30 }) {
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * (w - 4) + 2,
    h - 3 - ((v - min) / span) * (h - 8),
  ])
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill="var(--accent)" />
    </svg>
  )
}

export default function Training() {
  const gym = config.gym
  const [tab, setTab] = useState('lib')
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [dur, setDur] = useState(0)
  const [detail, setDetail] = useState(null)
  const [journal, setJournal] = useState(gym.journal)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', duration: '', exercise: '', sets: '', load: '' })
  const [toast, setToast] = useState(null)

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600) }

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return gym.workouts.filter(w => {
      if (type !== 'all' && w.type !== type) return false
      if (dur && w.duration > dur) return false
      if (!needle) return true
      return (w.name + ' ' + w.type + ' ' + w.summary + ' ' + w.equipment).toLowerCase().includes(needle)
    })
  }, [gym.workouts, q, type, dur])

  const startWorkout = (w) => {
    setJournal(j => [{
      id: 'n' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      name: w.name, duration: w.duration, location: gym.homeLocation, points: config.pointsPerVisit,
      exercises: w.blocks.flatMap(b => b.items.slice(0, 2).map(it => ({ name: it, sets: '—' }))).slice(0, 3),
    }, ...j])
    setDetail(null)
    setTab('journal')
    flash(`Séance enregistrée · +${config.pointsPerVisit} points`)
  }

  const saveManual = () => {
    if (!form.name.trim()) { flash('Donnez un nom à la séance') ; return }
    setJournal(j => [{
      id: 'm' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      name: form.name.trim(),
      duration: parseInt(form.duration) || 45,
      location: gym.homeLocation,
      points: config.pointsPerVisit,
      exercises: form.exercise.trim()
        ? [{ name: form.exercise.trim(), sets: form.sets.trim() || '—', load: form.load.trim() }]
        : [],
    }, ...j])
    setForm({ name: '', duration: '', exercise: '', sets: '', load: '' })
    setAddOpen(false)
    flash('Séance ajoutée à votre journal')
  }

  const locName = (id) => gym.locations.find(l => l.id === id)?.name || ''

  return (
    <div className="page-content">
      <Toast>{toast}</Toast>

      <div style={{ padding: '18px 0 14px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 700, color: 'var(--text)' }}>Entraînements</h2>
        <p className="g-meta" style={{ marginTop: 5, lineHeight: 1.5 }}>
          Des séances prêtes à suivre, votre journal personnel et vos records — tout sur le même écran.
        </p>
      </div>

      <div className="g-tabs">
        {[['lib', 'Bibliothèque'], ['journal', 'Mon journal'], ['records', 'Records']].map(([k, l]) => (
          <button key={k} className={`g-tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ================= BIBLIOTHEQUE ================= */}
      {tab === 'lib' && (
        <>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={16} style={{ position: 'absolute', left: 15, top: 15, color: 'var(--text-muted)' }} />
            <input
              className="g-input" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Chercher une séance, un format, un équipement"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              ><X size={16} /></button>
            )}
          </div>

          <div className="g-scroll-x" style={{ marginBottom: 10 }}>
            <button className={`g-chip${type === 'all' ? ' active' : ''}`} onClick={() => setType('all')}>Tous les formats</button>
            {gym.workoutFilters.types.map(t => (
              <button key={t} className={`g-chip${type === t ? ' active' : ''}`} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
          <div className="g-scroll-x" style={{ marginBottom: 18 }}>
            <button className={`g-chip${dur === 0 ? ' active' : ''}`} onClick={() => setDur(0)}>Toutes les durées</button>
            {gym.workoutFilters.durations.map(d => (
              <button key={d} className={`g-chip${dur === d ? ' active' : ''}`} onClick={() => setDur(d)}>{d} min ou moins</button>
            ))}
          </div>

          <SectionTitle action={<span className="g-meta">{results.length} séance{results.length > 1 ? 's' : ''}</span>}>
            Séances disponibles
          </SectionTitle>

          {results.length === 0 && (
            <Panel><div className="g-meta" style={{ textAlign: 'center', padding: '18px 0' }}>
              Aucune séance ne correspond à cette recherche. Essayez un autre format ou une durée plus longue.
            </div></Panel>
          )}

          {results.map(w => (
            <Panel key={w.id} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ display: 'flex' }} onClick={() => setDetail(w)}>
                <img src={w.image} alt="" style={{ width: 104, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '15px 16px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span className="g-num" style={{ fontSize: 16, color: 'var(--accent)' }}>{w.duration} min</span>
                    <span className="g-meta">{w.type}</span>
                    <Intensity level={w.intensity} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>{w.name}</div>
                  <div className="g-meta" style={{ marginTop: 5, lineHeight: 1.45 }}>{w.summary}</div>
                  <div className="g-label" style={{ marginTop: 7 }}>{w.level} · {w.equipment}</div>
                </div>
              </div>
            </Panel>
          ))}
        </>
      )}

      {/* ================= JOURNAL ================= */}
      {tab === 'journal' && (
        <>
          <button className="g-cta" style={{ marginBottom: 18 }} onClick={() => setAddOpen(true)}>
            <Plus size={18} strokeWidth={2.6} />Ajouter une séance
          </button>

          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            {[
              { v: journal.length, l: 'Séances notées' },
              { v: `${Math.round(journal.reduce((s, j) => s + j.duration, 0) / Math.max(1, journal.length))} min`, l: 'Durée moyenne' },
              { v: journal.reduce((s, j) => s + (j.points || 0), 0), l: 'Points gagnés' },
            ].map(x => (
              <div key={x.l} style={{ flex: 1, background: 'var(--bg-warm)', borderRadius: 14, padding: '16px 10px', textAlign: 'center' }}>
                <div className="g-num" style={{ fontSize: 22, color: 'var(--accent)' }}>{x.v}</div>
                <div className="g-label" style={{ marginTop: 6 }}>{x.l}</div>
              </div>
            ))}
          </div>

          <SectionTitle>Historique</SectionTitle>
          {journal.map(j => (
            <Panel key={j.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{j.name}</div>
                  <div className="g-meta" style={{ marginTop: 3 }}>
                    {frDate(j.date)} · {j.duration} min · {locName(j.location)}
                  </div>
                </div>
                <span className="g-num" style={{ fontSize: 16, color: 'var(--accent)', flexShrink: 0 }}>+{j.points}</span>
              </div>
              {j.exercises.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 4 }}>
                  {j.exercises.map((e, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 0', borderTop: '1px solid var(--border)',
                    }}>
                      <Dumbbell size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text)', minWidth: 0 }}>{e.name}</span>
                      <span className="g-num" style={{ fontSize: 13, color: 'var(--text-light)', flexShrink: 0 }}>{e.sets}</span>
                      {e.load && <span className="g-num" style={{ fontSize: 13, color: 'var(--accent)', flexShrink: 0 }}>{e.load}</span>}
                    </div>
                  ))}
                  {j.exercises.some(e => e.note) && (
                    <div className="g-meta" style={{ marginTop: 8, fontStyle: 'italic' }}>
                      {j.exercises.filter(e => e.note).map(e => e.note).join(' · ')}
                    </div>
                  )}
                </div>
              )}
            </Panel>
          ))}
        </>
      )}

      {/* ================= RECORDS ================= */}
      {tab === 'records' && (
        <>
          <SectionTitle action={<span className="g-meta">Mis à jour à chaque séance</span>}>Records personnels</SectionTitle>
          {gym.records.map(r => (
            <Panel key={r.lift}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{r.lift}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                    <span className="g-num" style={{ fontSize: 27, color: 'var(--accent)' }}>
                      {String(r.value).replace('.', ',')}
                    </span>
                    <span className="g-meta">{r.unit}</span>
                  </div>
                  <div className="g-meta" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <TrendingUp size={12} color="var(--accent)" />{r.delta}
                  </div>
                  <div className="g-label" style={{ marginTop: 6 }}>Établi le {r.date}</div>
                </div>
                <Spark data={r.history} />
              </div>
            </Panel>
          ))}
          <Panel>
            <div className="g-meta" style={{ lineHeight: 1.55 }}>
              Un record s'ajoute automatiquement dès qu'une charge notée dans le journal dépasse la précédente. Maxime reçoit une notification et ajuste le plan en conséquence.
            </div>
          </Panel>
        </>
      )}

      {/* ---- Detail d'une seance ---- */}
      <Sheet
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name}
        subtitle={detail && `${detail.duration} minutes · ${detail.type} · ${detail.level}`}
      >
        {detail && (
          <>
            <img src={detail.image} alt="" style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 16, marginBottom: 16 }} />
            <div className="g-meta" style={{ lineHeight: 1.55, marginBottom: 18 }}>{detail.summary}</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { k: 'Durée', v: `${detail.duration} min` },
                { k: 'Intensité', v: `${detail.intensity} sur 3` },
                { k: 'Matériel', v: detail.equipment },
              ].map(x => (
                <div key={x.k} style={{ flex: 1, background: 'var(--bg-warm)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.3 }}>{x.v}</div>
                  <div className="g-label" style={{ marginTop: 5 }}>{x.k}</div>
                </div>
              ))}
            </div>
            {detail.blocks.map(b => (
              <div key={b.name} style={{ marginBottom: 18 }}>
                <Label style={{ color: 'var(--accent)' }}>{b.name}</Label>
                <div style={{ marginTop: 8 }}>
                  {b.items.map((it, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 13.5, color: 'var(--text)' }}>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button className="g-cta" onClick={() => startWorkout(detail)}>
              <Timer size={18} strokeWidth={2.4} />Commencer la séance
            </button>
          </>
        )}
      </Sheet>

      {/* ---- Ajout manuel ---- */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter une séance"
        subtitle="Notez ce que vous avez fait, même en dehors des programmes du gym."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Label>Nom de la séance</Label>
            <input className="g-input" style={{ paddingLeft: 16, marginTop: 7 }} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Force — Haut du corps" />
          </div>
          <div>
            <Label>Durée en minutes</Label>
            <input className="g-input" style={{ paddingLeft: 16, marginTop: 7 }} value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="45" inputMode="numeric" />
          </div>
          <div>
            <Label>Premier exercice</Label>
            <input className="g-input" style={{ paddingLeft: 16, marginTop: 7 }} value={form.exercise}
              onChange={e => setForm({ ...form, exercise: e.target.value })} placeholder="Développé couché" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Label>Séries</Label>
              <input className="g-input" style={{ paddingLeft: 16, marginTop: 7 }} value={form.sets}
                onChange={e => setForm({ ...form, sets: e.target.value })} placeholder="4 × 6" />
            </div>
            <div style={{ flex: 1 }}>
              <Label>Charge</Label>
              <input className="g-input" style={{ paddingLeft: 16, marginTop: 7 }} value={form.load}
                onChange={e => setForm({ ...form, load: e.target.value })} placeholder="75 kg" />
            </div>
          </div>
          <button className="g-cta" style={{ marginTop: 8 }} onClick={saveManual}>
            <Check size={18} strokeWidth={2.6} />Enregistrer la séance
          </button>
        </div>
      </Sheet>
    </div>
  )
}
