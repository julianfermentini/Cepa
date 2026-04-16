const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/v1'

function getToken() {
  return localStorage.getItem('cepa_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()

  if (!res.ok) {
    const message = json.error?.message || 'Error en la solicitud'
    const code = json.error?.code || 'UNKNOWN'
    const err = new Error(message)
    err.code = code
    err.status = res.status
    throw err
  }

  return json.data
}

export const api = {
  auth: {
    register: (body) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    refresh: (token) =>
      request('/auth/refresh', { method: 'POST', body: JSON.stringify({ token }) }),
  },
  public: {
    getLot: (shortCode) => request(`/public/lots/${shortCode}`, { headers: { Authorization: undefined } }),
  },
  analytics: {
    overview: () => request('/analytics/overview'),
    topLots: () => request('/analytics/lots/top'),
    countries: () => request('/analytics/countries'),
  },
  lots: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
      ).toString()
      return request(`/lots${qs ? `?${qs}` : ''}`)
    },
    get: (id) => request(`/lots/${id}`),
    create: (body) =>
      request('/lots', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/lots/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/lots/${id}`, { method: 'DELETE' }),
    publish: (id) => request(`/lots/${id}/publish`, { method: 'POST' }),
  },
}
