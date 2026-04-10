import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(e) {
    const name = e.target.value
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setForm({ ...form, name, slug })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al registrar la bodega')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — foto */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-wine-950/85 via-wine-900/60 to-black/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍷</span>
            <span className="text-white text-2xl font-serif font-semibold tracking-wide">Cepa</span>
          </div>

          <div>
            <h2 className="text-white text-4xl font-serif font-semibold leading-tight mb-4">
              Tu historia<br />empieza en la viña.
            </h2>
            <p className="text-wine-300 text-base leading-relaxed max-w-sm">
              Registrá tu bodega y empezá a conectar cada botella con la historia real que hay detrás.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: '🔍', text: 'Analytics detallados por lote y país' },
                { icon: '📱', text: 'QR dinámico para cada etiqueta' },
                { icon: '✨', text: 'Storytelling generado por IA' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-wine-200 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-stone-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="text-2xl">🍷</span>
            <span className="text-wine-900 text-xl font-serif font-semibold">Cepa</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-semibold text-gray-900">Registrá tu bodega</h1>
            <p className="text-gray-500 mt-2 text-sm">Comenzá a digitalizar la historia de tus vinos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nombre de la bodega</label>
              <input
                type="text"
                className="input"
                placeholder="Bodega del Valle"
                value={form.name}
                onChange={handleNameChange}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">
                Slug  <span className="normal-case font-normal text-gray-400 tracking-normal">— identificador único en la URL</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500 whitespace-nowrap">
                  cepa.wine/
                </span>
                <input
                  type="text"
                  className="input rounded-l-none"
                  placeholder="bodega-del-valle"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@bodega.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
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
                  Creando bodega...
                </>
              ) : 'Crear bodega'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-wine-700 hover:text-wine-900 font-semibold transition-colors">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
