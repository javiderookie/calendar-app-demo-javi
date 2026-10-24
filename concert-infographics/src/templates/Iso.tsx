import { For, Index, Show } from 'solid-js'
import { uid } from '../lib/uid'
import type { JSX } from 'solid-js'
import type { TemplateProps } from '.'
import type { Concert, Palette } from '../types'
import { dateParts, sortByDate } from '../lib/dates'
import { createAutoFit } from '../lib/autofit'
import { shade } from '../lib/color'

// Isometric poster: the line-up is a zigzag path of platforms, each carrying a small
// stage-themed object with a leader-line callout, plus a sidebar of data modules and
// extruded 3D title letters. Inspired by isometric city/culture infographics.

const FONT = '"Oswald", sans-serif'
const CREAM = '#f3eee4'
const DARK = '#2b2d42'
const TEAL = '#5cc8b2'
const GREEN = '#5dbb8a'
const COS = Math.cos(Math.PI / 6)

type Pt = [number, number]
type Iso = (x: number, y: number, z: number) => Pt

const isoAt = (ox: number, oy: number, u: number): Iso => (x, y, z) => [
  ox + (x - y) * COS * u,
  oy + (x + y) * 0.5 * u - z * u,
]

const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/** Axis-aligned box with its three visible faces shaded. */
function Box(props: { iso: Iso; at: [number, number, number]; size: [number, number, number]; color: string }) {
  const f = () => {
    const [x, y, z] = props.at
    const [dx, dy, dz] = props.size
    const P = props.iso
    return {
      top: poly([P(x, y, z + dz), P(x + dx, y, z + dz), P(x + dx, y + dy, z + dz), P(x, y + dy, z + dz)]),
      left: poly([P(x, y + dy, z + dz), P(x + dx, y + dy, z + dz), P(x + dx, y + dy, z), P(x, y + dy, z)]),
      right: poly([P(x + dx, y, z + dz), P(x + dx, y + dy, z + dz), P(x + dx, y + dy, z), P(x + dx, y, z)]),
    }
  }
  return (
    <g stroke={shade(props.color, 0.55)} stroke-width="0.6" stroke-linejoin="round">
      <polygon points={f().top} fill={props.color} />
      <polygon points={f().left} fill={shade(props.color, 0.82)} />
      <polygon points={f().right} fill={shade(props.color, 0.66)} />
    </g>
  )
}

/** Circle sampled on one of the iso planes. */
function ring(P: Iso, c: [number, number, number], r: number, plane: 'xy' | 'xz' | 'yz') {
  const pts: Pt[] = []
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    const [cx, cy, cz] = c
    const u = Math.cos(a) * r
    const v = Math.sin(a) * r
    pts.push(plane === 'xy' ? P(cx + u, cy + v, cz) : plane === 'xz' ? P(cx + u, cy, cz + v) : P(cx, cy + u, cz + v))
  }
  return poly(pts)
}

function Tree(props: { iso: Iso; x: number; y: number; z: number; u: number }) {
  const base = () => props.iso(props.x, props.y, props.z)
  const top = () => props.iso(props.x, props.y, props.z + 0.9)
  return (
    <g>
      <line x1={base()[0]} y1={base()[1]} x2={top()[0]} y2={top()[1]} stroke="#8a5a3b" stroke-width={props.u * 0.12} />
      <circle cx={top()[0]} cy={top()[1]} r={props.u * 0.42} fill={GREEN} />
      <circle cx={top()[0] + props.u * 0.12} cy={top()[1] + props.u * 0.1} r={props.u * 0.24} fill={shade(GREEN, 0.8)} />
    </g>
  )
}

