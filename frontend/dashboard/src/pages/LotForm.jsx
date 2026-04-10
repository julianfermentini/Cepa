import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'

const STATUSES = [
  { value: 'draft',    label: 'Borrador' },
  { value: 'active',   label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
        <h2 className="font-serif text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, span, children }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="label">
        {label}
        {hint && <span className="normal-case font-normal text-gray-400 tracking-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function LotForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', variety: '', vintage_year: '', lot_code: '',
    winemaker_name: '', winemaker_note: '', bottle_count: '',
    barrel_type: '', barrel_months: '', fermentation_days: '',
    harvest_kg: '', brix_at_harvest: '', ph_at_harvest: '',
    status: 'draft',
  })
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.lots.get(id)
      .then(lot => setForm({
        name: lot.name ?? '', variety: lot.variety ?? '',
        vintage_year: lot.vintage_year ?? '', lot_code: lot.lot_code ?? '',
        winemaker_name: lot.winemaker_name ?? '', winemaker_note: lot.winemaker_note ?? '',
        bottle_count: lot.bottle_count ?? '', barrel_type: lot.barrel_type ?? '',
        barrel_months: lot.barrel_months ?? '', fermentation_days: lot.fermentation_days ?? '',
        harvest_kg: lot.harvest_kg ?? '', brix_at_harvest: lot.brix_at_harvest ?? '',
        ph_at_harvest: lot.ph_at_harvest ?? '', status: lot.status ?? 'draft',
      }))
      .catch(() => navigate('/lots'))
      .finally(() => setFetching(false))
  }, [id])

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  function clean(obj) {
    const numFields = ['vintage_year', 'bottle_count', 'barrel_months', 'fermentation_days', 'harvest_kg', 'brix_at_harvest', 'ph_at_harvest']
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v === '' || v == null) continue
      out[k] = numFields.includes(k) ? Number(v) : v
    }
    return out
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = clean(form)
      if (isEdit) await api.lots.update(id, payload)
      else await api.lots.create(payload)
      navigate('/lots')
    } catch (err) {
      setError(err.message || 'Error al guardar el lote')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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

  return (
    <Layout>
      <div className="px-10 py-10 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/lots" className="hover:text-wine-700 transition-colors">Lotes</Link>
          <span>/</span>
          <span className="text-gray-700">{isEdit ? 'Editar lote' : 'Nuevo lote'}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-gray-900">
            {isEdit ? 'Editar lote' : 'Nuevo lote'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEdit ? 'Modificá los datos del lote de producción.' : 'Cargá los datos de cosecha y elaboración.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Identificación">
            <Field label="Nombre del vino *" span={2}>
              <input type="text" className="input" placeholder="Malbec Reserva 2022"
                value={form.name} onChange={set('name')} required autoFocus />
            </Field>
            <Field label="Varietal">
              <input type="text" className="input" placeholder="Malbec"
                value={form.variety} onChange={set('variety')} />
            </Field>
            <Field label="Año de cosecha">
              <input type="number" className="input" placeholder="2022" min="1900" max="2099"
                value={form.vintage_year} onChange={set('vintage_year')} />
            </Field>
            <Field label="Código de lote" hint="ej. #VE2022-047">
              <input type="text" className="input font-mono" placeholder="#VE2022-047"
                value={form.lot_code} onChange={set('lot_code')} />
            </Field>
            <Field label="Estado">
              <select className="input" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Datos de cosecha">
            <Field label="Kg cosechados">
              <input type="number" className="input" placeholder="8500"
                value={form.harvest_kg} onChange={set('harvest_kg')} step="0.01" min="0" />
            </Field>
            <Field label="Botellas producidas">
              <input type="number" className="input" placeholder="3500"
                value={form.bottle_count} onChange={set('bottle_count')} min="0" />
            </Field>
            <Field label="Brix al corte">
              <input type="number" className="input" placeholder="24.5"
                value={form.brix_at_harvest} onChange={set('brix_at_harvest')} step="0.1" min="0" />
            </Field>
            <Field label="pH al corte">
              <input type="number" className="input" placeholder="3.4"
                value={form.ph_at_harvest} onChange={set('ph_at_harvest')} step="0.01" min="0" max="14" />
            </Field>
          </Section>

          <Section title="Elaboración">
            <Field label="Días de fermentación">
              <input type="number" className="input" placeholder="21"
                value={form.fermentation_days} onChange={set('fermentation_days')} min="0" />
            </Field>
            <Field label="Meses en barrica">
              <input type="number" className="input" placeholder="14"
                value={form.barrel_months} onChange={set('barrel_months')} min="0" />
            </Field>
            <Field label="Tipo de barrica" span={2}>
              <input type="text" className="input" placeholder="Roble francés 70% nueva"
                value={form.barrel_type} onChange={set('barrel_type')} />
            </Field>
          </Section>

          <Section title="Enólogo">
            <Field label="Nombre del enólogo" span={2}>
              <input type="text" className="input" placeholder="María González"
                value={form.winemaker_name} onChange={set('winemaker_name')} />
            </Field>
            <Field label="Nota del enólogo" hint="se usa para el storytelling con IA" span={2}>
              <textarea
                className="input h-32 resize-none leading-relaxed"
                placeholder="Descripción personal del proceso y las decisiones de elaboración..."
                value={form.winemaker_note}
                onChange={set('winemaker_note')}
              />
            </Field>
          </Section>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary px-8" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : isEdit ? 'Guardar cambios' : 'Crear lote'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/lots')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
