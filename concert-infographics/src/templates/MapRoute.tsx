import { For, Index, Show } from 'solid-js'
import type { TemplateProps } from '.'
import type { Concert, Palette } from '../types'
import { dateParts, sortByDate } from '../lib/dates'

// Illustrated-map poster: numbered pins coloured by day over a city map,
// a day legend and a call-to-action box. Inspired by travel itinerary maps.

const FONT = {
  serif: '"Merriweather", serif',
  label: '"Oswald", sans-serif',
}

const dayColors = (p: Palette) => [p.accent, p.fg, '#e0892b', p.accent2, '#7a5236', '#7b5ea7']

// Deterministic pseudo-random generator so the illustrated map never changes between renders.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const MAP = (() => {
  const rand = rng(42)
  const tones = ['#ead8b8', '#e3c9a2', '#dcbb92', '#efe0c4', '#d4a37f']
  const blocks: { x: number; y: number; w: number; h: number; fill: string }[] = []
  for (let gx = 0; gx < 25; gx++) {
    for (let gy = 0; gy < 25; gy++) {
      const x = gx * 40 + rand() * 6
      const y = gy * 40 + rand() * 6
      blocks.push({ x, y, w: 26 + rand() * 8, h: 26 + rand() * 8, fill: tones[Math.floor(rand() * tones.length)] })
    }
  }
  const trees: { x: number; y: number; r: number }[] = []
  const parks = [
    { cx: 780, cy: 560, rx: 150, ry: 120 },
    { cx: 150, cy: 300, rx: 110, ry: 90 },
    { cx: 420, cy: 880, rx: 120, ry: 70 },
  ]
  for (const park of parks) {
    for (let i = 0; i < 70; i++) {
      const a = rand() * Math.PI * 2
      const d = Math.sqrt(rand())
      trees.push({ x: park.cx + Math.cos(a) * park.rx * d, y: park.cy + Math.sin(a) * park.ry * d, r: 6 + rand() * 7 })
    }
  }
  return { blocks, parks, trees }
})()

function IllustratedMap() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 h-full w-full">
      <rect width="1000" height="1000" fill="#f1e4ca" />
      <For each={MAP.blocks}>{(b) => <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={b.fill} />}</For>
      <path d="M-20 720 C 200 650, 320 820, 520 760 S 820 620, 1020 700" fill="none" stroke="#9cc3db" stroke-width="38" />
      <path d="M-20 720 C 200 650, 320 820, 520 760 S 820 620, 1020 700" fill="none" stroke="#b8d6e8" stroke-width="18" />
      <For each={['M0 120 L1000 520', 'M560 0 L620 1000', 'M0 860 L1000 180', 'M200 0 C 260 400, 180 700, 260 1000']}>
        {(d) => <path d={d} fill="none" stroke="#fbf5ea" stroke-width="16" stroke-linecap="round" />}
      </For>
      <For each={MAP.parks}>{(p) => <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#b5cf92" />}</For>
      <For each={MAP.trees}>{(t) => <circle cx={t.x} cy={t.y} r={t.r} fill="#7fa660" fill-opacity="0.85" />}</For>
      <ellipse cx="790" cy="575" rx="45" ry="28" fill="#9cc3db" />
    </svg>
  )
}

function PinShape(props: { color: string; n: number; size: number }) {
  return (
    <svg viewBox="0 0 40 52" style={{ width: `${props.size}px`, height: `${props.size * 1.3}px`, display: 'block' }}>
      <path d="M20 51 C 20 51 3 31 3 19 A 17 17 0 0 1 37 19 C 37 31 20 51 20 51 Z" fill={props.color} stroke="#ffffff" stroke-width="2" />
      <text x="20" y="25.5" text-anchor="middle" font-family="Merriweather, serif" font-weight="900" font-size="18" fill="#ffffff">
        {props.n}
      </text>
    </svg>
  )
}

