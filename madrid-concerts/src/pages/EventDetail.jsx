import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import Stars from '../components/Stars'
import { EVENTS, VENUES } from '../lib/data'
import { getEventRating, getMyRating, submitRating } from '../lib/ratings'

export default function EventDetail() {
  const { id }  = useParams()
  const event   = EVENTS.find(e => e.id === id)
  const venue   = event ? VENUES.find(v => v.id === event.venue_id) : null

  const [rating,   setRating]   = useState(() => getEventRating(id))
  const [myRating, setMyRating] = useState(() => getMyRating(id))
  const [selected, setSelected] = useState(() => getMyRating(id) || 0)
  const [voted,    setVoted]    = useState(() => getMyRating(id) !== null)

  if (!event) return (
    <div className="text-center py-24 text-gray-500">
      Evento no encontrado. <Link to="/" className="text-c-red hover:underline">Volver</Link>
    </div>
  )

  const dateStr = new Date(`${event.date}T${event.time}`).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  function handleVote() {
    if (!selected) return
    const r = submitRating(id, selected)
    setRating(r)
    setMyRating(selected)
    setVoted(true)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Volver a eventos
      </Link>

      {/* Hero */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="text-xs font-bold bg-c-red text-white px-3 py-1 rounded-full mb-3 inline-block">
            {event.genre}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Info */}
        <div className="md:col-span-2 space-y-5">
          <p className="text-gray-400 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Artista',   event.artist],
              ['Sala',      venue?.name],
              ['Fecha',     <span className="capitalize">{dateStr}</span>],
              ['Hora',      event.time],
              ['Precio',    event.price === 0 ? 'Entrada gratuita' : `${event.price} €`],
              ['Dirección', venue ? `${venue.address}, ${venue.neighborhood}` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-c-card border border-c-border rounded-xl p-4">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className="text-white font-semibold text-sm">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rating panel */}
        <div className="space-y-4">
          {/* Promedio */}
          <div className="bg-c-card border border-c-border rounded-xl p-5 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Valoración media</p>
            {rating.count > 0 ? (
              <>
                <p className="text-5xl font-bold text-white leading-none mb-2">{rating.average.toFixed(1)}</p>
                <div className="flex justify-center mb-1"><Stars value={Math.round(rating.average)} readonly /></div>
                <p className="text-gray-600 text-xs">{rating.count} {rating.count === 1 ? 'valoración' : 'valoraciones'}</p>
              </>
            ) : (
              <p className="text-gray-600 text-sm py-4">Aún sin valoraciones.<br/>¡Sé el primero!</p>
            )}
          </div>

          {/* Votar */}
          <div className="bg-c-card border border-c-border rounded-xl p-5">
            {voted ? (
              <div className="text-center">
                <p className="text-green-400 font-semibold mb-1 text-sm">¡Gracias por votar!</p>
                <p className="text-gray-500 text-xs mb-1">Tu puntuación</p>
                <div className="flex justify-center mb-3"><Stars value={myRating} readonly size="lg" /></div>
                <button onClick={() => setVoted(false)}
                  className="text-gray-600 text-xs hover:text-gray-400 underline transition-colors">
                  Cambiar valoración
                </button>
              </div>
            ) : (
              <>
                <p className="text-white font-semibold text-sm mb-1">¿Estuviste allí?</p>
                <p className="text-gray-500 text-xs mb-4">Valora tu experiencia</p>
                <div className="flex justify-center mb-4">
                  <Stars value={selected} onChange={setSelected} size="lg" />
                </div>
                <button onClick={handleVote} disabled={!selected}
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors
                    bg-c-red hover:bg-red-700 disabled:bg-c-border disabled:text-gray-600 text-white">
                  {selected ? `Enviar ${selected} ★` : 'Selecciona una nota'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
