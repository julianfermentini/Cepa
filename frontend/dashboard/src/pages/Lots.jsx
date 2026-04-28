import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { Plus, Pencil, Trash2, Loader2, Wine } from 'lucide-react'

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
      <div className="px-8 pt-8 pb-10" style={{ backgroundColor: '#111', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Lotes</h1>
            <p className="text-sm mt-1" style={{ color: '#666' }}>Gestioná cada lote de producción</p>
          </div>
          <Link
            to="/lots/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ backgroundColor: '#c0392b' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#a93226')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#c0392b')}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo lote
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: filter === f.value ? '#c0392b' : '#1c1c1c',
                color: filter === f.value ? '#fff' : '#888',
                border: `1px solid ${filter === f.value ? '#c0392b' : '#2a2a2a'}`,
              }}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-sm" style={{ color: '#444' }}>
            {lots.length} resultado{lots.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1c' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-sm" style={{ color: '#555' }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando...
            </div>
          ) : lots.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(192,57,43,0.15)' }}>
                <Wine className="w-7 h-7" style={{ color: '#c0392b' }} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-white mb-2">
                {filter ? 'Sin lotes con ese estado' : 'Todavía no hay lotes'}
              </h3>
              {!filter && (
                <Link
                  to="/lots/new"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#c0392b' }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Crear el primero
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #242424' }}>
                  {['Vino', 'Varietal', 'Cosecha', 'Botellas', 'Estado', ''].map((col, i) => (
                    <th
                      key={i}
                      className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#444' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id} className="group" style={{ borderBottom: '1px solid #222' }}>
                    <td className="px-6 py-4">
                      <Link to={`/lots/${lot.id}`} className="font-medium text-white hover:text-wine-400 transition-colors text-sm">
                        {lot.name}
                      </Link>
                      {lot.lot_code && (
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#444' }}>{lot.lot_code}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#777' }}>{lot.variety ?? '—'}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#777' }}>{lot.vintage_year ?? '—'}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#777' }}>
                      {lot.bottle_count ? lot.bottle_count.toLocaleString('es-AR') : '—'}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={lot.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/lots/${lot.id}/edit`)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#555' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = '#2a2a2a' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent' }}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => handleDelete(lot)}
                          disabled={deleting === lot.id}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#555' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent' }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
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
