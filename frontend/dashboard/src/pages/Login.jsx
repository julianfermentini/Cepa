import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1920&q=80')" }}
        />
        {/* Gradiente oscuro sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-br from-wine-950/90 via-wine-900/70 to-transparent" />

        {/* Contenido sobre la foto */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍷</span>
            <span className="text-white text-2xl font-serif font-semibold tracking-wide">Cepa</span>
          </div>

          {/* Quote */}
          <div>
            <blockquote className="text-white">
              <p className="text-3xl font-serif font-medium leading-snug mb-6">
                "El vino es poesía<br />embotellada."
              </p>
              <footer className="text-wine-300 text-sm flex items-center gap-2">
                <div className="w-8 h-px bg-gold-400" />
                Robert Louis Stevenson
              </footer>
            </blockquote>

            <div className="mt-12 flex items-center gap-6">
              <div className="text-center">
                <p className="text-white text-2xl font-serif font-semibold">+2M</p>
                <p className="text-wine-300 text-xs mt-1">Escaneos registrados</p>
              </div>
              <div className="w-px h-10 bg-wine-700" />
              <div className="text-center">
                <p className="text-white text-2xl font-serif font-semibold">150+</p>
                <p className="text-wine-300 text-xs mt-1">Bodegas boutique</p>
              </div>
              <div className="w-px h-10 bg-wine-700" />
              <div className="text-center">
                <p className="text-white text-2xl font-serif font-semibold">40+</p>
                <p className="text-wine-300 text-xs mt-1">Países alcanzados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="text-2xl">🍷</span>
            <span className="text-wine-900 text-xl font-serif font-semibold">Cepa</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-semibold text-gray-900">Bienvenido de vuelta</h1>
            <p className="text-gray-500 mt-2 text-sm">Ingresá a tu panel de bodega</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@bodega.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </>
              ) : 'Ingresar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-wine-700 hover:text-wine-900 font-semibold transition-colors">
                Registrá tu bodega
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
