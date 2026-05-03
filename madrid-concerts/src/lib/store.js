import { EVENTS as SEED_EVENTS, VENUES as SEED_VENUES } from './data'

const EK = 'mc_events'
const VK = 'mc_venues'

export function getStoredEvents() {
  try {
    const raw = localStorage.getItem(EK)
    if (raw) return JSON.parse(raw)
  } catch {}
  localStorage.setItem(EK, JSON.stringify(SEED_EVENTS))
  return SEED_EVENTS
}

export function getStoredVenues() {
  try {
    const raw = localStorage.getItem(VK)
    if (raw) return JSON.parse(raw)
  } catch {}
  localStorage.setItem(VK, JSON.stringify(SEED_VENUES))
  return SEED_VENUES
}

export const saveEvents  = (d) => localStorage.setItem(EK, JSON.stringify(d))
export const saveVenues  = (d) => localStorage.setItem(VK, JSON.stringify(d))
