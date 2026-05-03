import { useState, useMemo } from 'react'
import EventCard from '../components/EventCard'
import { EVENTS, VENUES, GENRES } from '../lib/data'
import { getEventRating } from '../lib/ratings'

const venueMap = Object.fromEntries(VENUES.map(v => [v.id, v]))

export default function Home() {
  const [search, setSearch] = useState('')
  const [genre,  setGenre]  = useState('')
  const [sort,   setSort]   = useState('date')

  const events = useMemo(() => {
    const q = search.toLowerCase()
    return EVENTS
      .filter(e => {
        if (q && !e.artist.toLowerCase().includes(q) &&
                 !e.title.toLowerCase().includes(q) &&
                 !(venueMap[e.venue_id]?.name.toLowerCase().includes(q))) return false
        if (genre && e.genre !== genre) return false
        return true
      })
      .sort((a, b) => {
        if (sort === 'date')       return new Date(a.date) - new Date(b.date)
        if (sort === 'rating')     return getEventRating(b.id).average - getEventRating(a.id).average
        if (sort === 'price-asc')  return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        return 0
      })
  }, [search, genre, sort])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-white mb-1">Próximos Conciertos</h1>
        <p className="text-gray-500">Descubre y valora los mejores eventos de Madrid</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar artista o sala…"
          className="flex-1 min-w-52 bg-c-card border border-c-border text-white placeholder-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-500"
        />
        <select value={genre} onChange={e => setGenre(e.target.value)}
          className="bg-c-card border border-c-border text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500">
          <option value="">Todos los géneros</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-c-card border border-c-border text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500">
          <option value="date">Por fecha</option>
          <option value="rating">Mejor valorados</option>
          <option value="price-asc">Precio: menor primero</option>
          <option value="price-desc">Precio: mayor primero</option>
        </select>
      </div>

      <p className="text-gray-600 text-xs mb-5">{events.length} evento{events.length !== 1 && 's'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(e => (
          <EventCard key={e.id} event={e} venue={venueMap[e.venue_id]} rating={getEventRating(e.id)} />
        ))}
        {!events.length && (
          <p className="col-span-3 text-center text-gray-600 py-16">No hay eventos con esos filtros.</p>
        )}
      </div>
    </main>
  )
}
