import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wine, ArrowLeft, Download, PackageX, ShieldCheck } from 'lucide-react'

const API = '/api/v1/public/lots'

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Certificate() {
  const { short_code } = useParams()
  const navigate = useNavigate()
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API}/${short_code}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setNotFound(true); return }
        setLot(json.data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [short_code])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Wine className="w-10 h-10 text-gold-400 animate-pulse" strokeWidth={1.5} />
      </div>
    )
  }

  if (notFound || !lot) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center text-white">
          <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-slate-400">Certificado no disponible.</p>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* ── Estilos de impresión ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .cert-page {
            background: white !important;
            color: black !important;
            padding: 40px !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          .cert-text-dark { color: #1a1a1a !important; }
          .cert-text-mid  { color: #555 !important; }
          .cert-text-light { color: #888 !important; }
          .cert-border { border-color: #ccc !important; }
          .cert-gold { color: #b8962e !important; }
          .cert-bg { background: #f9f5ee !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* ── Pantalla: fondo oscuro ── */}
      <div className="min-h-screen bg-slate-950 py-10 px-6 print:bg-white">

        {/* Botones de acción — solo en pantalla */}
        <div className="no-print max-w-2xl mx-auto flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/wine/${short_code}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Volver
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-gold-500/20"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Descargar PDF
          </button>
        </div>

        {/* ── Certificado ── */}
        <div className="cert-page max-w-2xl mx-auto bg-stone-50 text-gray-900 rounded-3xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none">

          {/* Encabezado */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 print:bg-gray-900 px-10 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=800&q=40')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/img/iconoCEPA.png"
                  alt="Cepa"
                  draggable={false}
                  className="h-10 w-auto select-none"
                />
              </div>
              <p className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-1 cert-gold">
                {lot.winery.name}
              </p>
              <h1 className="text-white text-3xl font-serif font-semibold leading-tight">
                Certificado de Autenticidad
              </h1>
              <p className="text-white/50 text-sm mt-1">de Origen y Elaboración</p>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-10 py-8 cert-bg">

            {/* Nombre del vino */}
            <div className="text-center mb-8 pb-8 border-b border-amber-200/60 cert-border">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2 cert-gold">certifica que</p>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 cert-text-dark">{lot.name}</h2>
              {lot.variety && lot.vintage_year && (
                <p className="text-gray-500 text-sm cert-text-mid">{lot.variety} · Cosecha {lot.vintage_year}</p>
              )}
              {lot.lot_code && (
                <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-mono rounded-full cert-gold">
                  {lot.lot_code}
                </span>
              )}
            </div>

            {/* Datos clave en grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
              {[
                { label: 'Bodega', value: lot.winery.name },
                { label: 'Variedad', value: lot.variety },
                { label: 'Año de cosecha', value: lot.vintage_year },
                { label: 'Botellas producidas', value: lot.bottle_count?.toLocaleString('es-AR') },
                { label: 'Enólogo', value: lot.winemaker_name },
                { label: 'Fecha de embotellado', value: fmtDate(lot.bottled_at) },
                { label: 'Fermentación', value: lot.fermentation_days ? `${lot.fermentation_days} días` : null },
                { label: 'Barrica', value: lot.barrel_months ? `${lot.barrel_months} meses ${lot.barrel_type ? `· ${lot.barrel_type}` : ''}` : lot.barrel_type },
              ].filter(d => d.value != null && d.value !== '').map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5 cert-text-light">{label}</p>
                  <p className="text-sm font-medium text-gray-800 cert-text-dark">{value}</p>
                </div>
              ))}
            </div>

            {/* Sello de verificación */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3 mb-8 print:border-gray-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-emerald-800 text-sm font-semibold">Lote verificado digitalmente</p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  Este certificado fue emitido a través de la plataforma Cepa y acredita la
                  autenticidad del lote registrado por {lot.winery.name}.
                </p>
                <p className="text-emerald-700 text-xs mt-1.5 font-mono">ID: {lot.id}</p>
              </div>
            </div>

            {/* Footer del certificado */}
            <div className="text-center pt-4 border-t border-gray-200 cert-border">
              <p className="text-xs text-gray-400 cert-text-light">
                Emitido el {today} · Powered by{' '}
                <span className="font-semibold text-gray-500">Cepa Platform</span>
              </p>
              <p className="text-xs text-gray-300 font-mono mt-1 cert-text-light">{short_code}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
