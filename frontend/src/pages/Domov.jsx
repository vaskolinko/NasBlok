import { useAuth } from '../auth/useAuth.js'
import { ROLE_LABELS } from '../auth/roles.js'

export default function Domov() {
  const { user, building, roles, unit } = useAuth()

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Pozdravljeni, {user.full_name}</h1>
      <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6 max-w-lg">
        <div className="text-sm text-stone-500">Stavba</div>
        <div className="text-lg font-bold">{building ? building.name : 'Niste član nobene stavbe'}</div>
        <div className="mt-3 text-sm text-stone-500">Vloga</div>
        <div className="font-semibold">{roles.map((r) => ROLE_LABELS[r]).join(', ')}</div>
        {unit && (
          <>
            <div className="mt-3 text-sm text-stone-500">Stanovanje</div>
            <div className="font-semibold">{unit}</div>
          </>
        )}
      </div>
    </div>
  )
}
