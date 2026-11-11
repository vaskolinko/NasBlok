const TOKEN_KEY = 'nasblok_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    // Backend vrača napake v polju detail. Pri napakah validacije (422) je to
    // seznam, ki je v angleščini, zato prikažem splošno sporočilo.
    let message = 'Prišlo je do napake. Poskusite znova.'
    if (data?.detail) {
      message = Array.isArray(data.detail) ? 'Preverite vnesene podatke.' : data.detail
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return data
}
