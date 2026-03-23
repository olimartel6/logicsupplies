import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', icon: '🏠', label: 'Accueil' },
  { path: '/rewards', icon: '🎁', label: 'Récompenses' },
  { path: '/referral', icon: '👥', label: 'Parrainage' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.path}
          className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
