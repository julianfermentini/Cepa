import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import { Loader2, AlertCircle } from 'lucide-react'

const STATUSES = [
  { value: 'draft',    label: 'Borrador' },
  { value: 'active',   label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  backgroundColor: '#141414',
  border: '1px solid #2a2a2a',
  borderRadius: '0.625rem',
  color: '#ffffff',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s',
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a' }}>
      <div className="px-6 py-3.5" style={{ borderBottom: '1px solid #242424', backgroundColor: '#191919' }}>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
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
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>
        {label}
        {hint && <span className="normal-case font-normal tracking-normal ml-1" style={{ color: '#444' }}>— {hint}</span>}
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

  const inp = (field, props = {}) => (
    <input
      style={inputStyle}
      value={form[field]}
      onChange={set(field)}
      onFocus={e => (e.target.style.borderColor = '#c0392b')}
      onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
      {...props}
    />
  )

  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-sm" style={{ color: '#555' }}>
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-8 py-8 max-w-3xl" style={{ backgroundColor: '#111', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: '#555' }}>
          <Link to="/lots" className="hover:text-white transition-colors">Lotes</Link>
          <span>/</span>
          <span className="text-white">{isEdit ? 'Editar lote' : 'Nuevo lote'}</span>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar lote' : 'Nuevo lote'}</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>
            {isEdit ? 'Modificá los datos del lote de producción.' : 'Cargá los datos de cosecha y elaboración.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="Identificación">
            <Field label="Nombre del vino *" span={2}>
              {inp('name', { type: 'text', placeholder: 'Malbec Reserva 2022', required: true, autoFocus: true })}
            </Field>
            <Field label="Varietal">
              {inp('variety', { type: 'text', placeholder: 'Malbec' })}
            </Field>
            <Field label="Año de cosecha">
              {inp('vintage_year', { type: 'number', placeholder: '2022', min: '1900', max: '2099' })}
            </Field>
            <Field label="Código de lote" hint="ej. #VE2022-047">
              {inp('lot_code', { type: 'text', placeholder: '#VE2022-047', style: { ...inputStyle, fontFamily: 'monospace' } })}
            </Field>
            <Field label="Estado">
              <select
                style={inputStyle}
                value={form.status}
                onChange={set('status')}
                onFocus={e => (e.target.style.borderColor = '#c0392b')}
                onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Datos de cosecha">
            <Field label="Kg cosechados">
              {inp('harvest_kg', { type: 'number', placeholder: '8500', step: '0.01', min: '0' })}
            </Field>
            <Field label="Botellas producidas">
              {inp('bottle_count', { type: 'number', placeholder: '3500', min: '0' })}
            </Field>
            <Field label="Brix al corte">
              {inp('brix_at_harvest', { type: 'number', placeholder: '24.5', step: '0.1', min: '0' })}
            </Field>
            <Field label="pH al corte">
              {inp('ph_at_harvest', { type: 'number', placeholder: '3.4', step: '0.01', min: '0', max: '14' })}
            </Field>
          </Section>

          <Section title="Elaboración">
            <Field label="Días de fermentación">
              {inp('fermentation_days', { type: 'number', placeholder: '21', min: '0' })}
            </Field>
            <Field label="Meses en barrica">
              {inp('barrel_months', { type: 'number', placeholder: '14', min: '0' })}
            </Field>
            <Field label="Tipo de barrica" span={2}>
              {inp('barrel_type', { type: 'text', placeholder: 'Roble francés 70% nueva' })}
            </Field>
          </Section>

          <Section title="Enólogo">
            <Field label="Nombre del enólogo" span={2}>
              {inp('winemaker_name', { type: 'text', placeholder: 'María González' })}
            </Field>
            <Field label="Nota del enólogo" hint="usada para el storytelling con IA" span={2}>
              <textarea
                style={{ ...inputStyle, height: '8rem', resize: 'none', lineHeight: '1.6' }}
                placeholder="Descripción personal del proceso y las decisiones de elaboración..."
                value={form.winemaker_note}
                onChange={set('winemaker_note')}
                onFocus={e => (e.target.style.borderColor = '#c0392b')}
                onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
              />
            </Field>
          </Section>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#c0392b' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#a93226')}
              onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = '#c0392b')}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
              ) : isEdit ? 'Guardar cambios' : 'Crear lote'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/lots')}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', color: '#888' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3a3a3a' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2a2a2a' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
