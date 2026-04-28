import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Boxes, LineChart, LogOut } from 'lucide-react'

const navItems = [
  { to: '/',          label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/lots',      label: 'Lotes',     Icon: Boxes },
  { to: '/analytics', label: 'Analytics', Icon: LineChart },
]

const SIDEBAR   = '#3B1C22'
const SIDEBAR_DARK = '#A4343A'   // hover / active bg
const SIDEBAR_TEXT = 'rgba(255,255,255,0.55)'
const SIDEBAR_BORDER = 'rgba(0,0,0,0.15)'

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export default function Layout({ children }) {
  const { winery, token, logout } = useAuth()
  const navigate = useNavigate()

  const jwt = token ? parseJWT(token) : null
  const userEmail = jwt?.email ?? ''
  const userName = winery?.name ?? 'Bodega'
  const userInitial = userName[0]?.toUpperCase() ?? 'B'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#111' }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col shrink-0" style={{ backgroundColor: SIDEBAR }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <img src="/logoCepa.jpg" alt="Cepa" className="h-7 w-auto" />
          <span className="text-white font-bold text-lg tracking-wide">Cepa</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Menú</p>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-black/20'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? SIDEBAR_DARK : 'transparent',
                color: isActive ? '#fff' : SIDEBAR_TEXT,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4" style={{ color: isActive ? '#fff' : SIDEBAR_TEXT }} strokeWidth={1.75} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-3 pb-5 pt-3" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
              style={{ backgroundColor: SIDEBAR_DARK }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              {userEmail && <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{userEmail}</p>}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#111' }}>
        {children}
      </main>
    </div>
  )
}
