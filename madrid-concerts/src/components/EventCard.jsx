import { Link } from 'react-router-dom'
import Stars from './Stars'

export default function EventCard({ event, venue, rating }) {
  const d = new Date(`${event.date}T${event.time}`)
  const dateStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <Link to={`/evento/${event.id}`} className="group block">
      <div className="bg-c-card border border-c-border rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40">
        <div className="relative h-44 overflow-hidden">
          <img src={event.image} alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <span className="absolute top-3 left-3 text-xs font-bold bg-c-red text-white px-2.5 py-1 rounded-full">
            {event.genre}
          </span>
          <span className="absolute bottom-3 left-3 text-white text-xs font-semibold">
            {dateStr} · {event.time}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-sm leading-snug mb-1 group-hover:text-c-red transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-gray-500 text-xs mb-3">{venue?.name} · {venue?.neighborhood}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Stars value={Math.round(rating.average)} readonly size="sm" />
              <span className="text-gray-600 text-xs">
                {rating.count > 0 ? `${rating.average.toFixed(1)} (${rating.count})` : 'Sin votos'}
              </span>
            </div>
            <span className="text-white font-bold text-sm">
              {event.price === 0 ? 'Gratis' : `${event.price}€`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
