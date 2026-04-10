import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

const FILTERS = [
  { value: '',         label: 'Todos' },
  { value: 'active',   label: 'Publicados' },
  { value: 'draft',    label: 'Borradores' },
  { value: 'archived', label: 'Archivados' },
]

export default function Lots() {
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  function load() {
    setLoading(true)
    api.lots.list({ limit: 100, status: filter || undefined })
      .then(data => setLots(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  async function handleDelete(lot) {
    if (!confirm(`¿Eliminar "${lot.name}"?`)) return
    setDeleting(lot.id)
    try {
      await api.lots.delete(lot.id)
      setLots(prev => prev.filter(l => l.id !== lot.id))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="px-10 pt-10 pb-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-gray-900">Lotes</h1>
            <p className="text-gray-500 text-sm mt-1">Gestioná cada lote de producción</p>
          </div>
          <Link to="/lots/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo lote
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                filter === f.value
                  ? 'bg-wine-800 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-wine-300 hover:text-wine-700'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-gray-400">{lots.length} resultado{lots.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div className="px-10 pt-5 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando...
            </div>
          ) : lots.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-16 h-16 bg-wine-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍾</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">
                {filter ? 'Sin lotes con ese estado' : 'Todavía no hay lotes'}
              </h3>
              {!filter && (
                <Link to="/lots/new" className="btn-primary mt-4">Crear el primero</Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vino</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Varietal</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cosecha</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Botellas</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lots.map((lot) => (
                  <tr key={lot.id} className="group hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/lots/${lot.id}`} className="font-medium text-gray-900 hover:text-wine-700 transition-colors">
                        {lot.name}
                      </Link>
                      {lot.lot_code && (
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{lot.lot_code}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lot.variety ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lot.vintage_year ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lot.bottle_count ? lot.bottle_count.toLocaleString('es-AR') : '—'}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={lot.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/lots/${lot.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-wine-700 hover:bg-wine-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(lot)}
                          disabled={deleting === lot.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
