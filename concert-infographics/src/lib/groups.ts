import type { Concert } from '../types'
import { monthName, weekStart, yearOf } from './dates'

/** The entry's venue/label/director, or '' when neither it nor the doc-level fallback has one. */
export const venueName = (c: Concert, fallback: string) => c.venue || fallback.split('·')[0]?.trim() || ''

/** Venues with their shows, ordered by first appearance (input should be date-sorted). */
export function groupByVenue(concerts: Concert[], fallback: string) {
  const map = new Map<string, Concert[]>()
  for (const c of concerts) {
    const v = venueName(c, fallback)
    if (!v) continue
    map.set(v, [...(map.get(v) ?? []), c])
  }
  return [...map.entries()].map(([venue, items]) => ({ venue, items }))
}

export function groupByMonth(concerts: Concert[]) {
  const map = new Map<string, Concert[]>()
  for (const c of concerts.filter((c) => c.date)) {
    const key = c.date.slice(0, 7)
    map.set(key, [...(map.get(key) ?? []), c])
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: monthName(`${key}-01`),
    year: yearOf(`${key}-01`),
    items,
  }))
}

export function groupByWeek(concerts: Concert[]) {
  const map = new Map<string, Concert[]>()
  for (const c of concerts.filter((c) => c.date)) {
    const key = weekStart(c.date)
    map.set(key, [...(map.get(key) ?? []), c])
  }
  return [...map.entries()].map(([start, items]) => ({ start, items }))
}

/** "1 sala" / "3 salas" style noun agreement. */
export const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)
