import type { Concert, Infographic } from '../types'
import { dotDate, yearOf } from './dates'

export type InfoType = 'cycle' | 'discography' | 'album' | 'filmography' | 'filmcycle'

interface Noun {
  one: string
  many: string
}

export interface InfoTypeConfig {
  id: InfoType
  label: string
  icon: string
  hint: string
  /** Label for the main title field (the band, the cycle, the album, the actor…). */
  subject: string
  subtitleHint: string
  /** Section title for the list of entries in the editor and templates. */
  listTitle: string
  item: Noun
  /** What the "venue" slot means for this type, or null to hide it. */
  group: Noun | null
  dateMode: 'day' | 'year' | 'none'
  /** Editor labels per entry field; null hides the field. */
  fields: { artist: string; venue: string | null; date: string | null; time: string | null; price: string | null; note: string }
  timeInput: 'time' | 'text'
  /** Entries keep the order they were typed in (tracklists) instead of date order. */
  keepOrder: boolean
  /** Templates that suit this type best, first one is the default. */
  templates: string[]
}

export const INFO_TYPES: InfoTypeConfig[] = [
  {
    id: 'cycle',
    label: 'Ciclo musical',
    icon: '🎤',
    hint: 'Conciertos, festivales, giras',
    subject: 'Nombre del ciclo o festival',
    subtitleHint: 'Fechas, edición…',
    listTitle: 'El cartel',
    item: { one: 'concierto', many: 'conciertos' },
    group: { one: 'sala', many: 'salas' },
    dateMode: 'day',
    fields: { artist: 'Artista', venue: 'Sala', date: 'Fecha', time: 'Hora', price: 'Precio', note: 'Nota' },
    timeInput: 'time',
    keepOrder: false,
    templates: ['bee', 'madrid', 'map', 'iso', 'analog', 'disc', 'bubbles', 'chronicle', 'cables', 'mix', 'zine'],
  },
  {
    id: 'discography',
    label: 'Discografía',
    icon: '💿',
    hint: 'Los discos de un grupo o artista',
    subject: 'Grupo o artista',
    subtitleHint: 'p. ej. Discografía 2008 – 2026',
    listTitle: 'Discografía',
    item: { one: 'disco', many: 'discos' },
    group: { one: 'sello', many: 'sellos' },
    dateMode: 'year',
    fields: { artist: 'Título del disco', venue: 'Sello', date: 'Fecha de salida', time: null, price: 'Formato (LP, EP…)', note: 'Nota' },
    timeInput: 'text',
    keepOrder: false,
    templates: ['zine', 'chronicle', 'disc', 'cables', 'analog'],
  },
  {
    id: 'album',
    label: 'Álbum',
    icon: '🎶',
    hint: 'Las canciones de un disco',
    subject: 'Título del disco',
    subtitleHint: 'Artista · año · sello',
    listTitle: 'Canciones',
    item: { one: 'canción', many: 'canciones' },
    group: null,
    dateMode: 'none',
    fields: { artist: 'Canción', venue: null, date: null, time: 'Duración (3:45)', price: null, note: 'Nota (single, colaboración…)' },
    timeInput: 'text',
    keepOrder: true,
    templates: ['zine', 'analog', 'cables', 'mix'],
  },
  {
    id: 'filmography',
    label: 'Filmografía',
    icon: '🎬',
    hint: 'Las películas de un actor, actriz o director/a',
    subject: 'Actor, actriz o director/a',
    subtitleHint: 'p. ej. Filmografía 1990 – 2025',
    listTitle: 'Filmografía',
    item: { one: 'película', many: 'películas' },
    group: { one: 'director/a', many: 'directores' },
    dateMode: 'year',
    fields: { artist: 'Película', venue: 'Director/a', date: 'Estreno', time: null, price: 'Papel', note: 'Nota (premios…)' },
    timeInput: 'text',
    keepOrder: false,
    templates: ['chronicle', 'zine', 'disc', 'cables'],
  },
  {
    id: 'filmcycle',
    label: 'Ciclo de cine',
    icon: '🎞️',
    hint: 'Proyecciones en filmotecas, cines, festivales',
    subject: 'Nombre del ciclo',
    subtitleHint: 'Fechas, sede…',
    listTitle: 'Programación',
    item: { one: 'proyección', many: 'proyecciones' },
    group: { one: 'sala', many: 'salas' },
    dateMode: 'day',
    fields: { artist: 'Película', venue: 'Sala o cine', date: 'Fecha', time: 'Hora', price: 'Precio', note: 'Nota (VOSE, coloquio…)' },
    timeInput: 'time',
    keepOrder: false,
    templates: ['chronicle', 'disc', 'bubbles', 'madrid', 'mix', 'bee'],
  },
]

export const infoTypeOf = (doc: Pick<Infographic, 'infoType'>) => INFO_TYPES.find((t) => t.id === doc.infoType) ?? INFO_TYPES[0]

/** Date label in the type's resolution: "07.03", "2014" or the track number. */
export const fmtWhen = (doc: Pick<Infographic, 'infoType'>, c: Concert, index?: number) => {
  const mode = infoTypeOf(doc).dateMode
  if (mode === 'none') return index === undefined ? '' : String(index + 1).padStart(2, '0')
  return mode === 'year' ? yearOf(c.date) : dotDate(c.date)
}

export const noun = (n: Noun, count: number) => (count === 1 ? n.one : n.many)
