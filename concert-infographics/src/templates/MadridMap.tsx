import { createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import type { TemplateProps } from '.'
import type { Concert } from '../types'
import { sortByDate, spanDays } from '../lib/dates'
import { fmtWhen } from '../lib/infoTypes'
import { locateVenue } from '../lib/venues'

// Real-geography Madrid map: one pin per venue at its actual location, callout cards
// in side columns with leader lines, plus stats and a tickets box.

const FONT = { serif: '"Merriweather", serif', label: '"Oswald", sans-serif' }
const VENUE_COLORS = ['#e8524a', '#3d6bb3', '#e0892b', '#3f8f5a', '#9b6bd1', '#2e8f88', '#c4513a', '#7a5236', '#d94f8c']

type LatLon = [number, number]

// Stylised but geographically placed features (lat, lon).
const RIVER: LatLon[] = [
  [40.49, -3.745], [40.47, -3.735], [40.452, -3.7295], [40.438, -3.7285], [40.428, -3.7265], [40.418, -3.7235], [40.412, -3.7205],
  [40.406, -3.716], [40.4, -3.71], [40.395, -3.703], [40.388, -3.694], [40.378, -3.688], [40.36, -3.68],
]
const PARKS: LatLon[][] = [
  // Casa de Campo
  [[40.47, -3.8], [40.47, -3.738], [40.452, -3.734], [40.438, -3.7315], [40.428, -3.7295], [40.418, -3.7265], [40.408, -3.733], [40.395, -3.75], [40.39, -3.8]],
  // Parque del Oeste
  [[40.4335, -3.7245], [40.4335, -3.7185], [40.4255, -3.7172], [40.4238, -3.7232]],
  // Campo del Moro
  [[40.4205, -3.722], [40.4198, -3.7165], [40.4162, -3.7165], [40.4168, -3.722]],
  // Retiro
  [[40.4205, -3.6885], [40.4198, -3.6795], [40.4112, -3.6772], [40.408, -3.6828], [40.411, -3.6888]],
  // Madrid Río
  [[40.418, -3.7228], [40.412, -3.7195], [40.4055, -3.7148], [40.3995, -3.7088], [40.3985, -3.7105], [40.4045, -3.7168], [40.4115, -3.7215], [40.4175, -3.7245]],
]
const AVENUES: { pts: LatLon[]; major?: boolean }[] = [
  { pts: [[40.4238, -3.712], [40.4215, -3.7065], [40.42, -3.701], [40.4189, -3.6967]], major: true }, // Gran Vía
  { pts: [[40.417, -3.703], [40.4189, -3.6967], [40.4192, -3.693], [40.42, -3.6887], [40.4235, -3.676]], major: true }, // Alcalá
  { pts: [[40.4065, -3.6905], [40.414, -3.6928], [40.4192, -3.693], [40.425, -3.6915], [40.433, -3.69], [40.452, -3.6905], [40.49, -3.689]], major: true }, // Prado-Castellana
  { pts: [[40.4238, -3.712], [40.429, -3.715], [40.4345, -3.719], [40.442, -3.7205], [40.452, -3.728], [40.47, -3.733]], major: true }, // Princesa-A6
  { pts: [[40.42, -3.7015], [40.429, -3.702], [40.433, -3.7035], [40.452, -3.704], [40.49, -3.7035]] }, // Fuencarral-Bravo Murillo
  { pts: [[40.429, -3.715], [40.43, -3.708], [40.429, -3.702], [40.427, -3.695], [40.425, -3.6915]] }, // Alberto Aguilera-Sagasta-Génova
  { pts: [[40.417, -3.703], [40.4155, -3.711], [40.415, -3.7145]] }, // Mayor
  { pts: [[40.4238, -3.712], [40.418, -3.714], [40.4105, -3.715]] }, // Bailén
  { pts: [[40.4155, -3.708], [40.411, -3.7095], [40.407, -3.7115]] }, // Toledo
  { pts: [[40.407, -3.7115], [40.4052, -3.703], [40.4065, -3.6905]] }, // Rondas
  { pts: [[40.4345, -3.719], [40.439, -3.71], [40.439, -3.695], [40.4392, -3.689]] }, // Cea Bermúdez-José Abascal
  { pts: [[40.417, -3.703], [40.4125, -3.7005], [40.4065, -3.6985]] }, // Atocha
  { pts: [[40.4065, -3.6905], [40.395, -3.6925], [40.37, -3.695]] }, // Delicias
  { pts: [[40.4052, -3.703], [40.392, -3.7005], [40.37, -3.701]] }, // Santa María de la Cabeza
  { pts: [[40.407, -3.7115], [40.395, -3.717], [40.38, -3.724]] }, // Toledo sur
  { pts: [[40.42, -3.688], [40.432, -3.687], [40.45, -3.686], [40.47, -3.685]] }, // Serrano
  { pts: [[40.4235, -3.676], [40.43, -3.66]] }, // Alcalá este
  { pts: [[40.4392, -3.689], [40.44, -3.675], [40.44, -3.66]] }, // Juan Bravo
  { pts: [[40.452, -3.728], [40.455, -3.705], [40.457, -3.69], [40.458, -3.67]] }, // Reina Victoria-Raimundo
]
const PLACES: { name: string; at: LatLon; park?: boolean; water?: boolean }[] = [
  { name: 'Sol', at: [40.4166, -3.7038] },
  { name: 'Gran Vía', at: [40.4207, -3.7052] },
  { name: 'Malasaña', at: [40.4268, -3.7038] },
  { name: 'Chueca', at: [40.4228, -3.6985] },
  { name: 'La Latina', at: [40.4108, -3.7118] },
  { name: 'Lavapiés', at: [40.4085, -3.7012] },
  { name: 'Chamberí', at: [40.4352, -3.7028] },
  { name: 'Moncloa', at: [40.4362, -3.7175] },
  { name: 'Salamanca', at: [40.4295, -3.6805] },
  { name: 'Atocha', at: [40.4058, -3.6925] },
  { name: 'Palacio Real', at: [40.4182, -3.7142] },
  { name: 'Retiro', at: [40.4152, -3.6835], park: true },
  { name: 'Casa de Campo', at: [40.43, -3.745], park: true },
  { name: 'Tetuán', at: [40.4605, -3.6985] },
  { name: 'Arganzuela', at: [40.3965, -3.6985] },
  { name: 'Usera', at: [40.383, -3.707] },
  { name: 'Río Manzanares', at: [40.4035, -3.7175], water: true },
]

const LAT0 = 40.4235
const KX = Math.cos((LAT0 * Math.PI) / 180) * 111.32 // km per degree of longitude
const KY = 110.95 // km per degree of latitude

interface Stop {
  venue: string
  at: LatLon | undefined
  concerts: Concert[]
  color: string
  n: number
}

function useSize(el: () => HTMLElement | undefined) {
  const [size, setSize] = createSignal({ w: 0, h: 0 })
  onMount(() => {
    const target = el()
    if (!target) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(target)
    onCleanup(() => ro.disconnect())
  })
  return size
}

export default function MadridMap(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  const s = () =>
    landscape()
      ? Math.min(props.format.width / 1920, props.format.height / 1000)
      : Math.min(props.format.width / 1080, props.format.height / 1350)
  const px = (n: number) => `${n * s()}px`

  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const venueOf = (c: Concert) => c.venue || props.doc.venue.split('·')[0]?.trim() || 'Sin sala'

  // Group by venue, numbered in order of each venue's first date.
  const stops = (): Stop[] => {
    const map = new Map<string, Concert[]>()
    for (const c of concerts()) {
      const v = venueOf(c)
      map.set(v, [...(map.get(v) ?? []), c])
    }
    return [...map.entries()].map(([venue, list], i) => ({
      venue,
      concerts: list,
      at: list.map((c) => locateVenue(venue, c.coords)).find(Boolean),
      color: VENUE_COLORS[i % VENUE_COLORS.length],
      n: i + 1,
    }))
  }
  const located = () => stops().filter((st) => st.at)
  const missing = () => stops().filter((st) => !st.at)

  let mapEl!: HTMLDivElement
  const size = useSize(() => mapEl)

  // Projection: fit the located venues into the centre of the map, leaving side columns for labels.
  const view = () => {
    const { w, h } = size()
    const col = w * (landscape() ? 0.25 : 0.29)
    const pts = located().map((st) => st.at!)
    const centre: LatLon = pts.length
      ? [(Math.min(...pts.map((q) => q[0])) + Math.max(...pts.map((q) => q[0]))) / 2, (Math.min(...pts.map((q) => q[1])) + Math.max(...pts.map((q) => q[1]))) / 2]
      : [40.4185, -3.705]
    const spanX = Math.max(1.2, pts.length ? (Math.max(...pts.map((q) => q[1])) - Math.min(...pts.map((q) => q[1]))) * KX : 0) + 0.9
    const spanY = Math.max(1.2, pts.length ? (Math.max(...pts.map((q) => q[0])) - Math.min(...pts.map((q) => q[0]))) * KY : 0) + 0.9
    const k = Math.min((w - 2 * col) / spanX, (h * 0.9) / spanY) // px per km
    return { w, h, col, k, centre }
  }
  const project = (q: LatLon): [number, number] => {
    const v = view()
    return [v.w / 2 + (q[1] - v.centre[1]) * KX * v.k, v.h / 2 - (q[0] - v.centre[0]) * KY * v.k]
  }
  const path = (pts: LatLon[], close = false) =>
    pts.map((q, i) => `${i ? 'L' : 'M'}${project(q)[0].toFixed(1)} ${project(q)[1].toFixed(1)}`).join(' ') + (close ? ' Z' : '')

  // Callout layout: west venues on the left column, east on the right, spread to avoid
  // overlaps. Cards shrink (ls) when a column would not fit the map height.
  const layout = () => {
    const v = view()
    const pad = 8 * s()
    const gap = 12 * s()
    const cardH = (st: Stop, ls: number) => (50 + st.concerts.length * 24) * s() * ls
    const items = located().map((st) => {
      const [x, y] = project(st.at!)
      return { st, x, y }
    })
    const byX = [...items].sort((a, b) => a.x - b.x)
    const half = Math.ceil(byX.length / 2)
    const columns = { left: byX.slice(0, half), right: byX.slice(half) }
    const need = (list: typeof items) => list.reduce((sum, it) => sum + cardH(it.st, 1) + gap, pad * 2 - gap)
    const ls = Math.min(1, v.h / Math.max(need(columns.left), need(columns.right), 1))
    const spread = (list: typeof items, side: 'left' | 'right') => {
      const sorted = [...list].sort((a, b) => a.y - b.y)
      const hs = sorted.map((it) => cardH(it.st, ls))
      const tops: number[] = []
      let cursor = pad
      sorted.forEach((it, i) => {
        tops[i] = Math.max(cursor, it.y - hs[i] / 2)
        cursor = tops[i] + hs[i] + gap
      })
      let limit = v.h - pad
      for (let i = sorted.length - 1; i >= 0; i--) {
        tops[i] = Math.min(tops[i], limit - hs[i])
        limit = tops[i] - gap
      }
      return sorted.map((it, i) => ({ ...it, side, top: Math.max(pad, tops[i]) }))
    }
    return { ls, items: [...spread(columns.left, 'left'), ...spread(columns.right, 'right')] }
  }
  const callouts = () => layout().items
  const ls = () => layout().ls

  const days = () => spanDays(concerts().map((c) => c.date))
  const stats = () =>
    [
      [String(concerts().length), concerts().length === 1 ? 'concierto' : 'conciertos'],
      [String(stops().length), stops().length === 1 ? 'sala' : 'salas'],
      days() > 1 ? [String(days()), 'días'] : undefined,
    ].filter(Boolean) as [string, string][]

  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)

  const Header = () => (
    <header class="text-center">
      <h1 style={{ 'font-family': FONT.serif, 'font-weight': 900, 'font-size': px(headline().length > 14 ? 88 : 116), color: p().fg, 'line-height': 1.05 }}>
        {headline()}
      </h1>
      <Show when={props.doc.subtitle}>
        <p style={{ 'font-family': FONT.serif, 'font-size': px(40), color: p().accent, 'margin-top': px(4) }}>
          <span style={{ color: p().fg, 'font-size': px(28) }}>✦ </span>
          {props.doc.subtitle}
          <span style={{ color: p().fg, 'font-size': px(28) }}> ✦</span>
        </p>
      </Show>
      <Show when={props.doc.banner}>
        <p
          class="inline-block uppercase"
          style={{
            'font-family': FONT.label,
            'font-weight': 600,
            'font-size': px(24),
            'letter-spacing': '0.12em',
            background: p().fg,
            color: p().bg,
            'border-radius': '999px',
            padding: `${px(4)} ${px(22)}`,
            'margin-top': px(12),
          }}
        >
          {props.doc.banner}
        </p>
      </Show>
    </header>
  )

  const MapSvg = () => {
    const v = () => view()
    const strokeKm = (km: number) => Math.max(1, km * v().k)
    return (
      <svg class="absolute inset-0 h-full w-full" viewBox={`0 0 ${v().w} ${v().h}`}>
        <defs>
          <pattern id="mad-blocks" width={v().k * 0.18} height={v().k * 0.18} patternUnits="userSpaceOnUse">
            <rect x={v().k * 0.02} y={v().k * 0.02} width={v().k * 0.13} height={v().k * 0.13} rx={v().k * 0.02} fill={p().fg} fill-opacity="0.06" />
          </pattern>
        </defs>
        <rect width={v().w} height={v().h} fill="url(#mad-blocks)" />
        <For each={PARKS}>{(park) => <path d={path(park, true)} fill="#b9d39a" fill-opacity="0.9" />}</For>
        <path d={path(RIVER)} fill="none" stroke="#9cc3db" stroke-width={strokeKm(0.11)} stroke-linecap="round" stroke-linejoin="round" />
        <For each={AVENUES}>
          {(a) => (
            <path
              d={path(a.pts)}
              fill="none"
              stroke="#ffffff"
              stroke-opacity="0.95"
              stroke-width={strokeKm(a.major ? 0.07 : 0.045)}
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          )}
        </For>
        <For each={PLACES}>
          {(pl) => (
            <text
              x={project(pl.at)[0]}
              y={project(pl.at)[1]}
              text-anchor="middle"
              font-family={FONT.label}
              font-size={String(17 * s())}
              font-style={pl.water ? 'italic' : 'normal'}
              letter-spacing="0.08em"
              fill={pl.park ? '#4f7a3a' : pl.water ? '#4a86a8' : p().fg}
              fill-opacity={pl.park || pl.water ? 0.9 : 0.55}
            >
              {pl.name.toUpperCase()}
            </text>
          )}
        </For>
        {/* leader lines */}
        <For each={callouts()}>
          {(c) => {
            const edge = () => (c.side === 'left' ? v().col - 6 * s() : v().w - v().col + 6 * s())
            const ly = () => c.top + 22 * s() * ls()
            return (
              <polyline
                points={`${c.x},${c.y} ${edge() + (c.side === 'left' ? 24 : -24) * s()},${ly()} ${edge()},${ly()}`}
                fill="none"
                stroke={c.st.color}
                stroke-width={2 * s()}
              />
            )
          }}
        </For>
        {/* pins */}
        <For each={located()}>
          {(st) => {
            const at = () => project(st.at!)
            const r = () => 22 * s()
            return (
              <g transform={`translate(${at()[0]} ${at()[1]})`}>
                <path
                  d={`M0 0 C ${-r() * 0.4} ${-r() * 0.9} ${-r()} ${-r() * 1.2} ${-r()} ${-r() * 1.9} A ${r()} ${r()} 0 1 1 ${r()} ${-r() * 1.9} C ${r()} ${-r() * 1.2} ${r() * 0.4} ${-r() * 0.9} 0 0 Z`}
                  fill={st.color}
                  stroke="#ffffff"
                  stroke-width={2.5 * s()}
                />
                <text y={-r() * 1.62} text-anchor="middle" font-family={FONT.serif} font-weight="900" font-size={String(r() * 1.05)} fill="#ffffff">
                  {st.n}
                </text>
              </g>
            )
          }}
        </For>
      </svg>
    )
  }

  const Callouts = () => (
    <For each={callouts()}>
      {(c) => (
        <div
          class="absolute"
          style={{
            top: `${c.top}px`,
            left: c.side === 'left' ? '0px' : 'auto',
            right: c.side === 'right' ? '0px' : 'auto',
            width: `${view().col - 6 * s()}px`,
            background: '#fffaf0',
            border: `${px(2)} solid ${c.st.color}`,
            'border-radius': px(10),
            padding: `${px(5 * ls())} ${px(10)} ${px(6 * ls())}`,
            'box-shadow': `0 ${px(2)} ${px(6)} rgba(0,0,0,0.12)`,
          }}
        >
          <p class="flex items-center truncate uppercase" style={{ gap: px(8), 'font-family': FONT.label, 'font-weight': 700, 'font-size': px(22 * ls()), color: p().fg, 'line-height': `${36 * s() * ls()}px` }}>
            <span
              class="inline-flex shrink-0 items-center justify-center rounded-full"
              style={{ width: px(26 * ls()), height: px(26 * ls()), background: c.st.color, color: '#fff', 'font-family': FONT.serif, 'font-size': px(15 * ls()) }}
            >
              {c.st.n}
            </span>
            <span class="truncate">{c.st.venue}</span>
          </p>
          <For each={c.st.concerts}>
            {(cc) => (
              <p class="truncate" style={{ 'font-family': FONT.label, 'font-size': px(18 * ls()), color: '#333', 'line-height': `${24 * s() * ls()}px` }}>
                <span style={{ color: c.st.color, 'font-weight': 700 }}>{fmtWhen(props.doc, cc)}</span> {cc.artist}
                <Show when={cc.time}> · {cc.time}</Show>
              </p>
            )}
          </For>
        </div>
      )}
    </For>
  )

  const Bottom = () => (
    <div class="flex items-stretch" style={{ gap: px(20) }}>
      <div class="flex shrink-0" style={{ gap: px(12) }}>
        <For each={stats()}>
          {([value, label], i) => (
            <div
              class="flex flex-col items-center justify-center"
              style={{
                width: px(118),
                background: [p().fg, p().accent, p().accent2][i() % 3],
                color: '#fff',
                'border-radius': px(16),
                padding: `${px(10)} 0`,
              }}
            >
              <span style={{ 'font-family': FONT.serif, 'font-weight': 900, 'font-size': px(44), 'line-height': 1 }}>{value}</span>
              <span class="uppercase" style={{ 'font-family': FONT.label, 'font-size': px(16), 'letter-spacing': '0.08em' }}>
                {label}
              </span>
            </div>
          )}
        </For>
      </div>
      <div
        class="flex min-w-0 flex-1 flex-col justify-center"
        style={{ background: '#fffaf0', border: `${px(1.5)} solid ${p().fg}22`, 'border-radius': px(16), padding: `${px(12)} ${px(20)}` }}
      >
        <Show when={props.doc.ticketsUrl}>
          <p style={{ 'font-family': FONT.serif, 'font-size': px(26), color: p().fg }}>
            Entradas en <span style={{ color: p().accent }}>{props.doc.ticketsUrl}</span>
          </p>
        </Show>
        <Show when={props.doc.intro}>
          <p style={{ 'font-family': FONT.serif, 'font-weight': 900, 'font-size': px(24), color: p().accent }}>{props.doc.intro}</p>
        </Show>
        <p class="truncate" style={{ 'font-family': FONT.label, 'font-size': px(18), color: '#555' }}>
          {[props.doc.footer, props.doc.credit].filter(Boolean).join('  ·  ')}
        </p>
        <Show when={missing().length}>
          <p class="truncate" style={{ 'font-family': FONT.label, 'font-size': px(15), color: '#a33' }}>
            Sin ubicar: {missing().map((m) => m.venue).join(', ')} (añade coordenadas)
          </p>
        </Show>
      </div>
    </div>
  )

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden" style={{ 'background-color': p().bg, padding: px(44), gap: px(20) }}>
      <Header />
      <div ref={mapEl} class="relative min-h-0 flex-1">
        <Show when={size().w > 0}>
          <div class="absolute inset-0 overflow-hidden" style={{ 'border-radius': px(18), border: `${px(2)} solid ${p().fg}22` }}>
            <MapSvg />
          </div>
          <Callouts />
        </Show>
      </div>
      <Bottom />
    </div>
  )
}
