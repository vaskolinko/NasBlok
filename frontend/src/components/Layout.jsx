import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { ANNOUNCEMENT_ROLES, ROLE_LABELS, VOTING_ROLES } from '../auth/roles.js'
import {
  BellIcon,
  BuildingIcon,
  HomeIcon,
  Logo,
  LogoutIcon,
  VoteIcon,
  WrenchIcon,
} from './icons.jsx'


function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function MenuLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 min-h-11 px-3.5 rounded-[10px] text-[15px] font-semibold whitespace-nowrap no-underline ${
          isActive ? 'bg-brand-light text-brand' : 'text-stone-600 hover:bg-page'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}

export default function Layout() {
  const { user, buildings, building, selectBuilding, roles, unit, hasRole, logout } = useAuth()
  const navigate = useNavigate()

  const onlyContractor = roles.length === 1 && roles[0] === 'CONTRACTOR'
  // Predstavnik ima vlogi OWNER in REPRESENTATIVE, prikažem obe.
  const roleText = roles.map((role) => ROLE_LABELS[role]).join(', ')

  function handleLogout() {
    logout()
    navigate('/prijava')
  }

  return (
    <div className="min-h-screen bg-page text-stone-900 flex flex-col">
      {/* Glava */}
      <header className="bg-white border-b border-line px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 md:grid md:grid-cols-3">
        <Link to="/" className="flex items-center gap-2.5 text-stone-900 no-underline md:justify-self-start">
          <Logo />
          <span className="text-lg font-extrabold">NašBlok</span>
        </Link>

        <div className="order-3 w-full md:order-none md:w-auto md:justify-self-center">
          {buildings.length > 1 ? (
            <label>
              <span className="sr-only">Izberi stavbo</span>
              <select
                value={building?.id ?? ''}
                onChange={(e) => {
                  selectBuilding(Number(e.target.value))
                  navigate('/')
                }}
                className="w-full md:w-64 h-11 px-3 border border-line rounded-[10px] bg-white font-semibold"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            building && (
              <div className="h-11 px-4 flex items-center justify-center border border-line rounded-[10px] font-semibold">
                {building.name}
              </div>
            )
          )}
        </div>

        <div className="flex items-center gap-3 md:justify-self-end">
          <div className="text-right leading-tight">
            <div className="font-bold text-sm">{user.full_name}</div>
            <div className="text-xs text-muted">
              {roleText}
              {unit && ` · ${unit}`}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent font-extrabold text-sm flex items-center justify-center">
            {initials(user.full_name)}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Odjava"
            title="Odjava"
            className="w-10 h-10 rounded-[10px] border border-line text-muted hover:bg-page flex items-center justify-center"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Stranski meni */}
        <nav className="bg-white border-b md:border-b-0 md:border-r border-line md:w-60 p-3 md:p-4 flex md:flex-col gap-1 overflow-x-auto">
          <MenuLink to="/" icon={<HomeIcon />}>Domov</MenuLink>
          <MenuLink to="/okvare" icon={<WrenchIcon />}>
            {onlyContractor ? 'Moje naloge' : 'Okvare'}
          </MenuLink>
          {hasRole(...VOTING_ROLES) && (
            <MenuLink to="/glasovanja" icon={<VoteIcon />}>Glasovanja</MenuLink>
          )}
          {hasRole(...ANNOUNCEMENT_ROLES) && (
            <MenuLink to="/obvestila" icon={<BellIcon />}>Obvestila</MenuLink>
          )}

          {hasRole('MANAGER') && (
            <>
              <div className="hidden md:block text-xs font-bold tracking-wider text-muted mt-5 mb-1 px-3.5">
                UPRAVLJANJE
              </div>
              <MenuLink to="/stavba" icon={<BuildingIcon />}>Stavba in stanovanja</MenuLink>
            </>
          )}
        </nav>

        <main className="flex-1 min-w-0 p-6 md:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
