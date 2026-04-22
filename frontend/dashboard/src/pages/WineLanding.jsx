import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import WineSplash from '../components/WineSplash'

const API = '/api/v1/public/lots'

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
}

// ─── SVG Icon library ─────────────────────────────────────────────────────────
const Icon = {
  leaf: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9.5c0-3.04 2.46-5.5 5.5-5.5v11c-3.04 0-5.5-2.46-5.5-5.5z"/>
    </svg>
  ),
  calendar: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.8}/>
      <path strokeLinecap="round" strokeWidth={1.8} d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  flask: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 3h6M9 3v6l-4 9a1 1 0 00.9 1.4h12.2A1 1 0 0019 18l-4-9V3"/>
    </svg>
  ),
  bottle: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 2h6v3l2 3v12a2 2 0 01-2 2H9a2 2 0 01-2-2V8l2-3V2z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 13h10"/>
    </svg>
  ),
  mapPin: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 019.5 9 2.5 2.5 0 0112 6.5 2.5 2.5 0 0114.5 9 2.5 2.5 0 0112 11.5z"/>
    </svg>
  ),
  shield: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  ),
  download: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/>
    </svg>
  ),
  plus: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14"/>
    </svg>
  ),
  check: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
    </svg>
  ),
  thermometer: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
    </svg>
  ),
  clock: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={1.8}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 3"/>
    </svg>
  ),
  wine: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 2h8l1 8a5 5 0 01-10 0l1-8zM12 15v5M9 20h6"/>
    </svg>
  ),
  pen: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
    </svg>
  ),
  archive: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
    </svg>
  ),
  mountain: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 21l4-8 4 8M3 21l5-10 4 3 4-6 5 13"/>
    </svg>
  ),
  book: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"/>
    </svg>
  ),
  microscope: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 3h4v10H9zM11 13v4M7 20h8M5 20h2M17 20h2M9 7H7a1 1 0 00-1 1v2a1 1 0 001 1h2"/>
    </svg>
  ),
  star: (cls = 'w-5 h-5') => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
  ),
}

// ─── Small sub-components ─────────────────────────────────────────────────────
function SensoryBar({ label, value }) {
  if (value == null) return null
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-jakarta font-medium text-gray-500">{label}</span>
        <span className="text-xs font-jakarta font-bold tabular-nums" style={{ color: '#8F202C' }}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: 'linear-gradient(90deg,#8F202C,#E8969D)' }}/>
      </div>
    </div>
  )
}