// One object per stop, cycling through four themes.
function StopObject(props: { kind: number; iso: Iso; u: number; p: Palette }): JSX.Element {
  const P = () => props.iso
  const z = 0.6
  switch (props.kind % 4) {
    case 0: // stage with backdrop and speakers
      return (
        <g>
          <Tree iso={P()} x={3.5} y={0.5} z={z} u={props.u} />
          <Box iso={P()} at={[0.6, 0.6, z]} size={[2.8, 0.3, 1.8]} color={props.p.accent} />
          <Box iso={P()} at={[0.6, 0.9, z]} size={[2.8, 2.2, 0.3]} color={DARK} />
          <Box iso={P()} at={[0.7, 2.4, z + 0.3]} size={[0.5, 0.5, 0.9]} color={shade(DARK, 1.4)} />
          <Box iso={P()} at={[2.8, 2.4, z + 0.3]} size={[0.5, 0.5, 0.9]} color={shade(DARK, 1.4)} />
          <Box iso={P()} at={[1.8, 1.6, z + 0.3]} size={[0.12, 0.12, 0.8]} color={CREAM} />
        </g>
      )
    case 1: {
      // concert hall with windows
      const windows: string[] = []
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          const x = 1.05 + c * 0.65
          const zz = z + 0.35 + r * 0.55
          windows.push(poly([P()(x, 2.8, zz + 0.3), P()(x + 0.4, 2.8, zz + 0.3), P()(x + 0.4, 2.8, zz), P()(x, 2.8, zz)]))
        }
        for (let c = 0; c < 3; c++) {
          const y = 1.0 + c * 0.6
          const zz = z + 0.35 + r * 0.55
          windows.push(poly([P()(3.0, y, zz + 0.3), P()(3.0, y + 0.35, zz + 0.3), P()(3.0, y + 0.35, zz), P()(3.0, y, zz)]))
        }
      }
      return (
        <g>
          <Box iso={P()} at={[0.8, 0.8, z]} size={[2.2, 2.0, 2.6]} color={CREAM} />
          <Box iso={P()} at={[1.3, 1.2, z + 2.6]} size={[1.2, 1.0, 0.35]} color={props.p.accent} />
          <For each={windows}>{(w) => <polygon points={w} fill={TEAL} />}</For>
          <Tree iso={P()} x={0.5} y={3.4} z={z} u={props.u} />
        </g>
      )
    }
    case 2: // giant vinyl lying on the platform
      return (
        <g>
          <polygon points={ring(P(), [2, 2, z], 1.65, 'xy')} fill={shade(DARK, 0.7)} />
          <polygon points={ring(P(), [2, 2, z + 0.18], 1.65, 'xy')} fill={DARK} />
          <polygon points={ring(P(), [2, 2, z + 0.18], 1.25, 'xy')} fill="none" stroke={shade(DARK, 1.6)} stroke-width="0.6" />
          <polygon points={ring(P(), [2, 2, z + 0.18], 0.95, 'xy')} fill="none" stroke={shade(DARK, 1.6)} stroke-width="0.6" />
          <polygon points={ring(P(), [2, 2, z + 0.18], 0.55, 'xy')} fill={props.p.accent} />
          <polygon points={ring(P(), [2, 2, z + 0.18], 0.08, 'xy')} fill={CREAM} />
          <Box iso={P()} at={[3.3, 0.5, z]} size={[0.25, 0.25, 1.2]} color={CREAM} />
          <line
            x1={P()(3.42, 0.62, z + 1.2)[0]}
            y1={P()(3.42, 0.62, z + 1.2)[1]}
            x2={P()(2.4, 1.6, z + 0.3)[0]}
            y2={P()(2.4, 1.6, z + 0.3)[1]}
            stroke={CREAM}
            stroke-width={props.u * 0.1}
            stroke-linecap="round"
          />
        </g>
      )
    default: // speaker stack and amp
      return (
        <g>
          <Tree iso={P()} x={3.5} y={0.5} z={z} u={props.u} />
          <Box iso={P()} at={[0.7, 0.9, z]} size={[1.3, 1.3, 1.3]} color={DARK} />
          <Box iso={P()} at={[0.7, 0.9, z + 1.3]} size={[1.3, 1.3, 1.0]} color={DARK} />
          <polygon points={ring(P(), [1.35, 2.2, z + 0.65], 0.45, 'xz')} fill={shade(DARK, 1.8)} />
          <polygon points={ring(P(), [1.35, 2.2, z + 0.65], 0.18, 'xz')} fill={props.p.accent} />
          <polygon points={ring(P(), [1.35, 2.2, z + 1.8], 0.32, 'xz')} fill={shade(DARK, 1.8)} />
          <Box iso={P()} at={[2.4, 2.1, z]} size={[1.1, 0.9, 0.6]} color={props.p.accent} />
        </g>
      )
  }
}

