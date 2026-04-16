import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'
import { Radio, Wine, Globe, TrendingUp, Trophy, Loader2 } from 'lucide-react'

function StatCard({ label, value, Icon, iconColor, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} />
      </div>
      <p className="text-3xl font-serif font-semibold text-gray-900 tabular-nums">{value ?? '–'}</p>
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Section({ title, Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.75} />
        <h3 className="font-serif text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [topLots, setTopLots] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.analytics.overview(),
      api.analytics.topLots(),
      api.analytics.countries(),
    ])
      .then(([ov, lots, ctrs]) => {
        setOverview(ov)
        setTopLots(lots)
        setCountries(ctrs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando analytics...
        </div>
      </Layout>
    )
  }

  const maxScans = topLots[0]?.scan_count || 1
  const maxCountry = countries[0]?.scan_count || 1

  return (
    <Layout>
      <div className="px-10 py-10 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Escaneos de QR de tus lotes publicados</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard Icon={Radio}       iconColor="text-wine-700"    label="Total escaneos"     value={overview?.total_scans?.toLocaleString('es-AR')} />
          <StatCard Icon={Wine}        iconColor="text-wine-700"    label="Lotes escaneados"   value={overview?.lots_scanned?.toLocaleString('es-AR')} />
          <StatCard Icon={Globe}       iconColor="text-emerald-600" label="Países"             value={overview?.countries?.toLocaleString('es-AR')} />
          <StatCard Icon={TrendingUp}  iconColor="text-gold-600"    label="Últimos 30 días"    value={overview?.scans_last_30d?.toLocaleString('es-AR')} sub="escaneos recientes" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top lotes */}
          <Section title="Top lotes por escaneos" Icon={Trophy} iconColor="text-gold-600">
            {topLots.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Sin datos aún. Publicá un lote y compartí el QR.
              </p>
            ) : (
              <div className="space-y-4">
                {topLots.map((lot, i) => (
                  <div key={lot.lot_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{lot.name}</p>
                          {lot.variety && (
                            <p className="text-xs text-gray-400">{lot.variety}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 ml-3 shrink-0 tabular-nums">
                        {lot.scan_count.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-wine-700 rounded-full transition-all duration-500"
                        style={{ width: `${(lot.scan_count / maxScans) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Países */}
          <Section title="Escaneos por país" Icon={Globe} iconColor="text-emerald-600">
            {countries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Sin datos de origen aún.
              </p>
            ) : (
              <div className="space-y-3">
                {countries.map((c) => (
                  <div key={c.country_code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-medium">
                        {c.country_code}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 tabular-nums">
                        {c.scan_count.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full transition-all duration-500"
                        style={{ width: `${(c.scan_count / maxCountry) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </Layout>
  )
}
