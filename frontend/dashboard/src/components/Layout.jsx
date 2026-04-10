import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/lots',
    label: 'Lotes',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

export default function Layout({ children }) {
  const { winery, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const wineryInitial = winery?.name?.[0]?.toUpperCase() ?? 'B'

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-wine-950 shrink-0">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🍷</span>
            <span className="text-white font-serif text-xl font-semibold tracking-wide">Cepa</span>
          </div>
          {/* Línea dorada decorativa */}
          <div className="mt-4 h-px bg-gradient-to-r from-gold-400/60 via-gold-400/20 to-transparent" />
        </div>

        {/* Winery badge */}
        {winery && (
          <div className="mx-4 mb-4 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-400/20 border border-gold-400/30 flex items-center justify-center shrink-0">
              <span className="text-gold-300 text-sm font-serif font-semibold">{wineryInitial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{winery.name}</p>
              <p className="text-wine-400 text-xs truncate">{winery.slug}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-wine-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Menú</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-wine-800/80 text-white shadow-sm'
                    : 'text-wine-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-gold-400' : ''}>{item.icon}</span>
                  {item.label}
                  {item.to === '/lots' && (
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-wine-400'}`}>
                      ↗
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-wine-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