function Scene(props: { concerts: Concert[]; p: Palette; venue: string; w: number; h: number; single: boolean }) {
  const n = () => Math.max(props.concerts.length, 1)
  const rowH = () => props.h / n()
  const u = () =>
    props.single ? Math.min((props.w * 0.7) / 6.93, props.h / 8) : Math.min((rowH() * 0.92) / 7.2, (props.w * 0.48) / 6.93)
  const stops = () =>
    props.concerts.map((c, i) => {
      const left = props.single ? true : i % 2 === 0
      const cx = props.single ? props.w * 0.5 : props.w * (left ? 0.27 : 0.73)
      const cy = props.single ? props.h * 0.38 : (i + 0.5) * rowH() + u() * 1.0
      return { c, i, left, cx, cy, iso: isoAt(cx, cy - 1.4 * u(), u()) }
    })
  const platform = () => props.p.accent2

  return (
    <svg viewBox={`0 0 ${props.w} ${props.h}`} class="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* connecting road, drawn first so platforms sit on top */}
      <Index each={stops().slice(1)}>
        {(s, k) => {
          const a = () => stops()[k]
          return (
            <g stroke-linecap="butt">
              <line x1={a().cx} y1={a().cy + u() * 0.4} x2={s().cx} y2={s().cy + u() * 0.4} stroke={shade(platform(), 0.6)} stroke-width={u() * 1.1} />
              <line x1={a().cx} y1={a().cy} x2={s().cx} y2={s().cy} stroke={shade(platform(), 0.9)} stroke-width={u() * 1.1} />
              <line
                x1={a().cx}
                y1={a().cy}
                x2={s().cx}
                y2={s().cy}
                stroke={CREAM}
                stroke-width={u() * 0.08}
                stroke-dasharray={`${u() * 0.4} ${u() * 0.3}`}
              />
            </g>
          )
        }}
      </Index>
      <For each={stops()}>
        {(s) => {
          const d = () => dateParts(s.c.date)
          const textX = () => (props.single ? props.w * 0.5 : props.w * (s.left ? 0.56 : 0.44))
          const anchor = () => (props.single ? 'middle' : s.left ? 'start' : 'end')
          const corner = () => (s.left ? s.iso(4, 0, 0.6) : s.iso(0, 4, 0.6))
          const avail = () => (props.single ? props.w * 0.9 : props.w * 0.44)
          const artistSize = () => Math.min(u() * (props.single ? 1.1 : 1.25), props.w * 0.075)
          const fitText = (text: string, size: number) => (text.length * size * 0.48 > avail() ? avail() : undefined)
          const ty = () => (props.single ? s.cy + u() * 3.4 : s.cy - u() * 1.1)
          const meta = () => [s.c.venue || props.venue, s.c.price].filter(Boolean).join('  ·  ')
          const head = () =>
            [!props.single && String(s.i + 1).padStart(2, '0'), `${d().weekday} ${d().day} ${d().month}`.toUpperCase(), s.c.time && `${s.c.time} h`]
              .filter(Boolean)
              .join('  ')
          return (
            <g>
              <Box iso={s.iso} at={[0, 0, 0]} size={[4, 4, 0.6]} color={platform()} />
              <StopObject kind={s.i} iso={s.iso} u={u()} p={props.p} />
              <Show when={!props.single}>
                <polyline
                  points={poly([
                    corner(),
                    [corner()[0] + (s.left ? u() * 0.5 : -u() * 0.5), ty() + u() * 0.15],
                    [textX() + (s.left ? -u() * 0.25 : u() * 0.25), ty() + u() * 0.15],
                  ])}
                  fill="none"
                  stroke={props.p.fg}
                  stroke-width={Math.max(1, u() * 0.04)}
                />
                <circle cx={corner()[0]} cy={corner()[1]} r={u() * 0.09} fill={props.p.fg} />
              </Show>
              <g font-family={FONT} text-anchor={anchor()} paint-order="stroke" stroke={props.p.bg} stroke-width={u() * 0.18} stroke-linejoin="round">
                <text x={textX()} y={ty()} font-size={String(u() * 0.55)} font-weight="700" fill={props.p.accent2} letter-spacing="0.06em">
                  {head()}
                </text>
                <text
                  x={textX()}
                  y={ty() + artistSize() * 1.05}
                  font-size={String(artistSize())}
                  font-weight="700"
                  fill={props.p.fg}
                  textLength={fitText(s.c.artist || 'Artista', artistSize())}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {(s.c.artist || 'Artista').toUpperCase()}
                </text>
                <Show when={meta()}>
                  <text x={textX()} y={ty() + artistSize() * 1.05 + u() * 0.7} font-size={String(u() * 0.52)} fill={props.p.fg} fill-opacity="0.85">
                    {meta()}
                  </text>
                </Show>
                <Show when={s.c.note}>
                  <text x={textX()} y={ty() + artistSize() * 1.05 + u() * 1.35} font-size={String(u() * 0.5)} fill={props.p.accent}>
                    {s.c.note}
                  </text>
                </Show>
              </g>
            </g>
          )
        }}
      </For>
    </svg>
  )
}

