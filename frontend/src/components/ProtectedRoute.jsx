import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

// Varuje strani, ki zahtevajo prijavo. Če je podan seznam vlog (roles),
// stran vidi samo uporabnik z eno od teh vlog.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-10 text-stone-500">Nalagam ...</div>
  }

  if (!user) {
    // Zapomnim si, kam je uporabnik želel, da ga po prijavi vrnem tja.
    return <Navigate to="/prijava" replace state={{ from: location }} />
  }

  if (roles && !hasRole(...roles)) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold">Ni dostopa</h1>
        <p className="mt-2 text-stone-600">Ta del aplikacije ni na voljo za vašo vlogo.</p>
      </div>
    )
  }

  return children
}
