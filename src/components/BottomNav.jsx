import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Gift, Tag, QrCode, Users, CalendarDays, Dumbbell, TrendingUp } from 'lucide-react'
import config from '../config'

const DEFAULT_TABS = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/rewards', icon: Gift, label: 'Récompenses' },
  { path: '/offers', icon: Tag, label: 'Offres' },
  { path: '/myqr', icon: QrCode, label: 'Mon QR' },
  { path: '/referral', icon: Users, label: 'Parrainage' },
]

// Verticale gym : l'horaire, les entrainements et les progres remplacent
// les onglets secondaires, qui restent accessibles depuis l'accueil.
const GYM_TABS = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/horaire', icon: CalendarDays, label: 'Horaire' },
  { path: '/entrainements', icon: Dumbbell, label: 'Entraîner' },
  { path: '/progres', icon: TrendingUp, label: 'Progrès' },
  { path: '/rewards', icon: Gift, label: 'Points' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const tabs = config.vertical === 'gym' ? GYM_TABS : DEFAULT_TABS

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const Icon = tab.icon
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            style={active ? { color: 'var(--accent)' } : {}}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
