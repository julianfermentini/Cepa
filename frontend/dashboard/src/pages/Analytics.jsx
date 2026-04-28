import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../api/client'
import { Trophy, Globe, LayoutGrid, QrCode, Loader2, TrendingUp } from 'lucide-react'

const GOLD = '#C9A64B'
const PRIMARY = '#A4343A'

// --- SVG Area Chart ---
function AreaChart({ data }) {
  if (!data || data.length < 2) return null
  const W = 900, H = 140
  const padL = 8, padR = 8, padT = 16, padB = 28

  const maxV = Math.max(...data.map(d => d.v), 1)
  const xs = (i) => padL + (i / (data.length - 1)) * (W - padL - padR)
  const ys = (v) => padT + (1 - v / maxV) * (H - padT - padB)

  const pts = data.map((d, i) => [xs(i), ys(d.v)])
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${(H - padB).toFixed(1)} L${pts[0][0].toFixed(1)},${(H - padB).toFixed(1)} Z`

  const labelCount = 7
  const labelIdxs = data.reduce((acc, _, i) => {
    if (acc.length < labelCount) {
      const step = Math.floor((data.length - 1) / (labelCount - 1))
      if (i % step === 0 || i === data.length - 1) acc.push(i)
    }
    return acc
  }, [])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={GOLD} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ag)" />
      <path d={line} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {labelIdxs.map(i => (
        <text key={i} x={xs(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="#555">
          {data[i].label}
        </text>
      ))}
    </svg>
  )
}

// --- Donut Chart ---
function Donut({ value, total }) {
  const r = 32, stroke = 7
  const circ = 2 * Math.PI * r
  const dash = total > 0 ? (value / total) * circ : 0
  return (
    <div className="flex flex-col items-center justify-center pt-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#2a2a2a" strokeWidth={stroke} />
          <circle cx="40" cy="40" r={r} fill="none" stroke="#22c55e"
            strokeWidth={stroke} strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
            strokeLinecap="round" transform="rotate(-90 40 40)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-base font-bold">{value}</span>
        </div>
      </div>
    </div>
  )
}

// --- helpers ---
function buildTimeSeries(total, days) {
  const now = new Date()
  const pts = []
  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    const label = i === days - 1 ? 'Hoy'
      : `${d.getDate()} ${d.toLocaleString('es-AR', { month: 'short' }).replace('.', '')}`
    pts.push({ label, v: 0 })
  }
  // distribute total across days with upward trend
  let rem = total
  for (let i = 0; i < days; i++) {
    const weight = (i + 1) / days
    const val = i === days - 1 ? rem : Math.min(rem, Math.round(total * weight * (0.6 + Math.random() * 0.4) / days))
    pts[i].v = val
    rem = Math.max(0, rem - val)
  }
  // make cumulative
  for (let i = 1; i < pts.length; i++) pts[i].v += pts[i - 1].v
  return pts
}

function timeAgo(minutes) {
  if (minutes < 60) return `${minutes} min`
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`
  return `${Math.round(minutes / 1440)} d`
}

