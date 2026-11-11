import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth/useAuth.js'

const inputClass = 'h-11 px-3 border border-stone-300 rounded-[10px] bg-white'
const primaryButton =
  'h-11 px-5 rounded-[10px] bg-brand text-white font-bold disabled:opacity-60'
const secondaryButton =
  'h-9 px-3 rounded-[10px] border border-stone-300 text-sm font-semibold hover:bg-stone-50'

export default function Stavba() {
  const { building, refreshUser, selectBuilding } = useAuth()
  const [info, setInfo] = useState({ name: '', address: '' })
  const [units, setUnits] = useState([])
  const [newLabel, setNewLabel] = useState('')
  const [editing, setEditing] = useState(null) // { id, label } stanovanja, ki ga urejam
  const [newBuilding, setNewBuilding] = useState({ name: '', address: '' })
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  const buildingId = building?.id

  // Podatke stavbe in seznam stanovanj naložim ob odprtju strani in ob menjavi stavbe.
  const load = useCallback(async () => {
    const [b, u] = await Promise.all([
      api(`/buildings/${buildingId}`),
      api(`/buildings/${buildingId}/units`),
    ])
    setInfo({ name: b.name, address: b.address })
    setUnits(u)
  }, [buildingId])

  useEffect(() => {
    if (buildingId) load().catch((err) => setMessage({ type: 'error', text: err.message }))
  }, [buildingId, load])

  // Vsako dejanje teče skozi to funkcijo, da so sporočila o uspehu in napakah enotna.
  async function run(action, okText) {
    setMessage(null)
    try {
      await action()
      if (okText) setMessage({ type: 'ok', text: okText })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  function saveInfo(e) {
    e.preventDefault()
    run(async () => {
      await api(`/buildings/${buildingId}`, { method: 'PATCH', body: info })
      await refreshUser() // ime stavbe se prikazuje tudi v meniju
    }, 'Podatki stavbe so shranjeni.')
  }

  function addUnit(e) {
    e.preventDefault()
    run(async () => {
      await api(`/buildings/${buildingId}/units`, { method: 'POST', body: { label: newLabel } })
      setNewLabel('')
      await load()
    }, 'Stanovanje je dodano.')
  }

  function saveUnit(e) {
    e.preventDefault()
    run(async () => {
      await api(`/buildings/${buildingId}/units/${editing.id}`, {
        method: 'PATCH',
        body: { label: editing.label },
      })
      setEditing(null)
      await load()
    }, 'Oznaka stanovanja je spremenjena.')
  }

  function deleteUnit(unit) {
    if (!window.confirm(`Ali res želite izbrisati ${unit.label}?`)) return
    run(async () => {
      await api(`/buildings/${buildingId}/units/${unit.id}`, { method: 'DELETE' })
      await load()
    }, 'Stanovanje je izbrisano.')
  }

  function createBuilding(e) {
    e.preventDefault()
    run(async () => {
      const created = await api('/buildings', { method: 'POST', body: newBuilding })
      setNewBuilding({ name: '', address: '' })
      await refreshUser()
      selectBuilding(created.id) // takoj preklopim na novo stavbo
    }, 'Nova stavba je ustvarjena. Zdaj ji dodajte stanovanja.')
  }

  if (!building) return null

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-3xl font-extrabold">Stavba in stanovanja</h1>

      {message && (
        <div
          className={`rounded-[10px] p-3 text-sm ${
            message.type === 'ok' ? 'bg-brand-light text-brand-dark' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Podatki stavbe */}
      <form onSubmit={saveInfo} className="bg-white border border-line rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold">Podatki stavbe</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Ime
            <input
              required
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Naslov
            <input
              required
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
              className={`${inputClass} font-normal`}
            />
          </label>
        </div>
        <div>
          <button type="submit" className={primaryButton}>Shrani</button>
        </div>
      </form>

      {/* Stanovanja */}
      <section className="bg-white border border-line rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold">Stanovanja ({units.length})</h2>

        <form onSubmit={addUnit} className="flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="new-unit">Oznaka novega stanovanja</label>
          <input
            id="new-unit"
            required
            placeholder="npr. Stanovanje 21, 5. nadstropje"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className={`${inputClass} flex-1 min-w-56`}
          />
          <button type="submit" className={primaryButton}>Dodaj stanovanje</button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-md">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2 font-semibold">Oznaka</th>
                <th className="py-2 font-semibold">Člani</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="border-t border-stone-100">
                  <td className="py-2 pr-3">
                    {editing?.id === unit.id ? (
                      <form onSubmit={saveUnit} className="flex gap-2">
                        <input
                          required
                          aria-label="Nova oznaka"
                          value={editing.label}
                          onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                          className="h-9 px-2 border border-stone-300 rounded-[10px] flex-1"
                        />
                        <button type="submit" className={secondaryButton}>Shrani</button>
                        <button type="button" onClick={() => setEditing(null)} className={secondaryButton}>
                          Prekliči
                        </button>
                      </form>
                    ) : (
                      <span className="font-semibold">{unit.label}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{unit.member_count}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {editing?.id !== unit.id && (
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditing({ id: unit.id, label: unit.label })}
                          className={secondaryButton}
                        >
                          Uredi
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUnit(unit)}
                          className={`${secondaryButton} text-red-700`}
                        >
                          Izbriši
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-muted">
                    Stavba še nima stanovanj.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nova stavba */}
      <form onSubmit={createBuilding} className="bg-white border border-dashed border-stone-300 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold">Nova stavba</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Ime
            <input
              required
              value={newBuilding.name}
              onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Naslov
            <input
              required
              value={newBuilding.address}
              onChange={(e) => setNewBuilding({ ...newBuilding, address: e.target.value })}
              className={`${inputClass} font-normal`}
            />
          </label>
        </div>
        <div>
          <button type="submit" className={primaryButton}>Ustvari stavbo</button>
        </div>
      </form>
    </div>
  )
}
