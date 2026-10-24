import { createStore } from 'solid-js/store'
import { createEffect } from 'solid-js'
import type { Concert, Infographic } from '../types'
import { templateById } from '../templates'
import { INFO_TYPES, type InfoType } from './infoTypes'

const STORAGE_KEY = 'concert-infographics:draft'

export const newConcert = (partial: Partial<Concert> = {}): Concert => ({
  id: crypto.randomUUID(),
  artist: '',
  date: '',
  time: '20:00',
  venue: '',
  price: '',
  note: '',
  image: '',
  coords: '',
  ...partial,
})

const sample = (): Infographic => ({
  kind: 'cycle',
  title: 'Noches de Jazz',
  subtitle: 'Ciclo de otoño 2026',
  banner: 'El cartel',
  infoType: 'cycle',
  venue: 'Café Central · Madrid',
  ticketsUrl: 'tuweb-de-entradas.com',
  footer: 'notedetengas.es',
  credit: 'Por Javi · notedetengas',
  intro: 'Cuatro viernes de otoño para escuchar jazz de cerca, como se escuchaba antes: sin prisa y en directo.',
  highlight: { big: '4', text: 'noches de jazz en directo' },
  mapImage: '',
  logo: '',
  formatId: 'a4',
  templateId: 'analog',
  palette: { ...templateById('analog').palette },
  concerts: [
    newConcert({ artist: 'Artista uno', date: '2026-11-06', price: '18 €' }),
    newConcert({ artist: 'Artista dos', date: '2026-11-13', price: '18 €' }),
    newConcert({ artist: 'Artista tres', date: '2026-11-20', price: '22 €' }),
    newConcert({ artist: 'Artista cuatro', date: '2026-11-27', price: '22 €' }),
  ],
})

const load = (): Infographic => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const base = sample()
      const saved = JSON.parse(raw) as Partial<Infographic> & { dateMode?: string }
      // Drafts from before infoType existed: year-only dates meant a discography.
      if (!saved.infoType) saved.infoType = saved.dateMode === 'year' ? 'discography' : 'cycle'
      delete saved.dateMode
      return {
        ...base,
        ...saved,
        palette: { ...base.palette, ...saved.palette },
        highlight: { ...base.highlight, ...saved.highlight },
        concerts: (saved.concerts ?? base.concerts).map((c) => newConcert(c)),
      }
    }
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

// Bee Week Madrid, first line-up announcement (data from the festival poster).
const beeWeek = (templateId = 'bee'): Infographic => {
  const c = (artist: string, date: string, venue: string) => newConcert({ artist, date, venue, time: '' })
  return {
    kind: 'cycle',
    title: 'bee week',
    subtitle: 'Marzo - Abril',
    banner: 'Primer avance de cartel',
    infoType: 'cycle',
    venue: 'Madrid · Salas · Abejas · Conciertos',
    ticketsUrl: '',
    footer: '@beeweekfest',
    credit: 'El festival de la primavera',
    intro: '¡Y muchos más por confirmar!',
    highlight: { big: '', text: '' },
    mapImage: '',
    logo: '',
    formatId: 'portrait',
    templateId,
    palette: { ...templateById(templateId).palette },
    concerts: [
      c('Oslo Ovnies', '2027-03-07', 'El Sol'),
      c('Holywater', '2027-03-12', 'Siroco'),
      c('Willy Dolores', '2027-04-02', 'El Sótano'),
      c('Guadalupe Plata', '2027-04-08', 'Copérnico'),
      c('Cora Yako', '2027-04-09', 'La Riviera'),
      c('Hnos. Muñoz', '2027-04-10', 'Siroco'),
      c('Le Parody', '2027-04-15', 'Villanos'),
      c('Anadie', '2027-04-16', 'Uni'),
      c('Morreo', '2027-04-22', 'Clamores'),
      c('Hermanos Visi', '2027-04-23', 'Siroco'),
      c('Niñatas', '2027-04-23', 'El Sótano'),
    ],
  }
}

// Los Punsetes discography. Release years from Wikipedia, Neo2, Indie Hoy and LaHiguera;
// labels only where a source confirms them. The 2026 album is announced, not yet out.
const punsetes = (): Infographic => {
  const d = (artist: string, date: string, venue = '', note = '') => newConcert({ artist, date, venue, note, time: '' })
  return {
    kind: 'cycle',
    title: 'Los Punsetes',
    subtitle: 'Discografía 2008 – 2026',
    banner: 'Pop, punk y mala leche',
    infoType: 'discography',
    venue: '',
    ticketsUrl: '',
    footer: 'notedetengas.es',
    credit: 'Por Javi · notedetengas',
    intro: 'Desde Madrid: siete discos de estudio, un tributo con 21 bandas por sus 20 años y un disco nuevo en camino.',
    highlight: { big: '20', text: 'años de trayectoria' },
    mapImage: '',
    logo: '',
    formatId: 'portrait',
    templateId: 'zine',
    palette: { ...templateById('zine').palette },
    concerts: [
      d('Los Punsetes', '2008-01-01', 'Gramaciones Grabofónicas', 'Debut con licencia Creative Commons'),
      d('LP2', '2010-01-01', 'Everlasting', 'Producción de David Rodríguez'),
      d('Una montaña es una montaña', '2012-01-01', 'Everlasting'),
      d('LPIV', '2014-01-01'),
      d('¡Viva!', '2017-03-10', '', 'Producido por El Guincho'),
      d('Aniquilación', '2019-01-01', '', 'Sexto álbum'),
      d('AFDTRQHOT', '2022-11-25', 'Sonido Muchacho', 'Al final del túnel resulta que hay otro túnel'),
      d('Que le den por culo a tus amigos', '2024-01-01', 'Sonido Muchacho', 'Tributo: 21 bandas versionan sus canciones'),
      d('Un río de angustia desbocada', '2026-11-13', 'Sonido Muchacho', 'Anunciado para el 13 de noviembre'),
    ],
  }
}

/** A blank draft for the given type, so we can start building from scratch. */
export const blankDoc = (type: InfoType): Infographic => {
  const cfg = INFO_TYPES.find((t) => t.id === type) ?? INFO_TYPES[0]
  const templateId = cfg.templates[0]
  return {
    ...sample(),
    infoType: type,
    kind: 'cycle',
    title: '',
    subtitle: '',
    banner: '',
    venue: '',
    ticketsUrl: '',
    intro: '',
    highlight: { big: '', text: '' },
    templateId,
    palette: { ...templateById(templateId).palette },
    concerts: [newConcert({ time: '' }), newConcert({ time: '' }), newConcert({ time: '' })],
  }
}

export const PRESETS = [
  { id: 'demo', label: 'Noches de Jazz (demo)', build: sample },
  { id: 'beeweek', label: 'Bee Week 2027 · cartel', build: () => beeWeek('bee') },
  { id: 'beeweek-map', label: 'Bee Week 2027 · mapa de Madrid', build: () => beeWeek('madrid') },
  { id: 'punsetes', label: 'Los Punsetes · discografía', build: punsetes },
]

export const loadPreset = (id: string) => setDoc((PRESETS.find((p) => p.id === id) ?? PRESETS[0]).build())
