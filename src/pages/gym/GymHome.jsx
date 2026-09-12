import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, ScanLine, Users, Activity, CalendarCheck, ChevronRight, Flame,
  CreditCard, MapPin, Gift, Sparkles, MessageSquare, Tag, Share2, Trophy, Clock,
} from 'lucide-react'
import config from '../../config'
import { getTier, getNextTier } from '../../utils/tiers'
import { DAYS } from '../../data/gymTemplate'
import { Panel, SectionTitle, Label, Dots, Bar, Columns, Ring, Sheet, Stat, Toast, Avatar } from './ui'

const ACT_ICON = {
  entry: <ScanLine size={17} />,
  class: <CalendarCheck size={17} />,
  referral: <Users size={17} />,
  redemption: <Gift size={17} />,
  bonus: <Sparkles size={17} />,
}

export default function GymHome({ client, business, onLogout }) {
  const navigate = useNavigate()
  const gym = config.gym
  const [qrOpen, setQrOpen] = useState(false)
  const [tasks, setTasks] = useState(gym.plan.tasks)
  const [toast, setToast] = useState(null)

  const rewards = config.rewards || []
  const points = client?.points_balance || 0
  const tier = getTier(client?.total_points_earned || 0, business?.tiers)
  const nextTier = getNextTier(client?.total_points_earned || 0, business?.tiers)
  const nextReward = rewards.find(r => r.points_required > points)
  const rewardPct = nextReward ? (points / nextReward.points_required) * 100 : 100

  const home = gym.locations.find(l => l.id === gym.homeLocation) || gym.locations[0]
  const occPct = Math.round((gym.occupancy.now / gym.occupancy.capacity) * 100)
  const occLabel = occPct < 35 ? 'Tranquille' : occPct < 65 ? 'Modérément occupé' : 'Achalandé'
  const peak = gym.occupancy.byHour.reduce((b, d, i, a) => (d.pct > a[b].pct ? i : b), 0)

  // Prochain cours reserve
  const nextBooked = useMemo(() => {
    const today = new Date().getDay()
    const idx = today === 0 ? 6 : today - 1 // 0 = lundi
    const booked = gym.classes.filter(c => gym.booked.includes(c.id))
    const sorted = [...booked].sort((a, b) => ((a.day - idx + 7) % 7) - ((b.day - idx + 7) % 7))
    return sorted[0]
  }, [gym])
  const nextBookedCoach = nextBooked && gym.coaches.find(c => c.id === nextBooked.coach)
  const nextBookedLoc = nextBooked && gym.locations.find(l => l.id === nextBooked.location)

  const doneCount = tasks.filter(t => t.done).length
  const planPct = (doneCount / tasks.length) * 100

  const toggleTask = (id) => {
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600) }

  return (
    <div className="page-content">
      <Toast>{toast}</Toast>

      {/* ---- En-tete ---- */}
      <div className="welcome-header">
        <div>
          <div className="welcome-sub">Bonjour,</div>
          <div className="welcome-name">{client?.name || 'Membre'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {config.logo
            ? <img src={config.logo} alt={config.businessName} className="welcome-logo" />
            : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{config.businessName}</span>}
          <button
            onClick={onLogout} title="Déconnexion"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, display: 'flex' }}
          ><LogOut size={18} /></button>
        </div>
      </div>

      {/* ---- Carte de membre ---- */}
      <Panel style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -70, right: -50, width: 190, height: 190, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.18) 0%, transparent 70%)', pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
          <div>
            <Label>Abonnement</Label>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 5 }}>{gym.membership.planName}</div>
            <div className="g-meta" style={{ marginTop: 3 }}>{gym.membership.price} {gym.membership.period} · membre depuis {gym.membership.memberSince}</div>
          </div>
          <span style={{
            flexShrink: 0, padding: '6px 13px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: 0.6, background: 'rgba(var(--accent-rgb),0.14)', color: 'var(--accent)',
            border: '1px solid rgba(var(--accent-rgb),0.35)',
          }}>{gym.membership.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ flex: 1 }}>
            <Label>Niveau</Label>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>
              {tier.name} · points ×{String(tier.multiplier).replace('.', ',')}
            </div>
            {nextTier && (
              <div className="g-meta" style={{ marginTop: 2 }}>
                {(nextTier.min_points - (client?.total_points_earned || 0)).toLocaleString('fr-CA')} points avant {nextTier.name}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Label>Prochain prélèvement</Label>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{gym.membership.nextBilling}</div>
            <div className="g-meta" style={{ marginTop: 2 }}>{gym.membership.freezeNote}</div>
          </div>
        </div>
      </Panel>

      {/* ---- Entrer au gym ---- */}
      <button className="g-cta" style={{ marginBottom: 18 }} onClick={() => setQrOpen(true)}>
        <ScanLine size={19} strokeWidth={2.4} />
        Entrer au gym
      </button>

      {/* ---- Solde de points ---- */}
      <div className="points-display" style={config.heroImage ? {
        backgroundImage: `linear-gradient(rgba(5,7,9,0.70), rgba(5,7,9,0.88)), url(${config.heroImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      } : {}}>
        <div className="points-number g-num">{points.toLocaleString('fr-CA')}</div>
        <div className="points-label">{config.pointsLabel}</div>
        <div className="points-sub">
          {config.pointsPerVisit} points par entrée · {config.pointsPerClass} points par cours de groupe
        </div>
      </div>

      {/* ---- Serie et objectif ---- */}
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Ring pct={(gym.goal.thisWeek / gym.goal.sessionsPerWeek) * 100} size={70}>
            <div className="g-num" style={{ fontSize: 20, color: 'var(--accent)' }}>{gym.goal.thisWeek}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>/ {gym.goal.sessionsPerWeek}</div>
          </Ring>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Flame size={16} color="var(--accent)" />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                {gym.goal.streakWeeks} semaines consécutives
              </span>
            </div>
            <div className="g-meta" style={{ marginTop: 4, lineHeight: 1.45 }}>
              Objectif de {gym.goal.sessionsPerWeek} séances par semaine. Il en reste {Math.max(0, gym.goal.sessionsPerWeek - gym.goal.thisWeek)} pour garder la série. Meilleure série : {gym.goal.bestStreak} semaines.
            </div>
            <div style={{ marginTop: 10 }}>
              <Dots on={gym.goal.thisWeek} total={gym.goal.sessionsPerWeek} />
            </div>
          </div>
        </div>
      </Panel>

      {/* ---- Prochaine reservation ---- */}
      {nextBooked && (
        <Panel style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <img src={nextBooked.image} alt="" style={{ width: 96, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
              <Label>Prochaine réservation</Label>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)', marginTop: 5 }}>{nextBooked.name}</div>
              <div className="g-meta" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Clock size={12} />{DAYS[nextBooked.day]} {nextBooked.time} · {nextBooked.duration} min
              </div>
              <div className="g-meta" style={{ marginTop: 2 }}>
                {nextBookedCoach?.name} · {nextBookedLoc?.name}, {nextBooked.room}
              </div>
              <button
                className="g-btn" style={{ marginTop: 12 }}
                onClick={() => navigate('/horaire')}
              >Voir mes réservations</button>
            </div>
          </div>
        </Panel>
      )}

      {/* ---- Achalandage ---- */}
      <Panel>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <Label>Achalandage en direct</Label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span className="g-num" style={{ fontSize: 26, color: 'var(--accent)' }}>{gym.occupancy.now}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{occLabel}</span>
            </div>
            <div className="g-meta" style={{ marginTop: 3 }}>
              {home.name} · {occPct} % de la capacité · mis à jour {gym.occupancy.updatedAt}
            </div>
          </div>
          <Activity size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 4 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Columns
            data={gym.occupancy.byHour.map(d => ({ k: d.h, v: d.pct }))}
            peakIndex={peak}
            height={52}
          />
        </div>
        <div className="g-meta" style={{ marginTop: 10 }}>
          L'heure la plus occupée est {gym.occupancy.byHour[peak].h}. Le début d'après-midi reste le moment le plus calme.
        </div>
      </Panel>

      {/* ---- Prochaine recompense ---- */}
      {nextReward && (
        <Panel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {nextReward.image && <img src={nextReward.image} alt="" className="g-thumb" style={{ width: 52, height: 52 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Label>Prochaine récompense</Label>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', margin: '5px 0 10px' }}>{nextReward.name}</div>
              <Bar pct={rewardPct} />
              <div className="g-meta" style={{ marginTop: 7 }}>
                {points.toLocaleString('fr-CA')} / {nextReward.points_required.toLocaleString('fr-CA')} points — encore {(nextReward.points_required - points).toLocaleString('fr-CA')}
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/rewards')} />
          </div>
        </Panel>
      )}

      {/* ---- Plan de la semaine ---- */}
      <SectionTitle action={<span className="g-meta">{doneCount} sur {tasks.length}</span>}>Mon plan de la semaine</SectionTitle>
      <Panel>
        <div className="g-meta" style={{ marginBottom: 14, lineHeight: 1.5 }}>
          {gym.plan.weekLabel}. {gym.plan.intro}
        </div>
        <Bar pct={planPct} />
        <div style={{ marginTop: 6 }}>
          {tasks.map(t => (
            <div key={t.id} className="g-list-row" style={{ padding: '12px 0', cursor: 'pointer' }} onClick={() => toggleTask(t.id)}>
              <span style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: t.done ? 'none' : '1.5px solid var(--border)',
                background: t.done ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF', fontSize: 12, fontWeight: 800,
              }}>{t.done ? '✓' : ''}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: t.done ? 'var(--text-muted)' : 'var(--text)',
                  textDecoration: t.done ? 'line-through' : 'none',
                }}>{t.label}</div>
                <div className="g-meta" style={{ marginTop: 2 }}>{t.detail}</div>
              </div>
              <span className="g-label" style={{ flexShrink: 0 }}>
                {t.kind === 'training' ? 'Entraînement' : t.kind === 'nutrition' ? 'Nutrition' : 'Récupération'}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---- Statistiques ---- */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Stat value={gym.visitStats.thisMonth} label="Visites ce mois" hint={`${gym.visitStats.lastMonth} le mois dernier`} />
        <Stat value={gym.visitStats.total} label="Visites au total" hint={`depuis ${gym.membership.memberSince}`} />
        <Stat value={`${gym.visitStats.avgDuration} min`} label="Durée moyenne" hint="par séance" />
      </div>

      {/* ---- Defi ---- */}
      <Panel style={{ cursor: 'pointer' }} onClick={() => navigate('/progres')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Ring pct={(gym.challenge.myProgress / gym.challenge.target) * 100} size={58} stroke={5}>
            <Trophy size={17} color="var(--accent)" />
          </Ring>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label>Défi du mois</Label>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{gym.challenge.name}</div>
            <div className="g-meta" style={{ marginTop: 3 }}>
              {gym.challenge.myProgress} séances sur {gym.challenge.target} · {gym.challenge.participants} membres inscrits
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        </div>
      </Panel>

      {/* ---- Coach ---- */}
      <Panel style={{ cursor: 'pointer' }} onClick={() => navigate('/progres')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar photo={gym.coaches[0].photo} name={gym.coaches[0].name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label>Votre entraîneur</Label>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{gym.coaches[0].name}</div>
            <div className="g-meta" style={{ marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {gym.thread[gym.thread.length - 1].text}
            </div>
          </div>
          <MessageSquare size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
        </div>
      </Panel>

      {/* ---- Raccourcis ---- */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { icon: <Tag size={18} />, label: 'Offres', to: '/offers' },
          { icon: <Share2 size={18} />, label: 'Parrainage', to: '/referral' },
          { icon: <CreditCard size={18} />, label: 'Mon code', to: '/myqr' },
        ].map(s => (
          <button
            key={s.to} onClick={() => navigate(s.to)}
            style={{
              flex: 1, background: 'var(--bg-warm)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '15px 8px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              color: 'var(--accent)', fontFamily: 'var(--font)',
            }}
          >
            {s.icon}
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: 'var(--text-light)' }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ---- Galerie ---- */}
      {config.galleryImages?.length > 0 && (
        <>
          <SectionTitle>{config.galleryTitle || 'Nos installations'}</SectionTitle>
          <div className="g-scroll-x" style={{ marginBottom: 20, scrollSnapType: 'x mandatory' }}>
            {config.galleryImages.map((img, i) => (
              <img key={i} src={img} alt="" style={{
                width: 158, height: 158, borderRadius: 'var(--radius-sm)', objectFit: 'cover',
                flexShrink: 0, scrollSnapAlign: 'start',
              }} />
            ))}
          </div>
        </>
      )}

      {/* ---- Succursales ---- */}
      <SectionTitle>Succursales</SectionTitle>
      <Panel>
        {gym.locations.map(l => (
          <div key={l.id} className="g-list-row">
            <span style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><MapPin size={17} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>
                {l.name}{l.id === gym.homeLocation && <span className="g-label" style={{ marginLeft: 8 }}>Principale</span>}
              </div>
              <div className="g-meta" style={{ marginTop: 2 }}>{l.address}</div>
              <div className="g-meta" style={{ marginTop: 2 }}>{l.hours}</div>
            </div>
          </div>
        ))}
      </Panel>

      {/* ---- Activite recente ---- */}
      <SectionTitle>Activité récente</SectionTitle>
      <Panel>
        {(gym.activity || []).map(a => (
          <div key={a.id} className="g-list-row">
            <span style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(var(--accent-rgb),0.12)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{ACT_ICON[a.kind]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="g-label" style={{ color: 'var(--accent)' }}>{a.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 3 }}>{a.detail}</div>
              <div className="g-meta" style={{ marginTop: 2 }}>{a.date}</div>
            </div>
            <span className="g-num" style={{
              fontSize: 17, flexShrink: 0,
              color: a.points >= 0 ? 'var(--accent)' : 'var(--text-light)',
            }}>{a.points >= 0 ? '+' : ''}{a.points}</span>
          </div>
        ))}
      </Panel>

      {/* ---- Feuille du code d'acces ---- */}
      <Sheet
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Votre code d'accès"
        subtitle={`${home.name} · ${home.hours}`}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: 14, background: '#FFFFFF', borderRadius: 20,
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(client?.id || 'demo-client')}`}
              alt="Code d'accès" width={200} height={200} style={{ display: 'block', borderRadius: 8 }}
            />
          </div>
          <div className="g-meta" style={{ marginTop: 16, lineHeight: 1.5, padding: '0 10px' }}>
            {config.qrHint}. L'entrée est enregistrée dans votre historique et vaut {config.pointsPerVisit} points.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="g-btn" style={{ flex: 1 }} onClick={() => { setQrOpen(false); flash(`Entrée enregistrée · +${config.pointsPerVisit} points`) }}>
              Simuler une entrée
            </button>
            <button className="g-btn g-btn-ghost" style={{ flex: 1 }} onClick={() => { setQrOpen(false); navigate('/myqr') }}>
              Ajouter au Wallet
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
