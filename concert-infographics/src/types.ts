export type Kind = 'single' | 'cycle'

export interface Concert {
  id: string
  artist: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  venue: string
  price: string
  note: string
  image: string // resized data URL, optional
  pin?: { x: number; y: number } // map position in %, optional
  coords: string // "lat, lon" override for real maps, optional
}

export interface Infographic {
  kind: Kind
  title: string
  subtitle: string
  banner: string
  /** What the infographic is about; drives editor fields and template wording. */
  infoType: import('./lib/infoTypes').InfoType
  venue: string
  ticketsUrl: string
  footer: string
  credit: string
  intro: string
  highlight: { big: string; text: string }
  mapImage: string
  /** Band/festival logo as a PNG data URL (keeps transparency). */
  logo: string
  formatId: FormatId
  templateId: string
  palette: Palette
  concerts: Concert[]
}

export type FormatId = 'square' | 'portrait' | 'story' | 'blog' | 'a4'

export interface Format {
  id: FormatId
  label: string
  width: number
  height: number
}

export interface Palette {
  bg: string
  fg: string
  accent: string
  accent2: string
}
