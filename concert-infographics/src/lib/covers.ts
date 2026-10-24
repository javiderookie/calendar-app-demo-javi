import { fileToDataUrl } from './image'

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

interface ITunesAlbum {
  collectionName: string
  artistName: string
  artworkUrl100?: string
}

/**
 * Looks up album covers on the iTunes Search API from the viewer's browser and
 * returns resized data URLs keyed by entry id. Titles that are not found are
 * simply missing from the result, so they can be uploaded by hand.
 */
export async function findCovers(artist: string, entries: { id: string; title: string }[]) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&limit=200&country=es`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`iTunes respondió ${res.status}`)
  const albums = ((await res.json()).results ?? []) as ITunesAlbum[]
  const byArtist = albums.filter((a) => norm(a.artistName).includes(norm(artist)) || norm(artist).includes(norm(a.artistName)))

  const found: Record<string, string> = {}
  for (const e of entries) {
    const t = norm(e.title)
    if (!t) continue
    // Exact title first, then "LP2 (Remastered)" style partial matches.
    const hit =
      byArtist.find((a) => norm(a.collectionName) === t) ??
      byArtist.find((a) => norm(a.collectionName).startsWith(t) || t.startsWith(norm(a.collectionName)))
    if (!hit?.artworkUrl100) continue
    try {
      const img = await fetch(hit.artworkUrl100.replace('100x100bb', '600x600bb'))
      if (img.ok) found[e.id] = await fileToDataUrl(await img.blob(), 480)
    } catch {
      // Artwork host refused (e.g. CORS); leave it for manual upload.
    }
  }
  return found
}
