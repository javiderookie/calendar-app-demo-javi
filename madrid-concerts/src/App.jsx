import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Header from './components/Header'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import Venues from './pages/Venues'
import Admin from './pages/Admin'

function MainLayout() {
  return (
    <div className="min-h-screen bg-c-dark">
      <Header />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route element={<MainLayout />}>
            <Route path="/"           element={<Home />} />
            <Route path="/evento/:id" element={<EventDetail />} />
            <Route path="/salas"      element={<Venues />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
