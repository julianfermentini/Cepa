import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const API = '/api/v1/public/lots'

// ─── Helpers ──────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
}

// ─── Sub-components ───────────────────────────────────────
function SensoryBar({ label, value, color }) {
  if (value == null) return null
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <span className="text-xs text-slate-300 font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function JourneyStep({ icon, title, items, isLast }) {
  const hasData = items.some(i => i.value != null && i.value !== '')
  return (
    <div className="flex gap-4">
      {/* Connector */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center shrink-0 text-lg">
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-white/10 mt-2 mb-0 min-h-[2rem]" />}
      </div>
      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
        <p className="text-xs font-semibold text-gold-400 uppercase tracking-widest mb-2">{title}</p>
        {hasData ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {items.map(({ label, value }) =>
              value != null && value !== '' ? (
                <div key={label}>
                  <span className="text-slate-500 text-xs">{label}: </span>
                  <span className="text-slate-200 text-xs font-medium">{value}</span>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-slate-600 text-xs italic">Sin datos registrados</p>
        )}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────
export default function WineLanding() {
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
        <div className="text-center">
          <span className="text-4xl animate-pulse block mb-3">🍷</span>
          <p className="text-slate-400 text-sm">Descorchando...</p>
        </div>
      </div>
    )
  }

  if (notFound || !lot) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center">
          <span className="text-5xl block mb-4">🫙</span>
          <h2 className="text-white text-xl font-serif mb-2">Vino no encontrado</h2>
          <p className="text-slate-400 text-sm">Este QR no corresponde a ningún lote activo.</p>
        </div>
      </div>
    )
  }

  const sp = lot.sensory_profile

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* ─── HERO ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px] flex flex-col">
        {/* Foto de viñedo/montañas de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1200&q=70')" }}
        />
        {/* Gradiente oscuro sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />

        <div className="relative z-10 px-6 pt-10 pb-14 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-base">🍷</span>
              <span className="text-white/70 text-xs font-medium tracking-widest uppercase">Cepa</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Autenticado</span>
            </div>
          </div>

          {/* Wine identity */}
          <div>
            <p className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">
              {lot.winery.name}
            </p>
            <h1 className="text-4xl font-serif font-semibold leading-tight mb-4 drop-shadow-lg">
              {lot.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {lot.variety && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                  {lot.variety}
                </span>
              )}
              {lot.vintage_year && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                  Cosecha {lot.vintage_year}
                </span>
              )}
              {lot.bottle_count && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                  {lot.bottle_count.toLocaleString('es-AR')} botellas
                </span>
              )}
              {lot.lot_code && (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-gold-400/10 text-gold-300 border border-gold-400/25 backdrop-blur-sm">
                  {lot.lot_code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTENIDO ─────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-6 pb-16 space-y-5">

        {/* ── NOTA DEL ENÓLOGO ── */}
        {lot.winemaker_note && (
          <div className="bg-white/5 border border-gold-400/20 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-base">✍️</span>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nota del enólogo</p>
                {lot.winemaker_name && (
                  <p className="text-gold-400/70 text-xs mt-0.5 font-medium">{lot.winemaker_name}</p>
                )}
              </div>
            </div>
            <blockquote className="text-slate-200 text-sm leading-relaxed italic border-l-2 border-gold-400/50 pl-4">
              "{lot.winemaker_note}"
            </blockquote>
          </div>
        )}

        {/* ── EL VIAJE DE ESTA BOTELLA ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-base">🗺️</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">El viaje de esta botella</p>
          </div>
          <div>
            <JourneyStep
              icon="🌿"
              title="Viñedo"
              items={[
                { label: 'Variedad', value: lot.variety },
                { label: 'Cosecha', value: lot.vintage_year ? `${lot.vintage_year}` : null },
              ]}
            />
            <JourneyStep
              icon="🌾"
              title="Cosecha"
              items={[
                { label: 'Fecha', value: fmtDate(lot.harvest_date) },
                { label: 'Brix al corte', value: lot.brix_at_harvest ? `${lot.brix_at_harvest}°Bx` : null },
                { label: 'Kg cosechados', value: lot.harvest_kg ? `${lot.harvest_kg.toLocaleString('es-AR')} kg` : null },
              ]}
            />
            <JourneyStep
              icon="🪨"
              title="Elaboración"
              items={[
                { label: 'Fermentación', value: lot.fermentation_days ? `${lot.fermentation_days} días` : null },
                { label: 'Barrica', value: lot.barrel_type },
                { label: 'Tiempo en barrica', value: lot.barrel_months ? `${lot.barrel_months} meses` : null },
              ]}
            />
            <JourneyStep
              icon="🍾"
              title="Embotellado"
              isLast
              items={[
                { label: 'Fecha', value: fmtDate(lot.bottled_at) },
                { label: 'Botellas', value: lot.bottle_count ? lot.bottle_count.toLocaleString('es-AR') : null },
              ]}
            />
          </div>
        </div>

        {/* ── PERFIL SENSORIAL ── */}
        {sp && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-base">🎨</span>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perfil sensorial</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SensoryBar label="Fruta roja"  value={sp.red_fruit} color="bg-rose-500" />
              <SensoryBar label="Especias"    value={sp.spices}    color="bg-orange-500" />
              <SensoryBar label="Madera"      value={sp.wood}      color="bg-amber-700" />
              <SensoryBar label="Taninos"     value={sp.tannins}   color="bg-violet-600" />
              <SensoryBar label="Acidez"      value={sp.acidity}   color="bg-yellow-500" />
              <SensoryBar label="Cuerpo"      value={sp.body}      color="bg-indigo-500" />
            </div>

            {/* Servicio */}
            {(sp.service_temp_min || sp.decant_minutes || sp.glass_type) && (
              <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                {sp.service_temp_min && (
                  <div className="bg-white/5 rounded-xl py-3 px-2">
                    <p className="text-white text-base font-serif font-semibold">
                      {sp.service_temp_min}–{sp.service_temp_max ?? sp.service_temp_min}°C
                    </p>
                    <p className="text-slate-400 text-xs mt-1 leading-tight">Temp. servicio</p>
                  </div>
                )}
                {sp.decant_minutes && (
                  <div className="bg-white/5 rounded-xl py-3 px-2">
                    <p className="text-white text-base font-serif font-semibold">{sp.decant_minutes} min</p>
                    <p className="text-slate-400 text-xs mt-1 leading-tight">Decantación</p>
                  </div>
                )}
                {sp.glass_type && (
                  <div className="bg-white/5 rounded-xl py-3 px-2">
                    <p className="text-white text-sm font-semibold leading-tight">{sp.glass_type}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-tight">Copa ideal</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── AUTENTICIDAD ── */}
        <div className="bg-emerald-950/40 border border-emerald-700/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-semibold">Lote verificado</p>
              <p className="text-emerald-600/80 text-xs mt-0.5">
                Registrado y certificado por <span className="text-emerald-500">{lot.winery.name}</span>
              </p>
              {lot.lot_code && (
                <p className="text-emerald-700 text-xs mt-2 font-mono">{lot.lot_code}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── CERTIFICADO CTA ── */}
        <button
          onClick={() => navigate(`/wine/${short_code}/certificate`)}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-slate-950 font-semibold text-sm py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar certificado de autenticidad
        </button>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-slate-600 text-xs">
            Powered by <span className="text-slate-500 font-medium">Cepa</span>
            {' · '}
            <span className="font-mono">{short_code}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
