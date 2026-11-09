import { useEffect, useState } from 'react'

export default function Domov() {
  const [backend, setBackend] = useState('preverjam ...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackend(data.status === 'ok' ? 'deluje' : 'napaka'))
      .catch(() => setBackend('ni dosegljiv'))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Domov</h1>
      <p className="mt-4 text-stone-600">Backend: {backend}</p>
    </div>
  )
}
