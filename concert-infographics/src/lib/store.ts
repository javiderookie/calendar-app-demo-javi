import { createStore } from 'solid-js/store'
import { createEffect } from 'solid-js'
import type { Concert, Infographic } from '../types'

const STORAGE_KEY = 'concert-infographics:draft'

export const newConcert = (partial: Partial<Concert> = {}): Concert => ({
  id: crypto.randomUUID(),
  artist: '',
  date: '',
  time: '20:00',
  venue: '',
  price: '',
  note: '',
  ...partial,
})

const sample = (): Infographic => ({
  kind: 'cycle',
  title: 'Noches de Jazz',
  subtitle: 'Ciclo de otoño 2026',
  venue: 'Café Central · Madrid',
  ticketsUrl: 'tuweb-de-entradas.com',
  footer: 'notedetengas.es',
  formatId: 'portrait',
  templateId: 'bold',
  palette: { bg: '#111111', fg: '#f5f1e8', accent: '#ff5a36' },
  concerts: [
    newConcert({ artist: 'Artista uno', date: '2026-11-06', price: '18 €' }),
    newConcert({ artist: 'Artista dos', date: '2026-11-13', price: '18 €' }),
    newConcert({ artist: 'Artista tres', date: '2026-11-20', price: '22 €' }),
  ],
})

const load = (): Infographic => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...sample(), ...JSON.parse(raw) }
  } catch {
    // ignore corrupt or unavailable storage
  }
  return sample()
}

export const [doc, setDoc] = createStore<Infographic>(load())

// Call from inside a component so the effect has an owner.
export const persistDoc = () =>
  createEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
    } catch {
      // storage unavailable
    }
  })

export const resetDoc = () => setDoc(sample())
