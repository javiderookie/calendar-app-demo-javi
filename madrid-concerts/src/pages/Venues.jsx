import Stars from '../components/Stars'
import { VENUES, EVENTS } from '../lib/data'
import { getEventRating } from '../lib/ratings'

function venueStats(venueId) {
  const events = EVENTS.filter(e => e.venue_id === venueId)
  const allVotes = events.flatMap(e => {
    const r = getEventRating(e.id)
    return r.count > 0 ? [{ avg: r.average, count: r.count }] : []
  })
  if (!allVotes.length) return { average: 0, votes: 0, events: events.length }
  const totalVotes = allVotes.reduce((s, v) => s + v.count, 0)
  const weightedAvg = allVotes.reduce((s, v) => s + v.avg * v.count, 0) / totalVotes
  return { average: weightedAvg, votes: totalVotes, events: events.length }
}

export default function Venues() {
  const venues = VENUES
    .map(v => ({ ...v, stats: venueStats(v.id) }))
    .sort((a, b) => b.stats.average - a.stats.average)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-white mb-1">Salas de Madrid</h1>
        <p className="text-gray-500">Ranking por valoración media de sus conciertos</p>
      </div>

      <div className="space-y-3">
        {venues.map((v, i) => (
          <div key={v.id}
            className="flex gap-0 bg-c-card border border-c-border rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
            {/* Thumbnail */}
            <div className="relative w-28 md:w-40 flex-shrink-0">
              <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-black text-2xl opacity-60">#{i + 1}</span>
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-1 items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-0.5">{v.name}</h3>
                <p className="text-gray-500 text-xs mb-2">{v.address} · {v.neighborhood} · aforo {v.capacity}</p>
                <p className="text-gray-600 text-xs line-clamp-2">{v.description}</p>
              </div>
              {/* Score */}
              <div className="text-center flex-shrink-0">
                <p className="text-3xl font-black text-white leading-none mb-1">
                  {v.stats.average > 0 ? v.stats.average.toFixed(1) : '—'}
                </p>
                <div className="flex justify-center mb-1">
                  <Stars value={Math.round(v.stats.average)} readonly size="sm" />
                </div>
                <p className="text-gray-600 text-xs">{v.stats.votes} votos</p>
                <p className="text-gray-700 text-xs">{v.stats.events} eventos</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
