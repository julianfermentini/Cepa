import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { Loader2, Send, Leaf, FlaskConical, UserCircle2, PartyPopper, Check, Download, ExternalLink, Pencil, Trash2 } from 'lucide-react'

function DataRow({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between items-start py-3" style={{ borderBottom: '1px solid #222' }}>
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#555' }}>{label}</span>
      <span className="text-sm font-medium text-white text-right max-w-xs">{value}</span>
    </div>
  )
}

function Card({ title, children, Icon, iconColor }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a' }}>
      <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid #242424', backgroundColor: '#191919' }}>
        {Icon && <Icon className="w-4 h-4" style={{ color: iconColor || '#555' }} strokeWidth={1.75} />}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

export default function LotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [consumerURL, setConsumerURL] = useState(null)
  const [copied, setCopied] = useState(false)

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

  async function handlePublish() {
    setPublishing(true)
    try {
      const result = await api.lots.publish(lot.id)
      setConsumerURL(result.consumer_url)
      setLot(prev => ({ ...prev, status: 'active' }))
    } catch (err) {
      alert(err.message)
    } finally {
      setPublishing(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(consumerURL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-sm" style={{ color: '#555' }}>
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando...
        </div>
      </Layout>
    )
  }

  if (!lot) return null

  return (
    <Layout>
      <div className="px-8 py-8 max-w-3xl" style={{ backgroundColor: '#111', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: '#555' }}>
          <Link to="/lots" className="hover:text-white transition-colors">Lotes</Link>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{lot.name}</span>
        </div>

        {/* Header card */}
        <div className="rounded-2xl p-7 mb-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3B1C22 0%, #4f2630 100%)', border: '1px solid #3a1520' }}>
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status={lot.status} />
                  {lot.lot_code && (
                    <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>{lot.lot_code}</span>
                  )}
                </div>
                <h1 className="text-white text-2xl font-bold leading-tight">{lot.name}</h1>
                {lot.variety && lot.vintage_year && (
                  <p className="text-sm mt-1.5" style={{ color: '#9ca3af' }}>
                    {lot.variety} · Cosecha {lot.vintage_year}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {lot.status !== 'active' && (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#C9A64B', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    {publishing
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publicando...</>
                      : <><Send className="w-3.5 h-3.5" strokeWidth={2} /> Publicar</>}
                  </button>
                )}
                <Link
                  to={`/lots/${lot.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ backgroundColor: '#2a2a2a', color: '#aaa', border: '1px solid #333' }}
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Eliminar
                </button>
              </div>
            </div>

            {(lot.bottle_count || lot.barrel_months || lot.fermentation_days) && (
              <div className="flex gap-6 mt-5 pt-5" style={{ borderTop: '1px solid #3a1520' }}>
                {lot.bottle_count && (
                  <div>
                    <p className="text-white text-xl font-bold">{lot.bottle_count.toLocaleString('es-AR')}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Botellas</p>
                  </div>
                )}
                {lot.barrel_months && (
                  <div>
                    <p className="text-white text-xl font-bold">{lot.barrel_months}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Meses en barrica</p>
                  </div>
                )}
                {lot.fermentation_days && (
                  <div>
                    <p className="text-white text-xl font-bold">{lot.fermentation_days}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Días de ferment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel publicación exitosa */}
        {consumerURL && (
          <div className="mb-5 rounded-2xl p-5" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <PartyPopper className="w-5 h-5" style={{ color: '#22c55e' }} strokeWidth={1.75} />
              <p className="font-semibold" style={{ color: '#22c55e' }}>¡Lote publicado!</p>
            </div>
            <p className="text-sm mb-4" style={{ color: '#4ade80' }}>
              Este es el QR único de tu lote. Descargalo e imprímilo en tu etiqueta:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(consumerURL)}`}
                alt="QR del lote"
                className="w-44 h-44 rounded-xl p-2 shrink-0"
                style={{ backgroundColor: '#fff' }}
              />
              <div className="flex-1 w-full space-y-2">
                <code className="block rounded-lg px-3 py-2 text-sm break-all" style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a', color: '#aaa' }}>
                  {consumerURL}
                </code>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: '#c0392b' }}>
                    {copied ? <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Copiado</> : 'Copiar link'}
                  </button>
                  <a href={consumerURL} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: '#2a2a2a', color: '#aaa', border: '1px solid #333' }}>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} /> Ver
                  </a>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&format=png&data=${encodeURIComponent(consumerURL)}`}
                    download={`qr-${lot.lot_code || lot.id}.png`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#C9A64B', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={2} /> Descargar QR
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {lot.status === 'active' && !consumerURL && (
          <div className="mb-5 rounded-2xl p-4 flex items-center justify-between gap-4" style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-sm" style={{ color: '#93c5fd' }}>Este lote ya está publicado y tiene QR activo.</p>
            <button onClick={handlePublish} disabled={publishing} className="px-4 py-2 rounded-lg text-xs font-semibold text-white shrink-0" style={{ backgroundColor: '#c0392b' }}>
              {publishing ? 'Obteniendo...' : 'Ver link →'}
            </button>
          </div>
        )}

        {/* Cards de datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card title="Cosecha" Icon={Leaf} iconColor="#22c55e">
            <DataRow label="Kg cosechados" value={lot.harvest_kg && `${lot.harvest_kg.toLocaleString('es-AR')} kg`} />
            <DataRow label="Brix al corte" value={lot.brix_at_harvest && `${lot.brix_at_harvest}°Bx`} />
            <DataRow label="pH al corte" value={lot.ph_at_harvest} />
            <DataRow label="Fecha de cosecha" value={lot.harvest_date && new Date(lot.harvest_date).toLocaleDateString('es-AR')} />
          </Card>
          <Card title="Elaboración" Icon={FlaskConical} iconColor="#e04e5b">
            <DataRow label="Fermentación" value={lot.fermentation_days && `${lot.fermentation_days} días`} />
            <DataRow label="Barrica" value={lot.barrel_type} />
            <DataRow label="Tiempo en barrica" value={lot.barrel_months && `${lot.barrel_months} meses`} />
            <DataRow label="Embotellado" value={lot.bottled_at && new Date(lot.bottled_at).toLocaleDateString('es-AR')} />
          </Card>
        </div>

        {(lot.winemaker_name || lot.winemaker_note) && (
          <div className="mb-4">
            <Card title="Enólogo" Icon={UserCircle2} iconColor="#C9A64B">
              {lot.winemaker_name && (
                <div className="py-3" style={{ borderBottom: '1px solid #222' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#555' }}>Nombre</p>
                  <p className="text-sm font-medium text-white">{lot.winemaker_name}</p>
                </div>
              )}
              {lot.winemaker_note && (
                <div className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#555' }}>Nota personal</p>
                  <blockquote className="text-sm leading-relaxed italic pl-4" style={{ borderLeft: '2px solid #C9A64B', color: '#aaa' }}>
                    "{lot.winemaker_note}"
                  </blockquote>
                </div>
              )}
            </Card>
          </div>
        )}

        <p className="text-xs mt-4" style={{ color: '#444' }}>
          Creado el {new Date(lot.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          <span className="font-mono">{lot.id}</span>
        </p>
      </div>
    </Layout>
  )
}