function JourneyStep({ iconEl, title, items, isLast }) {
  const hasData = items.some(i => i.value != null && i.value !== '')
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg,#8F202C,#5A1A24)' }}>
          {iconEl}
        </div>
        {!isLast && <div className="w-0.5 flex-1 mt-2 min-h-[2rem]"
          style={{ background: 'linear-gradient(180deg,#8F202C44,transparent)' }}/>}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <p className="text-[10px] font-jakarta font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#8F202C' }}>{title}</p>
        {hasData ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {items.map(({ label, value }) =>
              value != null && value !== '' ? (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-xs font-jakarta">{label}:</span>
                  <span className="text-gray-100 text-xs font-jakarta font-semibold">{value}</span>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xs italic font-jakarta">Sin datos registrados</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ iconEl, value, label, accent }) {
  if (!value) return null
  return (
    <div className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-2 min-w-0"
      style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent + '18' }}>
        <span style={{ color: accent }}>{iconEl}</span>
      </div>
      <span className="font-grotesk font-bold text-white text-lg leading-none truncate w-full text-center">{value}</span>
      <span className="text-[10px] font-jakarta text-gray-500 uppercase tracking-wide text-center leading-tight">{label}</span>
    </div>
  )
}

function ServiceChip({ iconEl, value, label }) {
  if (!value) return null
  return (
    <div className="flex-1 rounded-2xl p-3.5 flex flex-col items-center gap-1.5 min-w-0"
      style={{ background: '#26262A' }}>
      <span style={{ color: '#8F202C' }}>{iconEl}</span>
      <span className="font-grotesk font-bold text-white text-sm leading-none text-center">{value}</span>
      <span className="text-[10px] font-jakarta text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

function AuthBadge({ winery, lotCode }) {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)' }}>
      <div className="px-5 py-4 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-cepa-secondary"
          style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.25)' }}>
          {Icon.shield('w-5 h-5')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-grotesk font-bold text-sm mb-0.5" style={{ color: '#81C784' }}>Lote verificado</p>
          <p className="text-xs font-jakarta text-cepa-secondary">
            Registrado y certificado por <span className="font-semibold">{winery}</span>
          </p>
          {lotCode && <p className="text-[11px] font-mono mt-1.5" style={{ color: '#66BB6A' }}>{lotCode}</p>}
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-cepa-secondary"
          style={{ background: 'rgba(76,175,80,0.2)' }}>
          {Icon.check('w-4 h-4')}
        </div>
      </div>
    </div>
  )
}

function CtaButtons({ short_code, inCellar, onToggleCellar, navigate }) {
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      <button onClick={onToggleCellar}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-grotesk font-bold transition-all duration-200 active:scale-[0.97]"
        style={inCellar
          ? { background: '#4CAF50', color: '#fff', boxShadow: '0 4px 16px rgba(76,175,80,0.35)' }
          : { background: 'transparent', color: '#4CAF50', border: '2px solid #4CAF50' }}>
        {inCellar ? Icon.check('w-4 h-4') : Icon.plus('w-4 h-4')}
        {inCellar ? 'En tu cava' : 'Agregar a mi cava'}
      </button>
      <button onClick={() => navigate(`/wine/${short_code}/certificate`)}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-grotesk font-bold text-white transition-all duration-200 active:scale-[0.97]"
        style={{ background: 'linear-gradient(135deg,#8F202C 0%,#5A1A24 100%)', boxShadow: '0 4px 16px rgba(143,32,44,0.35)' }}>
        {Icon.download('w-4 h-4')}
        Descargar certificado
      </button>
    </div>
  )
}

// ─── Bottom tab bar (HISTORIA / TÉCNICA) ─────────────────────────────────────
function BottomTabBar({ active, onChange }) {
  const tabs = [
    { id: 'historia', label: 'HISTORIA',  icon: Icon.book },
    { id: 'tecnica',  label: 'TÉCNICA',   icon: Icon.microscope },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2 max-w-lg"
      style={{ background: 'linear-gradient(to top,#0E0E10 68%,rgba(14,14,16,0))', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
      <div className="rounded-2xl flex items-center px-2 py-1.5"
        style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95"
            style={active === tab.id ? { background: 'rgba(143,32,44,0.22)' } : {}}>
            <span style={{ color: active === tab.id ? '#E8969D' : '#6B6B70' }}>
              {tab.icon('w-6 h-6')}
            </span>
            <span className="text-[10px] font-grotesk font-bold"
              style={{ color: active === tab.id ? '#E8969D' : '#6B6B70' }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero section (shared between Historia & Técnica) ─────────────────────────
function HeroSection({ lot }) {
  const heroImg = lot.image_url || 'https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=900&q=75'
  return (
    <div className="relative min-h-[48vh] flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${heroImg}')` }}/>
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom,rgba(14,14,16,0.6) 0%,rgba(14,14,16,0.35) 40%,rgba(14,14,16,0.98) 100%)' }}/>
      <div className="relative z-10 flex flex-col justify-between flex-1 px-5 pt-11 pb-7">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/img/iconoCEPA.png"
              alt="Cepa"
              draggable={false}
              className="h-9 w-auto select-none"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(76,175,80,0.18)', border: '1px solid rgba(76,175,80,0.35)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4CAF50' }}/>
            <span className="text-[11px] font-semibold" style={{ color: '#A5D6A7' }}>Autenticado</span>
          </div>
        </div>
        {/* Wine identity */}
        <div>
          {lot.winery?.name && (
            <p className="text-[11px] font-grotesk font-bold tracking-[0.22em] uppercase mb-2.5"
              style={{ color: '#D4AF37' }}>{lot.winery.name}</p>
          )}
          <h1 className="font-grotesk font-bold text-white text-[1.9rem] leading-[1.15] mb-3 drop-shadow-lg">
            {lot.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            {lot.variety && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {lot.variety}
              </span>
            )}
            {lot.vintage_year && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                style={{ background: 'rgba(212,175,55,0.18)', color: '#EAD58A', border: '1px solid rgba(212,175,55,0.3)' }}>
                Cosecha {lot.vintage_year}
              </span>
            )}
            {lot.lot_code && (
              <span className="px-3 py-1 rounded-full text-xs font-mono backdrop-blur-sm"
                style={{ background: 'rgba(143,32,44,0.25)', color: '#E8969D', border: '1px solid rgba(143,32,44,0.35)' }}>
                {lot.lot_code}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── HISTORIA Tab ─────────────────────────────────────────────────────────────
function HistoriaTab({ lot, short_code, inCellar, onToggleCellar, navigate }) {
  const vineyard = lot.vineyard
  return (
    <div className="px-4 pt-4 pb-36 space-y-4 max-w-lg mx-auto">
      {/* Quick stats */}
      {(lot.bottle_count || lot.barrel_months || lot.vintage_year) && (
        <div className="flex gap-3">
          <StatCard iconEl={Icon.bottle('w-4 h-4')}
            value={lot.bottle_count ? lot.bottle_count.toLocaleString('es-AR') : null}
            label="Botellas" accent="#8F202C"/>
          <StatCard iconEl={Icon.archive('w-4 h-4')}
            value={lot.barrel_months ? `${lot.barrel_months} m.` : null}
            label="En barrica" accent="#D4AF37"/>
          <StatCard iconEl={Icon.calendar('w-4 h-4')}
            value={lot.vintage_year ? `${lot.vintage_year}` : null}
            label="Cosecha" accent="#4CAF50"/>
        </div>
      )}

      {/* Winemaker note */}
      {lot.winemaker_note && (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#8F202C12', color: '#8F202C' }}>
                {Icon.pen('w-4 h-4')}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#8F202C' }}>Nota del enólogo</p>
                {lot.winemaker_name && <p className="text-xs text-gray-500 font-medium mt-0.5">{lot.winemaker_name}</p>}
              </div>
            </div>
            <blockquote className="text-gray-300 text-sm leading-relaxed italic pl-4"
              style={{ borderLeft: '3px solid #8F202C' }}>
              "{lot.winemaker_note}"
            </blockquote>
          </div>
        </div>
      )}

      {/* Journey */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
        <div className="px-5 pt-5 pb-1">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#8F202C12', color: '#8F202C' }}>
              {Icon.mapPin('w-4 h-4')}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#8F202C' }}>El viaje de esta botella</p>
          </div>
          <JourneyStep iconEl={Icon.mountain('w-4 h-4')} title="Viñedo" items={[
            { label: 'Variedad',  value: lot.variety },
            { label: 'Nombre',    value: vineyard?.name },
            { label: 'Ubicación', value: vineyard?.location },
            { label: 'Altitud',   value: vineyard?.altitude_m ? `${vineyard.altitude_m} m.s.n.m` : null },
          ]}/>
          <JourneyStep iconEl={Icon.leaf('w-4 h-4')} title="Cosecha" items={[
            { label: 'Fecha', value: fmtDate(lot.harvest_date) },
            { label: 'Kilos', value: lot.harvest_kg ? `${lot.harvest_kg.toLocaleString('es-AR')} kg` : null },
            { label: 'Brix',  value: lot.brix_at_harvest ? `${lot.brix_at_harvest}°Bx` : null },
          ]}/>
          <JourneyStep iconEl={Icon.flask('w-4 h-4')} title="Elaboración" items={[
            { label: 'Fermentación',   value: lot.fermentation_days ? `${lot.fermentation_days} días` : null },
            { label: 'Barrica',        value: lot.barrel_type },
            { label: 'Tiempo barrica', value: lot.barrel_months ? `${lot.barrel_months} meses` : null },
          ]}/>
          <JourneyStep iconEl={Icon.bottle('w-4 h-4')} title="Embotellado" isLast items={[
            { label: 'Fecha',    value: fmtDate(lot.bottled_at) },
            { label: 'Botellas', value: lot.bottle_count ? lot.bottle_count.toLocaleString('es-AR') : null },
          ]}/>
        </div>
      </div>

      <AuthBadge winery={lot.winery?.name} lotCode={lot.lot_code}/>
      <CtaButtons short_code={short_code} inCellar={inCellar} onToggleCellar={onToggleCellar} navigate={navigate}/>
      <p className="text-center text-[11px] font-jakarta pb-2" style={{ color: '#5A5A60' }}>
        Powered by <span className="font-semibold" style={{ color: '#8B8B92' }}>Cepa</span>
        {' · '}<span className="font-mono">{short_code}</span>
      </p>
    </div>
  )
}

// ─── TÉCNICA Tab ──────────────────────────────────────────────────────────────
function TecnicaTab({ lot, short_code, inCellar, onToggleCellar, navigate }) {
  const sp = lot.sensory_profile
  return (
    <div className="px-4 pt-4 pb-36 space-y-4 max-w-lg mx-auto">

      {/* Sensory profile */}
      {sp && (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#8F202C12', color: '#8F202C' }}>
                {Icon.star('w-4 h-4')}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#8F202C' }}>Perfil sensorial</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SensoryBar label="Fruta roja" value={sp.red_fruit}/>
              <SensoryBar label="Especias"   value={sp.spices}/>
              <SensoryBar label="Madera"     value={sp.wood}/>
              <SensoryBar label="Taninos"    value={sp.tannins}/>
              <SensoryBar label="Acidez"     value={sp.acidity}/>
              <SensoryBar label="Cuerpo"     value={sp.body}/>
            </div>
            {(sp.service_temp_min || sp.decant_minutes || sp.glass_type) && (
              <div className="mt-5 pt-5 flex gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <ServiceChip iconEl={Icon.thermometer('w-4 h-4')}
                  value={sp.service_temp_min ? `${sp.service_temp_min}–${sp.service_temp_max ?? sp.service_temp_min}°C` : null}
                  label="Temperatura"/>
                <ServiceChip iconEl={Icon.clock('w-4 h-4')}
                  value={sp.decant_minutes ? `${sp.decant_minutes} min` : null}
                  label="Decantación"/>
                <ServiceChip iconEl={Icon.wine('w-4 h-4')}
                  value={sp.glass_type} label="Copa ideal"/>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical data */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
        <div className="px-5 pt-5 pb-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#8F202C12', color: '#8F202C' }}>
              {Icon.flask('w-4 h-4')}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#8F202C' }}>Datos de producción</p>
          </div>
          <div className="space-y-0">
            {[
              { label: 'Kg cosechados',    value: lot.harvest_kg ? `${lot.harvest_kg.toLocaleString('es-AR')} kg` : null },
              { label: 'Brix al corte',    value: lot.brix_at_harvest ? `${lot.brix_at_harvest}°Bx` : null },
              { label: 'pH al corte',      value: lot.ph_at_harvest ? `${lot.ph_at_harvest}` : null },
              { label: 'Fermentación',     value: lot.fermentation_days ? `${lot.fermentation_days} días` : null },
              { label: 'Tipo de barrica',  value: lot.barrel_type },
              { label: 'Tiempo en barrica',value: lot.barrel_months ? `${lot.barrel_months} meses` : null },
              { label: 'Embotellado',      value: fmtDate(lot.bottled_at) },
              { label: 'Botellas totales', value: lot.bottle_count ? lot.bottle_count.toLocaleString('es-AR') : null },
              { label: 'Enólogo',          value: lot.winemaker_name },
            ].filter(r => r.value).map((row, i, arr) => (
              <div key={row.label} className="flex justify-between items-start py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span className="text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide">{row.label}</span>
                <span className="text-sm font-jakarta font-semibold text-gray-100 text-right max-w-[55%]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuthBadge winery={lot.winery?.name} lotCode={lot.lot_code}/>
      <CtaButtons short_code={short_code} inCellar={inCellar} onToggleCellar={onToggleCellar} navigate={navigate}/>
      <p className="text-center text-[11px] font-jakarta pb-2" style={{ color: '#5A5A60' }}>
        Powered by <span className="font-semibold" style={{ color: '#8B8B92' }}>Cepa</span>
        {' · '}<span className="font-mono">{short_code}</span>
      </p>
    </div>
  )
}

// Debe coincidir con DURATION_MS de WineSplash.jsx
const SPLASH_MS = 1900

// ─── Root component ───────────────────────────────────────────────────────────
export default function WineLanding() {
  const { short_code } = useParams()
  const navigate = useNavigate()
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState('historia')
  const [inCellar, setInCellar] = useState(false)
  const [cellarToast, setCellarToast] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    fetch(`${API}/${short_code}`)
      .then(r => r.json())
      .then(json => { if (json.error) { setNotFound(true); return }; setLot(json.data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [short_code])

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#0E0E10'
    return () => { document.body.style.background = prev }
  }, [])

  useEffect(() => {
    if (!lot) return
    const cellar = JSON.parse(localStorage.getItem('cepa_cellar') || '[]')
    setInCellar(cellar.some(i => i.short_code === short_code))
  }, [lot, short_code])

  function toggleCellar() {
    const cellar = JSON.parse(localStorage.getItem('cepa_cellar') || '[]')
    if (inCellar) {
      localStorage.setItem('cepa_cellar', JSON.stringify(cellar.filter(i => i.short_code !== short_code)))
      setInCellar(false)
    } else {
      cellar.push({ short_code, name: lot.name, variety: lot.variety, vintage_year: lot.vintage_year, winery: lot.winery?.name, added_at: new Date().toISOString() })
      localStorage.setItem('cepa_cellar', JSON.stringify(cellar))
      setInCellar(true)
      setCellarToast(true)
      setTimeout(() => setCellarToast(false), 2500)
    }
  }

  // Mientras el splash está activo, tapamos todo: el contenido no se rendea
  // aunque los datos ya hayan llegado. Esto garantiza que el splash sea siempre
  // lo primero que ve el usuario, sin flashes de fondo ni contenido parcial.
  if (!splashDone) {
    return (
      <>
        <WineSplash/>
        <div className="min-h-screen" style={{ background: '#0E0E10' }}/>
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0E0E10' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg,#8F202C,#5A1A24)' }}>
            {Icon.wine('w-7 h-7 text-white')}
          </div>
          <p className="font-jakarta text-sm text-gray-500">Descorchando...</p>
        </div>
      </div>
    )
  }

  if (notFound || !lot) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0E0E10' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            {Icon.bottle('w-8 h-8 text-gray-600')}
          </div>
          <h1 className="font-grotesk font-bold text-xl text-gray-100 mb-2">Vino no encontrado</h1>
          <p className="font-jakarta text-sm text-gray-500">El código <span className="font-mono">{short_code}</span> no corresponde a ningún lote.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-jakarta" style={{ background: '#0E0E10' }}>
      <HeroSection lot={lot}/>

      {tab === 'historia' && (
        <HistoriaTab lot={lot} short_code={short_code}
          inCellar={inCellar} onToggleCellar={toggleCellar} navigate={navigate}/>
      )}
      {tab === 'tecnica' && (
        <TecnicaTab lot={lot} short_code={short_code}
          inCellar={inCellar} onToggleCellar={toggleCellar} navigate={navigate}/>
      )}

      <BottomTabBar active={tab} onChange={setTab}/>

      {cellarToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-grotesk font-bold text-white"
          style={{ background: '#4CAF50', boxShadow: '0 4px 20px rgba(76,175,80,0.4)' }}>
          {Icon.check('w-4 h-4 inline mr-1.5 -mt-0.5')}
          Guardado en tu cava
        </div>
      )}
    </div>
  )
}
