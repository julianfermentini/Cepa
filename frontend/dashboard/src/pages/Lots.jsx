import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import {
  Plus, Pencil, Trash2, Loader2, Wine, ChevronRight,
  Archive, UserCircle2, Calendar, Grape, Droplets,
} from 'lucide-react'

const FILTERS = [
  { value: '',         label: 'Todos' },
  { value: 'active',   label: 'Publicados' },
  { value: 'draft',    label: 'Borradores' },
  { value: 'archived', label: 'Archivados' },
]

// ─── Card de un lote ──────────────────────────────────────────────────────────
function LotCard({ lot, deleting, onDelete, onEdit, onOpen }) {
  return (
    <article
      onClick={() => onOpen(lot.id)}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-wine-300 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col sm:flex-row"
    >
      {/* Imagen */}
      <div className="w-full sm:w-44 h-44 sm:h-auto shrink-0 relative overflow-hidden bg-gradient-to-br from-wine-50 via-stone-100 to-wine-100">
        {lot.image_url ? (
          <img
            src={lot.image_url}
            alt={lot.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Wine className="w-14 h-14 text-wine-300" strokeWidth={1.1} />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
        {/* Meta + estado */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-[11px] font-grotesk font-semibold tracking-[0.16em] uppercase text-gray-400 min-w-0 truncate">
              {lot.variety && <span className="text-wine-700">{lot.variety}</span>}
              {lot.variety && lot.vintage_year && <span className="text-gray-300">·</span>}
              {lot.vintage_year && <span>{lot.vintage_year}</span>}
              {lot.lot_code && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="font-mono normal-case tracking-normal text-gray-400">{lot.lot_code}</span>
                </>
              )}
            </div>
            <div className="shrink-0">
              <StatusBadge status={lot.status} />
            </div>
          </div>

          {/* Nombre */}
          <h3 className="font-serif font-semibold text-gray-900 text-xl sm:text-2xl leading-tight group-hover:text-wine-800 transition-colors line-clamp-2">
            {lot.name}
          </h3>

          {/* Nota del enólogo (preview) */}
          {lot.winemaker_note && (
            <p className="font-jakarta text-sm text-gray-500 italic mt-2 line-clamp-2 leading-relaxed">
              "{lot.winemaker_note}"
            </p>
          )}
        </div>

        {/* Stats + acciones */}
        <div className="flex items-end justify-between gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-jakarta text-xs text-gray-500">
            {lot.bottle_count != null && (
              <Stat Icon={Wine} iconColor="text-wine-700"
                value={lot.bottle_count.toLocaleString('es-AR')} label="botellas" />
            )}
            {lot.barrel_months != null && (
              <Stat Icon={Archive} iconColor="text-gold-500"
                value={lot.barrel_months} label={`m. ${lot.barrel_type ? 'en barrica' : 'barrica'}`} />
            )}
            {lot.harvest_kg != null && (
              <Stat Icon={Grape} iconColor="text-emerald-600"
                value={`${Number(lot.harvest_kg).toLocaleString('es-AR')} kg`} label="cosecha" />
            )}
            {lot.fermentation_days != null && (
              <Stat Icon={Droplets} iconColor="text-blue-500"
                value={lot.fermentation_days} label="días ferm." />
            )}
            {lot.winemaker_name && (
              <Stat Icon={UserCircle2} iconColor="text-stone-500"
                value={lot.winemaker_name} />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(lot.id) }}
              className="p-2 text-gray-400 hover:text-wine-700 hover:bg-wine-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Editar"
            >
              <Pencil className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(lot) }}
              disabled={deleting === lot.id}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] font-grotesk font-bold uppercase tracking-widest text-gray-300 group-hover:text-wine-700 transition-colors">
              Ver detalle
              <ChevronRight className="w-3.5 h-3.5 -mr-1 translate-x-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function Stat({ Icon, iconColor, value, label }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} strokeWidth={1.8} />
      <span className="font-semibold text-gray-800 tabular-nums truncate">{value}</span>
      {label && <span className="text-gray-400">{label}</span>}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
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
      <div className="px-10 pt-10 pb-0 font-jakarta">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-[11px] font-grotesk font-bold uppercase tracking-[0.22em] text-wine-700">
                Producción
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-wine-200 to-transparent w-16" />
            </div>
            <h1 className="font-serif font-semibold text-gray-900 text-4xl tracking-tight">
              Lotes <Calendar className="inline w-6 h-6 text-gold-400 -mt-2 ml-1" strokeWidth={1.5} />
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 font-jakarta">
              Gestioná cada lote de producción — su historia, su QR, su huella.
            </p>
          </div>
          <Link to="/lots/new" className="btn-primary inline-flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" strokeWidth={2} />
            Nuevo lote
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 items-center">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wider transition-all duration-150 ${
                filter === f.value
                  ? 'bg-wine-800 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-wine-300 hover:text-wine-700'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-grotesk font-semibold uppercase tracking-widest text-gray-400">
            {lots.length} resultado{lots.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista de cards */}
      <div className="px-10 pt-6 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400 font-jakarta">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando...
          </div>
        ) : lots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-8">
            <div className="w-16 h-16 bg-wine-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wine className="w-8 h-8 text-wine-700" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">
              {filter ? 'Sin lotes con ese estado' : 'Todavía no hay lotes'}
            </h3>
            <p className="font-jakarta text-sm text-gray-500 mb-6">
              {filter ? 'Probá con otro filtro o creá un nuevo lote.' : 'Cargá los datos de tu primera producción.'}
            </p>
            {!filter && (
              <Link to="/lots/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" strokeWidth={2} />
                Crear el primero
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {lots.map(lot => (
              <LotCard
                key={lot.id}
                lot={lot}
                deleting={deleting}
                onOpen={(id) => navigate(`/lots/${id}`)}
                onEdit={(id) => navigate(`/lots/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
