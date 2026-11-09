import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Domov' },
  { to: '/okvare', label: 'Okvare' },
  { to: '/glasovanja', label: 'Glasovanja' },
  { to: '/obvestila', label: 'Obvestila' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100 text-stone-900">
      <nav className="md:w-60 bg-white border-b md:border-b-0 md:border-r border-stone-200 p-4 flex md:flex-col gap-1">
        <div className="text-xl font-extrabold px-3 py-2 md:mb-4">NašBlok</div>
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
      </nav>
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
