import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { QrCode, LayoutGrid, FileText, Archive, Plus, Loader2 } from 'lucide-react'

function StatCard({ label, value, Icon, iconBg, iconColor }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: '#1c1c1c' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums leading-none">{value}</p>
        <p className="text-xs mt-1" style={{ color: '#666' }}>{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { winery } = useAuth()
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.lots.list({ limit: 100 })
      .then(data => setLots(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    total:    lots.length,
    active:   lots.filter(l => l.status === 'active').length,
    draft:    lots.filter(l => l.status === 'draft').length,
    archived: lots.filter(l => l.status === 'archived').length,
  }
  const recent = lots.slice(0, 6)

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src="/dashboard-img2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)' }}
        />
        <div className="relative z-10 h-full flex items-center justify-between px-8">
          <div>
            <p className="text-xs font-semibold tracking-wider" style={{ color: '#C9A64B' }}>{greeting}</p>
            <h1 className="text-white font-bold mt-1" style={{ fontSize: '2rem', fontFamily: '"Noto Serif", Georgia, serif' }}>
              {winery?.name ?? 'Tu Bodega'}
            </h1>
            <p className="text-sm mt-1 capitalize" style={{ color: '#999' }}>
              {now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            to="/lots/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all"
            style={{ backgroundColor: '#c0392b' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#a93226')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#c0392b')}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo lote
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-8 py-7" style={{ backgroundColor: '#111', minHeight: 'calc(100vh - 200px)' }}>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total de lotes" value={counts.total}    Icon={QrCode}      iconBg="rgba(212,175,55,0.15)"  iconColor="#C9A64B" />
          <StatCard label="Publicados"     value={counts.active}   Icon={LayoutGrid}  iconBg="rgba(34,197,94,0.15)"   iconColor="#22c55e" />
          <StatCard label="Borradores"     value={counts.draft}    Icon={FileText}    iconBg="rgba(156,163,175,0.12)" iconColor="#9ca3af" />
          <StatCard label="Archivados"     value={counts.archived} Icon={Archive}     iconBg="rgba(239,68,68,0.15)"   iconColor="#ef4444" />
        </div>

        {/* Lotes recientes */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: '#1c1c1c' }}>
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #2a2a2a' }}>
            <div>
              <h2 className="font-semibold text-white">Lotes recientes</h2>
              <p className="text-xs mt-0.5" style={{ color: '#555' }}>Últimas actualizaciones de tu producción</p>
            </div>
            <Link to="/lots" className="text-sm font-medium" style={{ color: '#C9A64B' }}>
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14 gap-3 text-sm" style={{ color: '#555' }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando lotes...
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #242424' }}>
                    {['Vino', 'Varietal', 'Cosecha', 'Estado', 'Scans'].map((col, i) => (
                      <th
                        key={col}
                        className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                        style={{ color: '#444' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-14 text-sm" style={{ color: '#444' }}>
                        No hay lotes aún
                      </td>
                    </tr>
                  ) : recent.map((lot) => (
                    <tr key={lot.id} style={{ borderBottom: '1px solid #222' }}>
                      <td className="px-6 py-4">
                        <Link to={`/lots/${lot.id}`} className="font-medium text-white hover:text-wine-400 transition-colors text-sm">
                          {lot.name}
                        </Link>
                        {lot.lot_code && <p className="text-xs mt-0.5" style={{ color: '#444' }}>{lot.lot_code}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#777' }}>{lot.variety ?? '—'}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#777' }}>{lot.vintage_year ?? '—'}</td>
                      <td className="px-6 py-4"><StatusBadge status={lot.status} /></td>
                      <td className="px-6 py-4 text-right text-sm font-bold" style={{ color: '#C9A64B' }}>
                        {lot.scan_count ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed #2a2a2a' }}>
                <Link
                  to="/lots/new"
                  className="flex items-center gap-2 text-sm w-full py-3.5 justify-center transition-colors"
                  style={{ color: '#444' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#777')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                >
                  <Plus className="w-4 h-4" strokeWidth={1.75} />
                  Agregar nuevo lote
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Banner QR */}
        <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4" style={{ backgroundColor: '#1a0f00' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.18)' }}>
              <QrCode className="w-5 h-5" style={{ color: '#C9A64B' }} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Generá los QR de tus etiquetas</p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                Cada lote publicado tiene un QR único. Descargalos desde la vista del lote.
              </p>
            </div>
          </div>
          <Link
            to="/lots"
            className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
            style={{ color: '#C9A64B', border: '1px solid rgba(212,175,55,0.25)', backgroundColor: 'rgba(212,175,55,0.08)' }}
          >
            Ver lotes →
          </Link>
        </div>

      </div>
    </Layout>
  )
}
