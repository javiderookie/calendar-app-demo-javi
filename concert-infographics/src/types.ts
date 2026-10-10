export type Kind = 'single' | 'cycle'

export interface Concert {
  id: string
  artist: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  venue: string
  price: string
  note: string
}

export interface Infographic {
  kind: Kind
  title: string
  subtitle: string
  venue: string
  ticketsUrl: string
  footer: string
  formatId: FormatId
  templateId: string
  palette: { bg: string; fg: string; accent: string }
  concerts: Concert[]
}

export type FormatId = 'square' | 'portrait' | 'story' | 'blog' | 'a4'

export interface Format {
  id: FormatId
  label: string
  width: number
  height: number
}
