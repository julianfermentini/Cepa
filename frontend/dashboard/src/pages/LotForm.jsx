import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import { Loader2, AlertCircle, ImagePlus, Trash2 } from 'lucide-react'

// Redimensiona la imagen a un ancho máx y la convierte a data URL JPEG.
// Devuelve { dataUrl, sizeKB } o lanza un error legible.
async function fileToResizedDataURL(file, { maxWidth = 800, quality = 0.85 } = {}) {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.')
  }
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('No se pudo procesar la imagen.')

  const ratio = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1
  const w = Math.round(bitmap.width * ratio)
  const h = Math.round(bitmap.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, w, h)

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const sizeKB = Math.round((dataUrl.length * 0.75) / 1024)
  return { dataUrl, sizeKB }
}

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
    image_url: '',
    status: 'draft',
  })
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError]       = useState('')
  const [imgError, setImgError] = useState('')
  const [imgProcessing, setImgProcessing] = useState(false)
  const fileInputRef = useRef(null)

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
        ph_at_harvest: lot.ph_at_harvest ?? '',
        image_url: lot.image_url ?? '',
        status: lot.status ?? 'draft',
      }))
      .catch(() => navigate('/lots'))
      .finally(() => setFetching(false))
  }, [id])

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  function clean(obj) {
    const numFields = ['vintage_year', 'bottle_count', 'barrel_months', 'fermentation_days', 'harvest_kg', 'brix_at_harvest', 'ph_at_harvest']
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'image_url') continue // se maneja aparte
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
      // image_url: en edición siempre se envía (string vacío = quitar imagen); en creación solo si hay.
      if (isEdit) payload.image_url = form.image_url
      else if (form.image_url) payload.image_url = form.image_url

      if (isEdit) await api.lots.update(id, payload)
      else await api.lots.create(payload)
      navigate('/lots')
    } catch (err) {
      setError(err.message || 'Error al guardar el lote')
    } finally {
      setLoading(false)
    }
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgError('')
    setImgProcessing(true)
    try {
      const { dataUrl, sizeKB } = await fileToResizedDataURL(file, { maxWidth: 800, quality: 0.85 })
      if (sizeKB > 800) {
        throw new Error(`La imagen pesa ${sizeKB} KB. Probá con una más liviana o de menor resolución.`)
      }
      setForm(f => ({ ...f, image_url: dataUrl }))
    } catch (err) {
      setImgError(err.message || 'No se pudo cargar la imagen.')
    } finally {
      setImgProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleImageRemove() {
    setForm(f => ({ ...f, image_url: '' }))
    setImgError('')
  }

  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
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

          <Section title="Imagen del vino">
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400 mb-3">
                Se muestra como portada en la landing del consumidor al escanear el QR.
                Se redimensiona automáticamente. Formatos: JPG, PNG, WebP.
              </p>

              {form.image_url ? (
                <div className="flex items-start gap-4">
                  <div className="w-32 h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                    <img
                      src={form.image_url}
                      alt="Previsualización del vino"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary self-start"
                      disabled={imgProcessing}
                    >
                      {imgProcessing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                      ) : (
                        <><ImagePlus className="w-4 h-4" /> Reemplazar imagen</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="btn-ghost self-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" /> Quitar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imgProcessing}
                  className="w-full flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-wine-500 hover:text-wine-700 hover:bg-wine-50/40 transition-colors"
                >
                  {imgProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-sm">Procesando imagen...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6" strokeWidth={1.5} />
                      <span className="text-sm font-medium">Elegir imagen del vino</span>
                      <span className="text-xs text-gray-400">Click para seleccionar un archivo</span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />

              {imgError && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {imgError}
                </p>
              )}
            </div>
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
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary px-8 inline-flex items-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
