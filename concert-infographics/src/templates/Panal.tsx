import { For, Show } from 'solid-js'
import { uid } from '../lib/uid'
import type { TemplateProps } from '.'
import type { Concert } from '../types'
import { sortByDate, spanDays } from '../lib/dates'
import { fmtWhen, infoTypeOf, noun } from '../lib/infoTypes'
import { createAutoFit } from '../lib/autofit'
import { shade, textOn } from '../lib/color'

// Spring-festival line-up: blue header band, honeycomb body, one row per show with
// date and venue pills (each venue keeps its colour), bees, clouds and a footer band.

const FONT = {
  round: '"Fredoka", sans-serif',
  heavy: '"Anton", sans-serif',
}
const HONEY = '#f7c936'
const NAVY = '#1d2a4d'
const VENUE_COLORS = ['#e8524a', '#3d6bb3', '#f29a3d', '#5aa9e6', '#58b85c', '#9b6bd1', '#e8743b', '#2e8f88', '#d94f8c']

function Bee(props: { size: number; flip?: boolean; tilt?: number }) {
  const id = uid('bee')
  return (
    <svg
      viewBox="0 0 64 52"
      style={{
        width: `${props.size}px`,
        height: `${props.size * 0.81}px`,
        transform: `scaleX(${props.flip ? -1 : 1}) rotate(${props.tilt ?? 0}deg)`,
      }}
    >
      <defs>
        <clipPath id={id}>
          <ellipse cx="32" cy="32" rx="20" ry="14.5" />
        </clipPath>
      </defs>
      <ellipse cx="26" cy="13" rx="9" ry="12" fill="#ffffff" fill-opacity="0.9" stroke={NAVY} stroke-width="2" />
      <ellipse cx="38" cy="14" rx="8" ry="11" fill="#ffffff" fill-opacity="0.9" stroke={NAVY} stroke-width="2" />
      <polygon points="11,32 4,29 4,35" fill={NAVY} />
      <ellipse cx="32" cy="32" rx="20" ry="14.5" fill={HONEY} />
      <g clip-path={`url(#${id})`} fill={NAVY}>
        <rect x="18" y="14" width="5" height="40" />
        <rect x="28" y="14" width="5" height="40" />
        <rect x="38" y="14" width="5" height="40" />
      </g>
      <ellipse cx="32" cy="32" rx="20" ry="14.5" fill="none" stroke={NAVY} stroke-width="2.5" />
      <circle cx="46" cy="28" r="2.4" fill={NAVY} />
      <path d="M42 36 q4 3 8 0" fill="none" stroke={NAVY} stroke-width="2" stroke-linecap="round" />
      <path d="M46 18 q2 -7 7 -8 M50 20 q4 -5 9 -4" fill="none" stroke={NAVY} stroke-width="2" stroke-linecap="round" />
    </svg>
  )
}

function Daisy(props: { size: number }) {
  return (
    <svg viewBox="0 0 40 40" style={{ width: `${props.size}px`, height: `${props.size}px` }}>
      <For each={[0, 45, 90, 135, 180, 225, 270, 315]}>
        {(a) => <ellipse cx="20" cy="9" rx="5.5" ry="8" fill="#ffffff" stroke="#e6e0cf" transform={`rotate(${a} 20 20)`} />}
      </For>
      <circle cx="20" cy="20" r="6" fill="#f2b632" />
      <circle cx="20" cy="20" r="2.5" fill="#7cae5a" />
    </svg>
  )
}

function Cloud(props: { w: number; style: Record<string, string> }) {
  const bar = (width: number, color: string, offset: number) => (
    <div style={{ width: `${width}px`, height: `${props.w * 0.11}px`, background: color, 'border-radius': '999px', 'margin-left': `${offset}px` }} />
  )
  return (
    <div class="absolute flex flex-col" style={{ gap: `${props.w * 0.03}px`, ...props.style }}>
      {bar(props.w * 0.55, '#ffffff', props.w * 0.2)}
      {bar(props.w, '#cfe6f7', 0)}
      {bar(props.w * 0.45, '#ffffff', props.w * 0.35)}
    </div>
  )
}

function Honeycomb(props: { r: number; color: string }) {
  const panalHexId = uid('panal-hex')
  const w = () => Math.sqrt(3) * props.r
  const hex = (cx: number, cy: number) =>
    [-90, -30, 30, 90, 150, 210]
      .map((a) => {
        const t = (a * Math.PI) / 180
        return `${(cx + props.r * Math.cos(t)).toFixed(1)},${(cy + props.r * Math.sin(t)).toFixed(1)}`
      })
      .join(' ')
  return (
    <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={panalHexId} width={w()} height={props.r * 3} patternUnits="userSpaceOnUse">
          <polygon points={hex(w() / 2, props.r)} fill="none" stroke={props.color} stroke-width="2" />
          <polygon points={hex(0, props.r * 2.5)} fill="none" stroke={props.color} stroke-width="2" />
          <polygon points={hex(w(), props.r * 2.5)} fill="none" stroke={props.color} stroke-width="2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${panalHexId})`} />
    </svg>
  )
}

