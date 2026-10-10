import type { Format } from '../types'

export const FORMATS: Format[] = [
  { id: 'square', label: 'Post 1:1 (1080×1080)', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Post 4:5 (1080×1350)', width: 1080, height: 1350 },
  { id: 'story', label: 'Story 9:16 (1080×1920)', width: 1080, height: 1920 },
  { id: 'blog', label: 'Cabecera blog (1200×630)', width: 1200, height: 630 },
  { id: 'a4', label: 'Cartel A4 (1240×1754)', width: 1240, height: 1754 },
]

export const formatById = (id: string) => FORMATS.find((f) => f.id === id) ?? FORMATS[0]
