import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

function parseJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cepa_token'))
  const [winery, setWinery] = useState(() => {
    const t = localStorage.getItem('cepa_token')
    const w = localStorage.getItem('cepa_winery')
    if (t && w) {
      try { return JSON.parse(w) } catch { return null }
    }
    return null
  })

  const login = useCallback(async (email, password) => {
    const data = await api.auth.login({ email, password })
    localStorage.setItem('cepa_token', data.token)
    setToken(data.token)
    return data
  }, [])

  const register = useCallback(async (fields) => {
    const data = await api.auth.register(fields)
    localStorage.setItem('cepa_token', data.token)
    localStorage.setItem('cepa_winery', JSON.stringify(data.winery))
    setToken(data.token)
    setWinery(data.winery)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cepa_token')
    localStorage.removeItem('cepa_winery')
    setToken(null)
    setWinery(null)
  }, [])

  const isAuthenticated = !!token && (() => {
    const p = parseJWT(token)
    return p && p.exp * 1000 > Date.now()
  })()

  return (
    <AuthContext.Provider value={{ token, winery, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
