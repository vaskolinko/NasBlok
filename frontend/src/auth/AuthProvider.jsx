import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api.js'
import { AuthContext } from './authContext.js'

const BUILDING_KEY = 'nasblok_building'

function readSavedBuilding() {
  try {
    return Number(localStorage.getItem(BUILDING_KEY)) || null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedBuildingId, setSelectedBuildingId] = useState(readSavedBuilding)

  // Ob zagonu aplikacije in po prijavi preberem prijavljenega uporabnika z /auth/me.
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

  // upravnik ima lahko več stavb, zato si zapomnim izbrano stavbo
  const buildings = []
  for (const m of user?.memberships ?? []) {
    if (!buildings.some((b) => b.id === m.building_id)) {
      buildings.push({ id: m.building_id, name: m.building_name })
    }
  }
  const building = buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0] ?? null

  function selectBuilding(id) {
    setSelectedBuildingId(id)
    try {
      localStorage.setItem(BUILDING_KEY, String(id))
    } catch {
      
    }
  }

  const memberships = user ? user.memberships.filter((m) => m.building_id === building?.id) : []
  const roles = memberships.map((m) => m.role)
  const unit = memberships.find((m) => m.unit_label)?.unit_label ?? null
  const hasRole = (...allowed) => allowed.some((role) => roles.includes(role))

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: loadUser,
        buildings,
        building,
        selectBuilding,
        roles,
        unit,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
