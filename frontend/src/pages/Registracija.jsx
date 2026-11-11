import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function Registracija() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
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

  const inputClass = 'h-11 px-3 border border-stone-300 rounded-lg font-normal text-base'

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-stone-200 rounded-2xl p-8 flex flex-col gap-4"
      >
        <div>
          <div className="text-2xl font-extrabold">NašBlok</div>
          <div className="text-stone-500">Registracija z vabilom</div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold">
          Koda vabila
          <input required value={form.code} onChange={update('code')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Ime in priimek
          <input required value={form.full_name} onChange={update('full_name')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          E-poštni naslov
          <input type="email" required value={form.email} onChange={update('email')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Geslo (vsaj 8 znakov)
          <input type="password" required value={form.password} onChange={update('password')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Ponovite geslo
          <input type="password" required value={form.password2} onChange={update('password2')} className={inputClass} />
        </label>

        {error && <div className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</div>}

        <button
          type="submit"
          disabled={sending}
          className="h-11 rounded-lg bg-emerald-800 text-white font-bold disabled:opacity-60"
        >
          {sending ? 'Ustvarjam račun ...' : 'Ustvari račun'}
        </button>

        <p className="text-sm text-stone-600">
          Že imate račun?{' '}
          <Link to="/prijava" className="font-semibold text-emerald-800 hover:underline">
            Prijava
          </Link>
        </p>
      </form>
    </div>
  )
}
