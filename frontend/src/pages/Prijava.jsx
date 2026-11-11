import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import AuthShell from '../components/AuthShell.jsx'

const inputClass = 'h-12 px-3.5 border border-stone-300 rounded-xl font-normal text-base bg-white'

export default function Prijava() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  // Kdor je že prijavljen, nima kaj iskati na strani za prijavo.
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthShell subtitle="Prijava">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          E-poštni naslov
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Geslo
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>

        {error && <div className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</div>}

        <button type="submit" disabled={sending} className="h-12 rounded-xl bg-brand text-white font-extrabold disabled:opacity-60">
          {sending ? 'Prijavljam ...' : 'Prijava'}
        </button>
      </form>

      <div className="mt-6 border border-dashed border-stone-300 rounded-xl p-4 text-sm">
        <div className="font-bold">Imate vabilo?</div>
        <div className="text-muted mt-1">Vnesite kodo, ki ste jo prejeli od upravnika ali lastnika stanovanja.</div>
        <Link to="/registracija" className="inline-block mt-2 font-bold text-brand hover:underline">
          Ustvarite račun
        </Link>
      </div>
    </AuthShell>
  )
}
