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
