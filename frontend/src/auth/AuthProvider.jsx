import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api.js'
import { AuthContext } from './authContext.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ob zagonu aplikacije in po prijavi preberem prijavljenega uporabnika z /auth/me.
  // Če žeton ne velja več (npr. je potekel), ga zavržem in uporabnik se prijavi znova.
  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      setUser(await api('/auth/me'))
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  async function login(email, password) {
    const { access_token } = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setToken(access_token)
    await loadUser()
  }

  async function register(data) {
    const { access_token } = await api('/auth/register', { method: 'POST', body: data })
    setToken(access_token)
    await loadUser()
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  // Odločitev: v MVP ima uporabnik eno stavbo, zato kot trenutno stavbo vzamem
  // prvo. Upravnik z več stavbami bo kasneje dobil izbiro stavbe v glavi.
  const building = user?.memberships?.length
    ? { id: user.memberships[0].building_id, name: user.memberships[0].building_name }
    : null

  const memberships = user ? user.memberships.filter((m) => m.building_id === building?.id) : []
  const roles = memberships.map((m) => m.role)
  const unit = memberships.find((m) => m.unit_label)?.unit_label ?? null
  const hasRole = (...allowed) => allowed.some((role) => roles.includes(role))

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, building, roles, unit, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}
