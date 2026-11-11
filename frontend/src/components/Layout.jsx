import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { ANNOUNCEMENT_ROLES, ROLE_LABELS, VOTING_ROLES } from '../auth/roles.js'

export default function Layout() {
  const { user, building, roles, unit, hasRole, logout } = useAuth()
  const navigate = useNavigate()

  const onlyContractor = roles.length === 1 && roles[0] === 'CONTRACTOR'

  // Meni se sestavi glede na vloge. Serviser namesto "Okvare" vidi "Moje naloge".
  const links = [
    { to: '/', label: 'Domov', show: true },
    { to: '/okvare', label: onlyContractor ? 'Moje naloge' : 'Okvare', show: true },
    { to: '/glasovanja', label: 'Glasovanja', show: hasRole(...VOTING_ROLES) },
    { to: '/obvestila', label: 'Obvestila', show: hasRole(...ANNOUNCEMENT_ROLES) },
  ].filter((link) => link.show)

  // Predstavnik ima vlogi OWNER in REPRESENTATIVE, prikažem obe.
  const roleText = roles.map((role) => ROLE_LABELS[role]).join(', ')

  function handleLogout() {
    logout()
    navigate('/prijava')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100 text-stone-900">
      <nav className="md:w-64 bg-white border-b md:border-b-0 md:border-r border-stone-200 p-4 flex flex-col gap-1">
        <div className="text-xl font-extrabold px-3 py-2">NašBlok</div>
        {building && <div className="px-3 pb-3 text-sm text-stone-500">{building.name}</div>}

        <div className="flex md:flex-col flex-wrap gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg font-semibold ${
                  isActive ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="md:mt-auto mt-3 border-t border-stone-200 pt-3 px-3">
          <div className="font-semibold">{user.full_name}</div>
          <div className="text-sm text-stone-500">
            {roleText}
            {unit && ` · ${unit}`}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 text-sm font-semibold text-emerald-800 hover:underline"
          >
            Odjava
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
