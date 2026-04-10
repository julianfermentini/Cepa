import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-3xl font-serif font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
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
      {/* Hero banner */}
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-wine-950/90 via-wine-900/70 to-wine-800/40" />
        <div className="relative z-10 h-full flex flex-col justify-end px-10 pb-8">
          <p className="text-gold-300 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-white text-3xl font-serif font-semibold">
            {winery?.name ?? 'Tu Bodega'}
          </h1>
          <p className="text-wine-300 text-sm mt-1">
            {now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total de lotes" value={counts.total} icon="🍾" accent="bg-wine-50" />
          <StatCard label="Publicados" value={counts.active} icon="✅" accent="bg-emerald-50" />
          <StatCard label="Borradores" value={counts.draft} icon="📝" accent="bg-amber-50" />
          <StatCard label="Archivados" value={counts.archived} icon="📦" accent="bg-gray-50" />
        </div>

        {/* Recent lots */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
            <div>
              <h2 className="font-serif text-lg font-semibold text-gray-900">Lotes recientes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Últimas actualizaciones de tu producción</p>
            </div>
            <Link
              to="/lots"
              className="text-sm text-wine-700 hover:text-wine-900 font-medium flex items-center gap-1 transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando lotes...
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-wine-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍾</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">Tu primer lote te espera</h3>
              <p className="text-gray-500 text-sm mb-6">Cargá los datos de producción y generá el QR para tu etiqueta.</p>
              <Link to="/lots/new" className="btn-primary">Crear primer lote</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vino</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Varietal</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cosecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((lot) => (
                  <tr key={lot.id} className="group hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/lots/${lot.id}`} className="font-medium text-gray-900 hover:text-wine-700 transition-colors">
                        {lot.name}
                      </Link>
                      {lot.lot_code && <p className="text-xs text-gray-400 mt-0.5">{lot.lot_code}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lot.variety ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lot.vintage_year ?? '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={lot.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/lots/${lot.id}`}
                        className="text-xs text-gray-400 group-hover:text-wine-700 font-medium transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