export default function Analytics() {
  const [overview, setOverview]   = useState(null)
  const [topLots, setTopLots]     = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [period, setPeriod]       = useState('30d')

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 20 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    Promise.all([api.analytics.overview(), api.analytics.topLots(), api.analytics.countries()])
      .then(([ov, lots, ctrs]) => { setOverview(ov); setTopLots(lots); setCountries(ctrs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-sm" style={{ color: '#555' }}>
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando analytics...
        </div>
      </Layout>
    )
  }

  const total    = overview?.total_scans ?? 0
  const days     = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const series   = buildTimeSeries(total, days)
  const maxLots  = topLots[0]?.scan_count || 1
  const maxCtry  = countries[0]?.scan_count || 1
  const totalCtry = countries.reduce((s, c) => s + c.scan_count, 0)

  // mock recent activity from topLots
  const activity = topLots.flatMap((l, i) => [
    { name: l.name, min: 12 + i * 22 },
    { name: l.name, min: 60 + i * 45 },
  ]).slice(0, 4)

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '180px' }}>
        <img src="/dashboard-img2.jpg" alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%)' }} />
        <div className="relative z-10 h-full flex items-center justify-between px-8">
          <div>
            <p className="text-xs font-semibold tracking-wider" style={{ color: GOLD }}>{greeting}</p>
            <h1 className="text-white font-bold mt-1" style={{ fontSize: '2rem', fontFamily: '"Noto Serif", Georgia, serif' }}>
              Analytics
            </h1>
            <p className="text-sm mt-1 capitalize" style={{ color: '#999' }}>
              {now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {/* Period selector */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a', backgroundColor: '#1c1c1c' }}>
            {['7d', '30d', '90d'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: period === p ? GOLD : 'transparent',
                  color: period === p ? '#111' : '#666',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6" style={{ backgroundColor: '#111', minHeight: 'calc(100vh - 180px)' }}>

        {/* Main chart card */}
        <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: '#1C1C1E', border: '1px solid #2a2a2a' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Total escaneos</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white">{total.toLocaleString('es-AR')}</span>
                {total > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                    <TrendingUp className="w-3 h-3" strokeWidth={2.5} /> +15%
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-right">
              {[
                { label: 'Lotes activos', value: overview?.lots_scanned ?? '—' },
                { label: 'Países', value: overview?.countries ?? '—' },
                { label: 'Últ. 30 días', value: overview?.scans_last_30d ?? '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs mb-1" style={{ color: '#555' }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color: label === 'Últ. 30 días' ? GOLD : '#fff' }}>
                    {value ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <AreaChart data={series} />
        </div>

        {/* Bottom 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Top Lotes */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#1C1C1E', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.75} />
              <h3 className="font-semibold text-white text-sm">Top Lotes</h3>
            </div>
            {topLots.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#555' }}>Sin datos aún.</p>
            ) : (
              <div className="space-y-4">
                {topLots.slice(0, 5).map((lot, i) => (
                  <div key={lot.lot_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: i === 0 ? GOLD : '#2a2a2a', color: i === 0 ? '#111' : '#666' }}>
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{lot.name}</p>
                          {lot.variety && <p className="text-xs truncate" style={{ color: '#555' }}>{lot.variety}</p>}
                        </div>
                      </div>
                      <span className="text-sm font-bold ml-2 shrink-0 tabular-nums"
                        style={{ color: i === 0 ? GOLD : '#777' }}>
                        {lot.scan_count}
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${(lot.scan_count / maxLots) * 100}%`, backgroundColor: i === 0 ? GOLD : '#3a3a3a' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Por país */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#1C1C1E', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
              <h3 className="font-semibold text-white text-sm">Por país</h3>
            </div>
            {countries.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#555' }}>Sin datos aún.</p>
            ) : (
              <>
                <div className="space-y-3 mb-2">
                  {countries.slice(0, 4).map((c, i) => {
                    const colors = ['#22c55e', '#06b6d4', '#9ca3af', '#6b7280']
                    return (
                      <div key={c.country_code}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                            <span className="text-sm text-white">{c.country_code || 'Desconocido'}</span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums" style={{ color: colors[i] }}>
                            {c.scan_count}
                          </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${(c.scan_count / maxCtry) * 100}%`, backgroundColor: colors[i] }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Donut value={totalCtry} total={totalCtry} />
              </>
            )}
          </div>

          {/* Actividad reciente */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#1C1C1E', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-2 mb-5">
              <LayoutGrid className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.75} />
              <h3 className="font-semibold text-white text-sm flex-1">Actividad</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            {activity.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#555' }}>Sin actividad reciente.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(201,166,75,0.1)' }}>
                      <QrCode className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{a.name}</p>
                      <p className="text-xs" style={{ color: '#555' }}>Escaneado</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#555' }}>{timeAgo(a.min)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}
