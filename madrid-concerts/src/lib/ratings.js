const KEY     = 'mc_ratings'
const VOTER_K = 'mc_voter_id'

function voterId() {
  let id = localStorage.getItem(VOTER_K)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(VOTER_K, id) }
  return id
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function save(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getEventRating(eventId) {
  const d = load()[eventId]
  if (!d) return { average: 0, count: 0 }
  const avg = d.votes.reduce((s, v) => s + v.stars, 0) / d.votes.length
  return { average: avg, count: d.votes.length }
}

export function getMyRating(eventId) {
  const d = load()[eventId]
  if (!d) return null
  return d.votes.find(v => v.id === voterId())?.stars ?? null
}

export function submitRating(eventId, stars) {
  const data  = load()
  const vid   = voterId()
  if (!data[eventId]) data[eventId] = { votes: [] }

  const idx = data[eventId].votes.findIndex(v => v.id === vid)
  if (idx >= 0) data[eventId].votes[idx].stars = stars
  else data[eventId].votes.push({ id: vid, stars })

  save(data)
  return getEventRating(eventId)
}
