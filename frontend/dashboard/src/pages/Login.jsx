import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, Mail, Lock } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — foto viñedo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/vineyard-mendoza2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Doble gradiente: oscuro arriba para el logo, oscuro abajo para el texto */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, rgba(0,2,12,0.92) 0%, rgba(0,4,18,0.6) 20%, transparent 45%),
              linear-gradient(to top, rgba(0,2,12,0.95) 0%, rgba(0,4,18,0.75) 30%, transparent 60%)
            `
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full" style={{ padding: '2.5rem 3rem' }}>
          {/* Logo */}
          <div>
            <img src="/logoCepa.jpg" alt="Cepa" className="h-24 w-auto" />
          </div>

          {/* Tagline */}
          <div style={{ paddingBottom: '2.5rem' }}>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: '3.2rem',
                fontFamily: '"Playfair Display", Georgia, serif',
                color: '#ffffff',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              Tu bodega,<br />
              <span style={{ color: '#e04e5b' }}>digitalizada.</span>
            </h2>
            <p className="text-white/70 text-sm mt-4 leading-relaxed" style={{ maxWidth: '22rem', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
              Gestioná etiquetas con QR, contá la historia de cada vino y conectate con coleccionistas de todo el mundo.
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario oscuro */}
      <div className="flex-1 flex flex-col justify-between px-8 py-10" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <img src="/logoCepa.jpg" alt="Cepa" className="h-14 w-auto" />
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Bienvenido de vuelta</h1>
              <p className="text-gray-400 mt-2 text-sm">Ingresá tus credenciales para gestionar tu bodega.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                  Email de la bodega
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="nombre@bodega.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 rounded-md border border-white/10 focus:outline-none focus:border-wine-600 focus:ring-1 focus:ring-wine-600 transition-all"
                    style={{ backgroundColor: '#1a1a1a' }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Contraseña
                  </label>
                  <button type="button" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#e04e5b' }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 rounded-md border border-white/10 focus:outline-none focus:border-wine-600 focus:ring-1 focus:ring-wine-600 transition-all"
                    style={{ backgroundColor: '#1a1a1a' }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 pt-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: '#c0392b' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#a93226')}
                onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = '#c0392b')}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2a2a' }} />
              <span className="text-xs text-gray-600 uppercase tracking-widest">O continuar con</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2a2a' }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full py-3 rounded-md border text-sm font-medium text-white flex items-center justify-center gap-3 transition-all"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d0d0d')}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              ¿Sos una nueva bodega?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#e04e5b' }}>
                Registrá tu bodega
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
