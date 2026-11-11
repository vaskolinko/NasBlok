import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { ANNOUNCEMENT_ROLES, VOTING_ROLES } from '../auth/roles.js'
import { BellIcon, VoteIcon, WrenchIcon } from '../components/icons.jsx'



function ShortcutCard({ to, icon, iconClass, title, text }) {
  return (
    <Link
      to={to}
      className="bg-white border border-line rounded-2xl p-5 flex items-center gap-4 text-stone-900 no-underline hover:border-brand"
    >
      <span className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${iconClass}`}>
        {icon}
      </span>
      <span>
        <span className="block font-extrabold">{title}</span>
        <span className="block text-sm text-muted">{text}</span>
      </span>
    </Link>
  )
}

export default function Domov() {
  const { user, building, hasRole } = useAuth()
  const firstName = user.full_name.split(' ')[0]
  const today = new Date().toLocaleDateString('sl-SI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <div className="text-sm text-muted first-letter:uppercase">{today}</div>
        <h1 className="text-3xl font-extrabold">Dober dan, {firstName}</h1>
        {building && <div className="text-muted mt-1">{building.name}</div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ShortcutCard
          to="/okvare"
          icon={<WrenchIcon />}
          iconClass="bg-amber-100 text-amber-700"
          title="Okvare"
          text="Prijavite okvaro ali spremljajte njeno reševanje."
        />
        {hasRole(...VOTING_ROLES) && (
          <ShortcutCard
            to="/glasovanja"
            icon={<VoteIcon />}
            iconClass="bg-brand-light text-brand"
            title="Glasovanja"
            text="Glasujte o sklepih stavbe."
          />
        )}
        {hasRole(...ANNOUNCEMENT_ROLES) && (
          <ShortcutCard
            to="/obvestila"
            icon={<BellIcon />}
            iconClass="bg-indigo-100 text-indigo-800"
            title="Obvestila"
            text="Preberite obvestila upravnika."
          />
        )}
      </div>
    </div>
  )
}
