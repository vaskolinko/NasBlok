import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

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
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-stone-200 rounded-2xl p-8 flex flex-col gap-4"
      >
        <div>
          <div className="text-2xl font-extrabold">NašBlok</div>
          <div className="text-stone-500">Prijava</div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold">
          E-poštni naslov
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-3 border border-stone-300 rounded-lg font-normal text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold">
          Geslo
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 px-3 border border-stone-300 rounded-lg font-normal text-base"
          />
        </label>

        {error && <div className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</div>}

        <button
          type="submit"
          disabled={sending}
          className="h-11 rounded-lg bg-emerald-800 text-white font-bold disabled:opacity-60"
        >
          {sending ? 'Prijavljam ...' : 'Prijava'}
        </button>

        <p className="text-sm text-stone-600">
          Imate vabilo?{' '}
          <Link to="/registracija" className="font-semibold text-emerald-800 hover:underline">
            Ustvarite račun
          </Link>
        </p>
      </form>
    </div>
  )
}
