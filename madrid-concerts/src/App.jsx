import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import Venues from './pages/Venues'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-c-dark">
        <Header />
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/evento/:id" element={<EventDetail />} />
          <Route path="/salas"      element={<Venues />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