/** Seigaiha wave pattern for the background. */
function Waves(props: { color: string; size: number }) {
  const isoWavesId = uid('iso-waves')
  return (
    <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={isoWavesId} width={props.size} height={props.size / 2} patternUnits="userSpaceOnUse">
          <For each={[0.5, 0.36, 0.22]}>
            {(r) => (
              <>
                <circle cx={props.size / 2} cy={props.size / 2} r={props.size * r} fill="none" stroke={props.color} stroke-width="1.2" />
                <circle cx="0" cy="0" r={props.size * r} fill="none" stroke={props.color} stroke-width="1.2" />
                <circle cx={props.size} cy="0" r={props.size * r} fill="none" stroke={props.color} stroke-width="1.2" />
              </>
            )}
          </For>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${isoWavesId})`} opacity="0.08" />
    </svg>
  )
}

const priceValue = (s: string) => {
  const m = s.replace(',', '.').match(/\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : Infinity
}

export default function Iso(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  let frame!: HTMLDivElement
  const fit = createAutoFit(() => frame, () => [JSON.stringify(props.doc), props.format.id])
  const base = () =>
    landscape()
      ? Math.min(props.format.width / 1920, props.format.height / 1000)
      : Math.min(props.format.width / 1080, props.format.height / 1450)
  const s = () => base() * fit()
  const px = (n: number) => `${n * s()}px`

  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)
  const venues = () => [...new Set(concerts().map((c) => c.venue || props.doc.venue).filter(Boolean))]
  const cheapest = () => {
    const prices = concerts().map((c) => c.price).filter(Boolean)
    return prices.sort((a, b) => priceValue(a) - priceValue(b))[0] ?? ''
  }
  const range = () => {
    const dates = concerts().map((c) => c.date).filter(Boolean)
    if (!dates.length) return ''
    const a = dateParts(dates[0])
    const b = dateParts(dates[dates.length - 1])
    return dates.length === 1 ? `${a.day} ${a.month}` : `${a.day} ${a.month} – ${b.day} ${b.month}`
  }

  // Scene viewBox follows the space it gets so the SVG fills it without distortion.
  const sceneSize = () => {
    const w = landscape() ? props.format.width * 0.6 : props.format.width * 0.64
    const h = landscape() ? props.format.height * 0.92 : props.format.height * 0.7
    return { w: 1000, h: Math.round((1000 * h) / w) }
  }

  const ModuleTitle = (t: { title: string; sub: string }) => (
    <h3 class="flex items-baseline uppercase" style={{ gap: px(8), 'font-family': FONT, 'margin-bottom': px(10) }}>
      <span style={{ 'font-weight': 700, 'font-size': px(28), color: p().accent }}>{t.title}</span>
      <span style={{ 'font-size': px(16), color: p().fg, opacity: 0.7 }}>{t.sub}</span>
    </h3>
  )

  const Title = () => (
    <div class="flex flex-wrap items-end" style={{ gap: `${px(10)} ${px(36)}` }}>
      <div>
        <h1
          class="uppercase"
          style={{
            'font-family': FONT,
            'font-weight': 700,
            'font-size': px(headline().length > 12 ? 104 : 150),
            'line-height': 0.95,
            color: p().accent2,
            'text-shadow': Array.from({ length: 10 }, (_, i) => `${px(i + 1)} ${px(i + 1)} 0 ${shade(p().accent2, 0.55)}`).join(', '),
            'letter-spacing': '0.02em',
          }}
        >
          {headline()}
        </h1>
        <Show when={props.doc.subtitle}>
          <p
            class="inline-block uppercase"
            style={{
              'font-family': FONT,
              'font-weight': 600,
              'font-size': px(24),
              'letter-spacing': '0.14em',
              background: p().accent,
              color: CREAM,
              padding: `${px(4)} ${px(14)}`,
              'margin-top': px(18),
            }}
          >
            {props.doc.subtitle}
          </p>
        </Show>
      </div>
      <Show when={props.doc.intro}>
        <p
          class="min-w-0 flex-1"
          style={{ 'font-family': FONT, 'font-size': px(22), color: p().fg, 'line-height': 1.4, 'min-width': px(260), opacity: 0.9 }}
        >
          {props.doc.intro}
        </p>
      </Show>
    </div>
  )

  const Sidebar = () => (
    <aside data-fit class="flex min-h-0 flex-col overflow-hidden" style={{ gap: px(30) }}>
      <section>
        <ModuleTitle title="Ficha" sub="info" />
        <dl
          class="grid"
          style={{
            'grid-template-columns': 'auto 1fr',
            gap: `${px(6)} ${px(16)}`,
            'font-family': FONT,
            'font-size': px(20),
            color: p().fg,
            'border-top': `${px(2)} solid ${p().fg}55`,
            'padding-top': px(10),
          }}
        >
          <For
            each={[
              ['Conciertos', String(concerts().length)],
              ['Fechas', range()],
              ['Salas', String(venues().length || '')],
              ['Desde', cheapest()],
            ].filter(([, v]) => v)}
          >
            {([k, v]) => (
              <>
                <dt style={{ opacity: 0.7 }}>{k}</dt>
                <dd style={{ 'font-weight': 600 }}>{v}</dd>
              </>
            )}
          </For>
        </dl>
      </section>

      <Show when={props.doc.highlight.big}>
        <section>
          <ModuleTitle title="El dato" sub="highlight" />
          <p style={{ 'font-family': FONT, 'font-weight': 700, 'font-size': px(96), color: p().accent2, 'line-height': 0.9 }}>
            {props.doc.highlight.big}
          </p>
          <p style={{ 'font-family': FONT, 'font-size': px(22), color: p().fg }}>{props.doc.highlight.text}</p>
        </section>
      </Show>

      <Show when={venues().length}>
        <section>
          <ModuleTitle title="Salas" sub="venues" />
          <ul class="flex flex-col" style={{ gap: px(6), 'font-family': FONT, 'font-size': px(20), color: p().fg }}>
            <For each={venues()}>
              {(v, i) => (
                <li class="flex items-center" style={{ gap: px(10) }}>
                  <span
                    class="inline-block shrink-0 rounded-full"
                    style={{ width: px(12), height: px(12), background: [p().accent, TEAL, p().accent2][i() % 3] }}
                  />
                  {v}
                </li>
              )}
            </For>
          </ul>
        </section>
      </Show>

      <Show when={isCycle() && !landscape()}>
        <section>
          <ModuleTitle title="Agenda" sub="timeline" />
          <ol
            class="flex flex-col"
            style={{
              gap: px(8),
              'border-left': `${px(2)} solid ${p().fg}66`,
              'padding-left': px(16),
              'margin-left': px(8),
              'font-family': FONT,
              color: p().fg,
            }}
          >
            <For each={concerts()}>
              {(c) => {
                const d = () => dateParts(c.date)
                return (
                  <li class="relative" style={{ 'font-size': px(18) }}>
                    <span
                      class="absolute rounded-full"
                      style={{ left: px(-23), top: px(7), width: px(12), height: px(12), background: p().accent }}
                    />
                    <span style={{ 'font-weight': 700, color: p().accent2 }}>
                      {d().day} {d().month.toUpperCase()}
                    </span>{' '}
                    {c.artist}
                  </li>
                )
              }}
            </For>
          </ol>
        </section>
      </Show>
    </aside>
  )

  const Footer = () => (
    <footer
      class="flex items-center justify-between uppercase"
      style={{
        'font-family': FONT,
        'font-size': px(18),
        color: p().fg,
        'border-top': `${px(2)} solid ${p().fg}44`,
        'padding-top': px(12),
        'letter-spacing': '0.08em',
      }}
    >
      <span>{[props.doc.footer, props.doc.credit].filter(Boolean).join('  |  ')}</span>
      <Show when={props.doc.ticketsUrl}>
        <span style={{ color: p().accent2, 'font-weight': 700 }}>Entradas · {props.doc.ticketsUrl}</span>
      </Show>
    </footer>
  )

  const SceneBox = () => (
    <div class="relative min-h-0 min-w-0">
      <div class="absolute inset-0">
        <Scene
          concerts={concerts()}
          p={p()}
          venue={props.doc.venue}
          w={sceneSize().w}
          h={sceneSize().h}
          single={!isCycle()}
        />
      </div>
    </div>
  )

  return (
    <div ref={frame} class="relative h-full w-full overflow-hidden" style={{ 'background-color': p().bg }}>
      <Waves color={p().fg} size={64 * base()} />
      <div class="relative h-full" style={{ padding: px(56) }}>
        <Show
          when={landscape()}
          fallback={
            <div data-fit class="flex h-full flex-col overflow-hidden" style={{ gap: px(28) }}>
              <Title />
              <div class="grid min-h-0 flex-1" style={{ 'grid-template-columns': '0.36fr 0.64fr', gap: px(28) }}>
                <Sidebar />
                <SceneBox />
              </div>
              <Footer />
            </div>
          }
        >
          <div class="grid h-full" style={{ 'grid-template-columns': '0.4fr 0.6fr', gap: px(40) }}>
            <div data-fit class="flex min-h-0 flex-col overflow-hidden" style={{ gap: px(24) }}>
              <Title />
              <Sidebar />
              <Footer />
            </div>
            <SceneBox />
          </div>
        </Show>
      </div>
    </div>
  )
}
