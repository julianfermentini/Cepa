import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'

function DataRow({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value}</span>
    </div>
  )
}

function Card({ title, children, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <h3 className="font-serif text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  )
}

export default function LotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.lots.get(id)
      .then(setLot)
      .catch(() => navigate('/lots'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${lot.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.lots.delete(lot.id)
      navigate('/lots')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </div>
      </Layout>
    )
  }

  if (!lot) return null

  return (
    <Layout>
      <div className="px-10 py-10 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/lots" className="hover:text-wine-700 transition-colors">Lotes</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{lot.name}</span>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-wine-900 to-wine-950 rounded-2xl p-8 mb-6 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-9xl opacity-10 select-none">🍷</div>
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status={lot.status} />
                  {lot.lot_code && (
                    <span className="text-xs text-wine-300 font-mono">{lot.lot_code}</span>
                  )}
                </div>
                <h1 className="text-white text-3xl font-serif font-semibold leading-tight">{lot.name}</h1>
                {lot.variety && lot.vintage_year && (
                  <p className="text-wine-300 mt-2 text-sm">
                    {lot.variety} · Cosecha {lot.vintage_year}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/lots/${lot.id}/edit`} className="btn-secondary text-xs px-3 py-2">
                  Editar
                </Link>
                <button onClick={handleDelete} className="btn-danger text-xs px-3 py-2">
                  Eliminar
                </button>
              </div>
            </div>

            {/* Quick stats */}
            {(lot.bottle_count || lot.barrel_months || lot.fermentation_days) && (
              <div className="flex gap-6 mt-6 pt-6 border-t border-wine-800">
                {lot.bottle_count && (
                  <div>
                    <p className="text-white text-xl font-serif font-semibold">
                      {lot.bottle_count.toLocaleString('es-AR')}
                    </p>
                    <p className="text-wine-400 text-xs mt-0.5">Botellas</p>
                  </div>
                )}
                {lot.barrel_months && (
                  <div>
                    <p className="text-white text-xl font-serif font-semibold">{lot.barrel_months}</p>
                    <p className="text-wine-400 text-xs mt-0.5">Meses en barrica</p>
                  </div>
                )}
                {lot.fermentation_days && (
                  <div>
                    <p className="text-white text-xl font-serif font-semibold">{lot.fermentation_days}</p>
                    <p className="text-wine-400 text-xs mt-0.5">Días de ferment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card title="Cosecha" icon="🌿">
            <DataRow label="Kg cosechados" value={lot.harvest_kg && `${lot.harvest_kg.toLocaleString('es-AR')} kg`} />
            <DataRow label="Brix al corte" value={lot.brix_at_harvest && `${lot.brix_at_harvest}°Bx`} />
            <DataRow label="pH al corte" value={lot.ph_at_harvest} />
            <DataRow label="Fecha de cosecha" value={lot.harvest_date && new Date(lot.harvest_date).toLocaleDateString('es-AR')} />
          </Card>

          <Card title="Elaboración" icon="🪨">
            <DataRow label="Fermentación" value={lot.fermentation_days && `${lot.fermentation_days} días`} />
            <DataRow label="Barrica" value={lot.barrel_type} />
            <DataRow label="Tiempo en barrica" value={lot.barrel_months && `${lot.barrel_months} meses`} />
            <DataRow label="Embotellado" value={lot.bottled_at && new Date(lot.bottled_at).toLocaleDateString('es-AR')} />
          </Card>
        </div>

        {/* Enólogo */}
        {(lot.winemaker_name || lot.winemaker_note) && (
          <Card title="Enólogo" icon="👨‍🍳">
            {lot.winemaker_name && (
              <div className="py-3 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
                <p className="text-sm font-medium text-gray-900">{lot.winemaker_name}</p>
              </div>
            )}
            {lot.winemaker_note && (
              <div className="py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nota personal</p>
                <blockquote className="text-gray-700 text-sm leading-relaxed italic border-l-2 border-gold-400 pl-4">
                  "{lot.winemaker_note}"
                </blockquote>
              </div>
            )}
          </Card>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Creado el {new Date(lot.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          <span className="font-mono">{lot.id}</span>
        </p>
      </div>
    </Layout>
  )
}
