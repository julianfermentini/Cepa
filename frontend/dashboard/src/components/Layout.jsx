import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Boxes, LineChart, LogOut, ArrowUpRight } from 'lucide-react'

const navItems = [
  { to: '/',          label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/lots',      label: 'Lotes',     Icon: Boxes },
  { to: '/analytics', label: 'Analytics', Icon: LineChart },
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
          <div className="flex items-center justify-center">
            <img
              src="/img/iconoCEPA.png"
              alt="Cepa"
              className="h-14 w-auto select-none"
              draggable={false}
            />
          </div>
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
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : ''}`} strokeWidth={1.75} />
                  {label}
                  {to === '/lots' && (
                    <ArrowUpRight className={`ml-auto w-3.5 h-3.5 ${isActive ? 'text-white/70' : 'text-wine-500'}`} strokeWidth={2} />
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
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
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