function StatHex(props: { value: string; label: string; size: number; fg: string; bg: string }) {
  return (
    <div class="relative" style={{ width: `${props.size}px`, height: `${props.size * 1.1547}px` }}>
      <svg viewBox="0 0 100 115.47" class="absolute inset-0 h-full w-full">
        <polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87" fill={props.bg} />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center leading-none" style={{ color: props.fg }}>
        <span style={{ 'font-family': FONT.heavy, 'font-size': `${props.size * 0.42}px` }}>{props.value}</span>
        <span style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': `${props.size * 0.13}px`, 'text-transform': 'uppercase' }}>
          {props.label}
        </span>
      </div>
    </div>
  )
}

export default function Panal(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  let frame!: HTMLDivElement
  const fit = createAutoFit(() => frame, () => [JSON.stringify(props.doc), props.format.id])
  const base = () =>
    landscape()
      ? Math.min(props.format.width / 1920, props.format.height / 1080)
      : Math.min(props.format.width / 1080, props.format.height / 1350)
  const s = () => base() * fit()
  const px = (n: number) => `${n * s()}px`

  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const venueOf = (c: Concert) => c.venue || props.doc.venue.split('·')[0]?.trim() || ''
  const venues = () => [...new Set(concerts().map(venueOf).filter(Boolean))]
  const venueColor = (c: Concert) => VENUE_COLORS[Math.max(0, venues().indexOf(venueOf(c))) % VENUE_COLORS.length]
  const tags = () => props.doc.venue.split('·').map((t) => t.trim()).filter(Boolean)
  const tagColors = () => [p().accent2, '#58b85c']
  const twoCols = () => landscape() && concerts().length > 5
  // Row size shrinks with long line-ups; autofit handles whatever is left.
  // Tall formats (story, A4) get bigger rows to use the extra height.
  const tall = () => (landscape() ? 1 : Math.min(1.45, Math.max(1, props.format.height / props.format.width / 1.25)))
  const k = () => (isCycle() ? Math.max(0.55, Math.min(1, 8 / concerts().length)) : 1.6) * tall()

  const Pill = (pp: { text: string; color: string; size: number }) => (
    <span
      class="inline-block whitespace-nowrap uppercase"
      style={{
        'font-family': FONT.round,
        'font-weight': 700,
        'font-size': px(pp.size),
        background: pp.color,
        color: textOn(pp.color, NAVY),
        border: `${px(2.5)} solid ${NAVY}`,
        'border-radius': '999px',
        padding: `${px(1)} ${px(pp.size * 0.5)}`,
        'line-height': 1.15,
      }}
    >
      {pp.text}
    </span>
  )

  const Header = () => (
    <header
      class="relative flex items-center justify-between"
      style={{ background: p().accent, padding: `${px(28)} ${px(48)} ${px(24)}`, gap: px(24) }}
    >
      <div class="relative min-w-0">
        <div class="absolute" style={{ left: px(-12), top: px(-22) }}>
          <Bee size={80 * s()} tilt={-10} />
        </div>
        <Show when={props.doc.subtitle}>
          <div style={{ 'margin-left': px(150), 'margin-bottom': px(-6) }}>
            <Pill text={props.doc.subtitle} color={HONEY} size={26} />
          </div>
        </Show>
        <h1
          class="lowercase"
          style={{
            'font-family': FONT.round,
            'font-weight': 700,
            'font-size': px(props.doc.title.length > 12 ? 110 : 150),
            color: NAVY,
            'line-height': 0.95,
            'letter-spacing': '-0.02em',
            'white-space': 'nowrap',
          }}
        >
          {isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title}
        </h1>
      </div>
      <Show when={tags().length}>
        <div class="flex shrink-0 flex-col items-end" style={{ gap: px(2) }}>
          <For each={tags()}>
            {(t, i) => (
              <span style={{ 'margin-right': px(i() % 2 ? 40 : 0) }}>
                <Pill text={t} color={tagColors()[i() % 2]} size={30} />
              </span>
            )}
          </For>
        </div>
      </Show>
    </header>
  )

  const Row = (c: Concert) => (
    <li
      class="grid items-center"
      style={{ 'grid-template-columns': 'minmax(0, 1.7fr) auto minmax(0, 1fr)', gap: px(16 * k()) }}
    >
      <span
        class="truncate text-right uppercase"
        style={{ 'font-family': FONT.heavy, 'font-size': px(64 * k()), color: NAVY, 'line-height': 1.12 }}
      >
        {isCycle() ? c.artist || 'Artista' : [c.time && `${c.time} h`, c.price].filter(Boolean).join(' · ') || 'En directo'}
      </span>
      <Pill text={fmtWhen(props.doc, c, concerts().indexOf(c)) || '--.--'} color={venueColor(c)} size={26 * k()} />
      <span class="min-w-0">
        <Show when={venueOf(c)}>
          <Pill text={venueOf(c)} color={venueColor(c)} size={26 * k()} />
        </Show>
      </span>
    </li>
  )

  const Stats = () => (
    <Show when={isCycle() && concerts().length > 1}>
      <div class="flex justify-center" style={{ gap: px(18) }}>
        <StatHex value={String(concerts().length)} label={noun(infoTypeOf(props.doc).item, concerts().length)} size={118 * s()} fg={HONEY} bg={NAVY} />
        <StatHex value={String(venues().length)} label={noun(infoTypeOf(props.doc).group ?? { one: 'sala', many: 'salas' }, venues().length)} size={118 * s()} fg={NAVY} bg="#ffffff" />
        <Show when={spanDays(concerts().map((c) => c.date)) > 1}>
          <StatHex value={String(spanDays(concerts().map((c) => c.date)))} label="días" size={118 * s()} fg="#ffffff" bg={p().accent2} />
        </Show>
      </div>
    </Show>
  )

  const Body = () => (
    <main data-fit class="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden" style={{ padding: `${px(28)} ${px(56)}`, gap: px(22) }}>
      <Show when={props.doc.banner}>
        <p
          class="uppercase"
          style={{
            'font-family': FONT.round,
            'font-weight': 700,
            'font-size': px(42),
            background: NAVY,
            color: HONEY,
            'border-radius': '999px',
            padding: `${px(2)} ${px(34)}`,
          }}
        >
          {props.doc.banner}
        </p>
      </Show>
      <Stats />
      <ul
        class="grid w-full flex-1 content-center"
        style={{
          'grid-template-columns': twoCols() ? '1fr 1fr' : '1fr',
          // Fill the left column first so dates read top-to-bottom.
          'grid-template-rows': twoCols() ? `repeat(${Math.ceil(concerts().length / 2)}, auto)` : 'none',
          'grid-auto-flow': twoCols() ? 'column' : 'row',
          gap: `${px(10 * k())} ${px(40)}`,
        }}
      >
        <For each={concerts()}>{(c) => Row(c)}</For>
      </ul>
      <Show when={props.doc.intro}>
        <p style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(34), color: NAVY }}>{props.doc.intro}</p>
      </Show>
      <Show when={props.doc.ticketsUrl}>
        <Pill text={`Entradas · ${props.doc.ticketsUrl}`} color="#ffffff" size={24} />
      </Show>
    </main>
  )

  const Footer = () => (
    <footer
      class="flex items-center justify-between"
      style={{ background: NAVY, padding: `${px(16)} ${px(48)}`, gap: px(24) }}
    >
      <span style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(30), color: HONEY }}>{props.doc.footer}</span>
      <Bee size={64 * s()} />
      <span
        class="text-right uppercase"
        style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(28), color: HONEY, 'line-height': 1.05, 'max-width': px(380) }}
      >
        {props.doc.credit}
      </span>
    </footer>
  )

  return (
    <div ref={frame} class="relative flex h-full w-full flex-col overflow-hidden" style={{ 'background-color': p().bg }}>
      <Header />
      <div class="relative flex min-h-0 flex-1 flex-col">
        <Honeycomb r={34 * base()} color={shade(p().bg, 0.92)} />
        <Cloud w={190 * base()} style={{ left: `${-40 * base()}px`, top: '30%' }} />
        <Cloud w={220 * base()} style={{ right: `${-50 * base()}px`, top: '62%' }} />
        <div class="absolute" style={{ right: `${40 * base()}px`, top: `${120 * base()}px` }}>
          <Bee size={96 * base()} flip tilt={8} />
        </div>
        <div class="absolute" style={{ left: `${36 * base()}px`, top: '46%' }}>
          <Bee size={70 * base()} tilt={-14} />
        </div>
        <div class="absolute" style={{ right: `${70 * base()}px`, bottom: '18%' }}>
          <Daisy size={74 * base()} />
        </div>
        <Body />
      </div>
      <Footer />
    </div>
  )
}