// Spread pins on a golden-angle spiral until the user drags them somewhere else.
const defaultPin = (i: number, n: number) => {
  const r = 8 + 32 * Math.sqrt((i + 0.5) / Math.max(n, 1))
  const a = i * 2.39996 + 0.6
  return {
    x: Math.min(86, Math.max(10, 50 + r * Math.cos(a) * 1.1)),
    y: Math.min(90, Math.max(16, 55 + r * Math.sin(a) * 0.95)),
  }
}

export default function MapRoute(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  const s = () =>
    landscape()
      ? Math.min(props.format.width / 1920, props.format.height / 1000)
      : Math.min(props.format.width / 1080, props.format.height / 1350)
  const px = (n: number) => `${n * s()}px`

  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const days = () => [...new Set(concerts().map((c) => c.date))]
  const dayOf = (c: Concert) => days().indexOf(c.date)
  const colorOf = (day: number) => dayColors(p())[day % 6]
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)

  let mapEl!: HTMLDivElement
  const startDrag = (c: Concert, e: PointerEvent) => {
    if (!props.onPinMove) return
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const rect = mapEl.getBoundingClientRect()
      const x = Math.min(97, Math.max(3, ((ev.clientX - rect.left) / rect.width) * 100))
      const y = Math.min(99, Math.max(8, ((ev.clientY - rect.top) / rect.height) * 100))
      props.onPinMove?.(c.id, Math.round(x * 10) / 10, Math.round(y * 10) / 10)
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  const Header = () => (
    <header class="relative text-center">
      <h1 style={{ 'font-family': FONT.serif, 'font-weight': 900, 'font-size': px(headline().length > 14 ? 92 : 124), color: p().fg, 'line-height': 1.05 }}>
        {headline()}
      </h1>
      <Show when={props.doc.subtitle}>
        <p style={{ 'font-family': FONT.serif, 'font-size': px(44), color: p().accent, 'margin-top': px(6) }}>
          <span style={{ color: p().fg, 'font-size': px(30) }}>✦ </span>
          {props.doc.subtitle}
          <span style={{ color: p().fg, 'font-size': px(30) }}> ✦</span>
        </p>
      </Show>
    </header>
  )

  const MapArea = () => (
    <div ref={mapEl} class="relative min-h-0 flex-1" style={{ 'touch-action': 'none' }}>
      <div class="absolute inset-0 overflow-hidden">
        <Show when={props.doc.mapImage} fallback={<IllustratedMap />}>
          <img src={props.doc.mapImage} alt="" class="absolute inset-0 h-full w-full object-cover" />
        </Show>
        <div
          class="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at center, transparent 55%, ${p().bg} 80%)` }}
        />
      </div>
      <Index each={concerts()}>
        {(c, i) => {
          const pos = () => c().pin ?? defaultPin(i, concerts().length)
          const color = () => colorOf(dayOf(c()))
          const flip = () => pos().x > 62
          return (
            <div
              class="absolute flex items-end"
              style={{
                left: `${pos().x}%`,
                top: `${pos().y}%`,
                transform: `translate(${flip() ? 'calc(-100% + ' + px(22) + ')' : px(-22)}, -100%)`,
                'flex-direction': flip() ? 'row-reverse' : 'row',
                gap: px(6),
                cursor: props.onPinMove ? 'grab' : 'default',
              }}
              onPointerDown={(e) => startDrag(c(), e)}
            >
              <PinShape color={color()} n={dayOf(c()) + 1} size={44 * s()} />
              <div
                style={{
                  background: '#fbf6ec',
                  border: `${px(1.5)} solid ${color()}`,
                  'border-radius': px(6),
                  padding: `${px(4)} ${px(10)}`,
                  'margin-bottom': px(26),
                  'box-shadow': `0 ${px(2)} ${px(6)} rgba(0,0,0,0.15)`,
                  'white-space': 'nowrap',
                }}
              >
                <p style={{ 'font-family': FONT.label, 'font-weight': 600, 'font-size': px(22), color: '#2b2b2b', 'line-height': 1.15 }}>
                  {c().artist || 'Artista'}
                </p>
                <Show when={c().venue || props.doc.venue}>
                  <p style={{ 'font-family': FONT.label, 'font-size': px(16), color: '#555', 'line-height': 1.15 }}>
                    {c().venue || props.doc.venue}
                  </p>
                </Show>
              </div>
            </div>
          )
        }}
      </Index>
    </div>
  )

  const Legend = () => (
    <div
      class="flex flex-wrap items-center justify-center"
      style={{
        'row-gap': px(10),
        background: '#fbf6ec',
        border: `${px(1.5)} solid ${p().fg}22`,
        'border-radius': px(14),
        padding: `${px(12)} ${px(16)}`,
      }}
    >
      <For each={days()}>
        {(date, i) => {
          const d = dateParts(date)
          return (
            <div
              class="flex items-center"
              style={{
                gap: px(8),
                padding: `0 ${px(18)}`,
                'border-left': i() ? `${px(1.5)} solid ${p().fg}33` : 'none',
              }}
            >
              <PinShape color={colorOf(i())} n={i() + 1} size={30 * s()} />
              <span style={{ 'font-family': FONT.serif, 'font-size': px(24), color: colorOf(i()) }}>
                {date ? `${d.weekday} ${d.day} ${d.month}` : 'Sin fecha'}
              </span>
            </div>
          )
        }}
      </For>
    </div>
  )

  const Cta = () => (
    <Show when={props.doc.ticketsUrl || props.doc.intro}>
      <div
        class="flex items-center"
        style={{
          gap: px(28),
          background: '#fbf6ec',
          border: `${px(1.5)} solid ${p().fg}22`,
          'border-radius': px(18),
          padding: `${px(20)} ${px(28)}`,
        }}
      >
        <div
          class="flex shrink-0 items-center justify-center rounded-full"
          style={{ width: px(84), height: px(84), background: p().accent }}
        >
          <svg viewBox="0 0 24 24" style={{ width: px(40), height: px(40) }}>
            <path
              fill="none"
              stroke="#fff"
              stroke-width="1.8"
              stroke-linejoin="round"
              d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z M14 6v12"
            />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <Show when={props.doc.ticketsUrl}>
            <p style={{ 'font-family': FONT.serif, 'font-size': px(32), color: p().fg }}>
              Entradas en <span style={{ color: p().accent }}>{props.doc.ticketsUrl}</span>
            </p>
          </Show>
          <Show when={props.doc.intro}>
            <p style={{ 'font-family': FONT.label, 'font-size': px(22), color: '#444', 'margin-top': px(4), 'line-height': 1.3 }}>
              {props.doc.intro}
            </p>
          </Show>
          <Show when={props.doc.credit}>
            <p style={{ 'font-family': FONT.serif, 'font-weight': 900, 'font-size': px(22), color: p().fg, 'margin-top': px(6) }}>
              {props.doc.credit}
            </p>
          </Show>
        </div>
        <span style={{ color: p().accent, 'font-size': px(36) }}>✦</span>
      </div>
    </Show>
  )

  const Brand = () => (
    <Show when={props.doc.footer}>
      <p
        class="text-right"
        style={{
          'font-family': FONT.serif,
          'font-weight': 900,
          'font-size': px(26),
          color: p().fg,
        }}
      >
        {props.doc.footer}
      </p>
    </Show>
  )

  return (
    <div class="relative h-full w-full overflow-hidden" style={{ 'background-color': p().bg, padding: px(48) }}>
      <Show
        when={landscape()}
        fallback={
          <div class="flex h-full flex-col" style={{ gap: px(24) }}>
            <div style={{ 'margin-bottom': px(-24) }}>
              <Brand />
            </div>
            <Header />
            <MapArea />
            <Legend />
            <Cta />
          </div>
        }
      >
        <div class="grid h-full" style={{ 'grid-template-columns': '0.8fr 1.2fr', gap: px(40) }}>
          <div class="flex flex-col justify-center" style={{ gap: px(30) }}>
            <Brand />
            <Header />
            <Legend />
            <Cta />
          </div>
          <div class="flex h-full flex-col">
            <MapArea />
          </div>
        </div>
      </Show>
    </div>
  )
}
