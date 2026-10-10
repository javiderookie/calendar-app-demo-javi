/** Darken (f < 1) or lighten (f > 1) a #rrggbb colour. */
export function shade(hex: string, f: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const ch = (v: number) => {
    const out = f <= 1 ? v * f : v + (255 - v) * (f - 1)
    return Math.max(0, Math.min(255, Math.round(out)))
  }
  const r = ch((n >> 16) & 255)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Dark or white text, whichever reads better on `bg`. */
export function textOn(bg: string, dark = '#1d2a4d') {
  const n = parseInt(bg.replace('#', ''), 16)
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.6 ? dark : '#ffffff'
}
