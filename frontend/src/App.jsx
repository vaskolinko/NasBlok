import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ANNOUNCEMENT_ROLES, VOTING_ROLES } from './auth/roles.js'
import Domov from './pages/Domov.jsx'
import Okvare from './pages/Okvare.jsx'
import Glasovanja from './pages/Glasovanja.jsx'
import Obvestila from './pages/Obvestila.jsx'
import Prijava from './pages/Prijava.jsx'
import Registracija from './pages/Registracija.jsx'

export default function App() {
  return (
    <Routes>
      {/* javno vsem roles */}
      <Route path="/prijava" element={<Prijava />} />
      <Route path="/registracija" element={<Registracija />} />

      {/* vse ostalo zahteva prijavo */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Domov />} />
        <Route path="/okvare" element={<Okvare />} />
        <Route
          path="/glasovanja"
          element={
            <ProtectedRoute roles={VOTING_ROLES}>
              <Glasovanja />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obvestila"
          element={
            <ProtectedRoute roles={ANNOUNCEMENT_ROLES}>
              <Obvestila />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
