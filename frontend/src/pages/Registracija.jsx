import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import AuthShell from '../components/AuthShell.jsx'

const inputClass = 'h-12 px-3.5 border border-stone-300 rounded-xl font-normal text-base bg-white'

export default function Registracija() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  // Koda je lahko že v povezavi vabila, npr. /registracija?koda=LASTNIK-TEST
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    code: searchParams.get('koda') ?? '',
    full_name: '',
    email: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (user) return <Navigate to="/" replace />

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Ista pravila preverja tudi backend. Tu jih preverim samo zato, da
    // uporabnik napako vidi takoj, brez čakanja na odgovor strežnika.
    if (form.password.length < 8) {
      setError('Geslo mora imeti vsaj 8 znakov.')
      return
    }
    if (form.password !== form.password2) {
      setError('Gesli se ne ujemata.')
      return
    }

    setSending(true)
    try {
      await register({
        code: form.code,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthShell subtitle="Registracija z vabilom">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Koda vabila
          <input required value={form.code} onChange={update('code')} placeholder="XXXX-XXXX" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Ime in priimek
          <input required value={form.full_name} onChange={update('full_name')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          E-poštni naslov
          <input type="email" required value={form.email} onChange={update('email')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Geslo (vsaj 8 znakov)
          <input type="password" required value={form.password} onChange={update('password')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Ponovite geslo
          <input type="password" required value={form.password2} onChange={update('password2')} className={inputClass} />
        </label>

        {error && <div className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</div>}

        <button type="submit" disabled={sending} className="h-12 rounded-xl bg-brand text-white font-extrabold disabled:opacity-60">
          {sending ? 'Ustvarjam račun ...' : 'Ustvari račun'}
        </button>
      </form>

      <p className="mt-5 text-sm text-muted">
        Že imate račun?{' '}
        <Link to="/prijava" className="font-bold text-brand hover:underline">
          Prijava
        </Link>
      </p>
    </AuthShell>
  )
}
