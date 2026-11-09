import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Domov from './pages/Domov.jsx'
import Okvare from './pages/Okvare.jsx'
import Glasovanja from './pages/Glasovanja.jsx'
import Obvestila from './pages/Obvestila.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Domov />} />
        <Route path="/okvare" element={<Okvare />} />
        <Route path="/glasovanja" element={<Glasovanja />} />
        <Route path="/obvestila" element={<Obvestila />} />
      </Route>
    </Routes>
  )
}
