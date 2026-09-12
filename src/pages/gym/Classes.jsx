import { useState, useMemo } from 'react'
import { Clock, MapPin, Users, Check, CalendarPlus, UserCheck, ChevronRight } from 'lucide-react'
import config from '../../config'
import { DAYS, DAYS_SHORT } from '../../data/gymTemplate'
import { Panel, SectionTitle, Label, Intensity, Sheet, Toast, Bar } from './ui'

// Numero de jour (0 = lundi) pour aujourd'hui
const todayIdx = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 }

// Date du mois pour le jour i de la semaine en cours (0 = lundi)
const dateOf = (i) => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - todayIdx())
  monday.setDate(monday.getDate() + i)
  return monday.getDate()
}

export default function Classes() {
  const gym = config.gym
  const [day, setDay] = useState(todayIdx())
  const [loc, setLoc] = useState('all')
  const [booked, setBooked] = useState(gym.booked)
  const [waitlist, setWaitlist] = useState([])
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600) }
  const coachOf = (id) => gym.coaches.find(c => c.id === id)
  const locOf = (id) => gym.locations.find(l => l.id === id)

  const list = useMemo(
    () => gym.classes.filter(c => c.day === day && (loc === 'all' || c.location === loc)),
    [gym.classes, day, loc]
  )

  const myBookings = gym.classes.filter(c => booked.includes(c.id))

  const dayLabel = (i) => {
    const t = todayIdx()
    if (i === t) return "Aujourd'hui"
    if (i === (t + 1) % 7) return 'Demain'
    return DAYS[i]
  }

  const reserve = (c) => {
    const full = c.taken + (booked.includes(c.id) ? 0 : 0) >= c.capacity
    if (booked.includes(c.id)) {
      setBooked(b => b.filter(x => x !== c.id))
      flash('Réservation annulée')
      return
    }
    if (full) {
      if (waitlist.includes(c.id)) {
        setWaitlist(w => w.filter(x => x !== c.id))
        flash("Retiré de la liste d'attente")
      } else {
        setWaitlist(w => [...w, c.id])
        flash("Ajouté à la liste d'attente — vous serez prévenu par notification")
      }
      return
    }
    setBooked(b => [...b, c.id])
    flash(`Réservé · +${config.pointsPerClass} points après le cours`)
  }

  return (
    <div className="page-content">
      <Toast>{toast}</Toast>

      <div style={{ padding: '18px 0 4px' }}>
        <h2 style={{ fontSize: 23, fontWeight: 700, color: 'var(--text)' }}>Horaire</h2>
        <p className="g-meta" style={{ marginTop: 5, lineHeight: 1.5 }}>
          Réservez, annulez ou inscrivez-vous à la liste d'attente. Chaque cours suivi vaut {config.pointsPerClass} points.
        </p>
      </div>

      {/* ---- Mes reservations ---- */}
      {myBookings.length > 0 && (
        <>
          <SectionTitle action={<span className="g-meta">{myBookings.length} à venir</span>}>Mes réservations</SectionTitle>
          <Panel tight>
            {myBookings.map(c => (
              <div key={c.id} className="g-list-row">
                <img src={c.image} alt="" className="g-thumb" style={{ width: 46, height: 46 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                  <div className="g-meta" style={{ marginTop: 2 }}>
                    {DAYS[c.day]} {c.time} · {locOf(c.location)?.name}
                  </div>
                </div>
                <button className="g-btn g-btn-ghost" onClick={() => reserve(c)}>Annuler</button>
              </div>
            ))}
          </Panel>
        </>
      )}

      {/* ---- Selecteur de jour ---- */}
      <div className="g-scroll-x" style={{ margin: '18px 0 14px' }}>
        {DAYS_SHORT.map((d, i) => (
          <button key={d} className={`g-day${i === day ? ' active' : ''}`} onClick={() => setDay(i)}>
            <div className="g-day-name">{d}</div>
            <div className="g-day-num">{dateOf(i)}</div>
          </button>
        ))}
      </div>

      {/* ---- Filtre succursale ---- */}
      <div className="g-scroll-x" style={{ marginBottom: 18 }}>
        <button className={`g-chip${loc === 'all' ? ' active' : ''}`} onClick={() => setLoc('all')}>Toutes les succursales</button>
        {gym.locations.map(l => (
          <button key={l.id} className={`g-chip${loc === l.id ? ' active' : ''}`} onClick={() => setLoc(l.id)}>{l.name}</button>
        ))}
      </div>

      <SectionTitle action={<span className="g-meta">{list.length} cours</span>}>{dayLabel(day)}</SectionTitle>

      {list.length === 0 && (
        <Panel><div className="g-meta" style={{ textAlign: 'center', padding: '18px 0' }}>Aucun cours ce jour-là à cette succursale.</div></Panel>
      )}

      {list.map(c => {
        const isBooked = booked.includes(c.id)
        const isWait = waitlist.includes(c.id)
        const left = c.capacity - c.taken
        const full = left <= 0
        const fillPct = (c.taken / c.capacity) * 100
        return (
          <Panel key={c.id} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', cursor: 'pointer' }} onClick={() => setDetail(c)}>
              <img src={c.image} alt="" style={{ width: 104, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '15px 16px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span className="g-num" style={{ fontSize: 17, color: 'var(--accent)' }}>{c.time}</span>
                  <span className="g-meta">{c.duration} min</span>
                  <Intensity level={c.intensity} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>{c.name}</div>
                <div className="g-meta" style={{ marginTop: 4 }}>{coachOf(c.coach)?.name} · {locOf(c.location)?.name}</div>
                <div className="g-meta" style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={11} />
                  {full ? 'Complet' : `${left} place${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''}`} sur {c.capacity}
                </div>
              </div>
            </div>
            <div style={{ padding: '0 16px 14px' }}>
              <Bar pct={fillPct} />
              <button
                className={`g-btn${isBooked || (full && !isWait) ? ' g-btn-ghost' : ''}`}
                style={{ width: '100%', marginTop: 12, padding: '12px 18px', fontSize: 13 }}
                onClick={() => reserve(c)}
              >
                {isBooked ? <><Check size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Réservé — annuler</>
                  : isWait ? "Sur la liste d'attente — se retirer"
                  : full ? "S'inscrire à la liste d'attente"
                  : 'Réserver ce cours'}
              </button>
            </div>
          </Panel>
        )
      })}

      {/* ---- Rendez-vous prives ---- */}
      <SectionTitle>Rendez-vous privé</SectionTitle>
      <Panel>
        <div className="g-meta" style={{ marginBottom: 6, lineHeight: 1.5 }}>{gym.appointments.intro}</div>
        {gym.appointments.slots.map(s => (
          <div key={s.id} className="g-list-row">
            <img src={coachOf(s.coach)?.photo} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.label}</div>
              <div className="g-meta" style={{ marginTop: 2 }}>
                {s.day} {s.time} · {s.duration} min · {coachOf(s.coach)?.name}
              </div>
              <div className="g-label" style={{ marginTop: 4, color: 'var(--accent)' }}>
                {s.included ? 'Incluse avec votre abonnement' : s.price}
              </div>
            </div>
            <button className="g-btn" onClick={() => flash('Demande envoyée — ' + coachOf(s.coach)?.name.split(' ')[0] + ' confirme dans les prochaines heures')}>
              <CalendarPlus size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Réserver
            </button>
          </div>
        ))}
      </Panel>

      {/* ---- Detail d'un cours ---- */}
      <Sheet
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name}
        subtitle={detail && `${DAYS[detail.day]} ${detail.time} · ${detail.duration} minutes · ${locOf(detail.location)?.name}`}
      >
        {detail && (
          <>
            <img src={detail.image} alt="" style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 16, marginBottom: 18 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[
                { k: 'Format', v: detail.type },
                { k: 'Intensité', v: `${detail.intensity} sur 3` },
                { k: 'Places', v: `${Math.max(0, detail.capacity - detail.taken)} sur ${detail.capacity}` },
              ].map(x => (
                <div key={x.k} style={{ flex: 1, background: 'var(--bg-warm)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent)' }}>{x.v}</div>
                  <div className="g-label" style={{ marginTop: 4 }}>{x.k}</div>
                </div>
              ))}
            </div>
            <div className="g-list-row">
              <img src={coachOf(detail.coach)?.photo} alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{coachOf(detail.coach)?.name}</div>
                <div className="g-meta" style={{ marginTop: 2 }}>{coachOf(detail.coach)?.credentials}</div>
              </div>
              <UserCheck size={17} color="var(--accent)" />
            </div>
            <div className="g-list-row">
              <span style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><MapPin size={16} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{locOf(detail.location)?.name}, {detail.room}</div>
                <div className="g-meta" style={{ marginTop: 2 }}>{locOf(detail.location)?.address}</div>
              </div>
            </div>
            <div className="g-list-row">
              <span style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Clock size={16} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Annulation sans frais jusqu'à 2 heures avant</div>
                <div className="g-meta" style={{ marginTop: 2 }}>Passé ce délai, la place est offerte à la liste d'attente.</div>
              </div>
            </div>
            <button
              className="g-cta" style={{ marginTop: 20 }}
              onClick={() => { reserve(detail); setDetail(null) }}
            >
              {booked.includes(detail.id) ? 'Annuler ma réservation'
                : detail.capacity - detail.taken <= 0 ? "Liste d'attente"
                : 'Réserver ce cours'}
            </button>
          </>
        )}
      </Sheet>
    </div>
  )
}
