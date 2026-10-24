import { createEffect, createSignal, For, Index, on, onMount, Show } from 'solid-js'
import type { TemplateProps } from '.'
import type { Concert } from '../types'
import { sortByDate, spanDays, yearOf } from '../lib/dates'
import { fmtWhen, infoTypeOf, noun } from '../lib/infoTypes'
import { groupByVenue, plural } from '../lib/groups'
import { createAutoFit } from '../lib/autofit'

// Punk-zine collage: black paper, a torn yellow strip slashing across, ransom-note
// headline, marker annotations, chunky figures, lightning-bolt bar chart and a
// guitar-pick timeline. Inspired by artist-profile fanzine infographics.

const FONT = {
  marker: '"Permanent Marker", cursive',
  type: '"Special Elite", monospace',
  heavy: '"Anton", sans-serif',
  slab: '"Alfa Slab One", serif',
  body: '"Inter", sans-serif',
}
const TODAY = new Date().toISOString().slice(0, 10)

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/** Jagged near-vertical strip for the gutter between columns (100×100 box). */
const TORN = (() => {
  const rand = rng(11)
  const left: string[] = []
  const right: string[] = []
  for (let i = 0; i <= 30; i++) {
    const y = (i / 30) * 100
    left.push(`${(8 + rand() * 22).toFixed(1)},${y.toFixed(1)}`)
    right.push(`${(70 + rand() * 22).toFixed(1)},${y.toFixed(1)}`)
  }
  return [...left, ...right.reverse()].join(' ')
})()

/** Torn paper band (horizontal), used behind the timeline. */
const BAND = (() => {
  const rand = rng(5)
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * 100
    top.push(`${x.toFixed(1)},${(4 + rand() * 18).toFixed(1)}`)
    bottom.push(`${x.toFixed(1)},${(78 + rand() * 18).toFixed(1)}`)
  }
  return [...top, ...bottom.reverse()].join(' ')
})()

const RANSOM_FONTS = [FONT.heavy, FONT.type, FONT.slab, FONT.marker]

function Ransom(props: { text: string; size: number; colors: string[]; seed?: number }) {
  // Letters keep their look per position; lines only break between words.
  const words = () => {
    const rand = rng(props.seed ?? 3)
    let i = 0
    return props.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        [...word].map((ch) => ({
          ch,
          font: RANSOM_FONTS[Math.floor(rand() * RANSOM_FONTS.length)],
          bg: rand() < 0.45 ? props.colors[i++ % props.colors.length] : 'transparent',
          rot: (rand() - 0.5) * 14,
          scale: 0.85 + rand() * 0.3,
        })),
      )
  }
  // Measure the widest word and shrink just enough for it to fit the column.
  let box!: HTMLSpanElement
  const [k, setK] = createSignal(1)
  const refit = () => {
    setK(1)
    const avail = box.parentElement?.clientWidth ?? 0
    const widest = Math.max(0, ...Array.from(box.children, (w) => (w as HTMLElement).offsetWidth))
    if (avail && widest > avail) setK(avail / widest)
  }
  onMount(() => document.fonts.ready.then(refit))
  createEffect(on(() => [props.text, props.size], () => queueMicrotask(refit), { defer: true }))
  const size = () => props.size * k()

  return (
    <span ref={box} class="inline-flex flex-wrap items-end justify-end" style={{ gap: `${size() * 0.06}px ${size() * 0.3}px`, 'line-height': 1 }}>
      <For each={words()}>
        {(letters) => (
          <span class="inline-flex shrink-0 flex-nowrap items-end" style={{ gap: `${size() * 0.04}px` }}>
            <For each={letters}>
              {(l) => (
                <span
                  style={{
                    'font-family': l.font,
                    'font-size': `${size() * l.scale}px`,
                    background: l.bg,
                    color: l.bg === 'transparent' ? props.colors[0] : '#111',
                    transform: `rotate(${l.rot}deg)`,
                    padding: `0 ${size() * 0.06}px`,
                    display: 'inline-block',
                    'text-transform': 'uppercase',
                  }}
                >
                  {l.ch}
                </span>
              )}
            </For>
          </span>
        )}
      </For>
    </span>
  )
}

function Bolt(props: { color: string; w: number; h: number }) {
  return (
    <svg viewBox="0 0 20 60" preserveAspectRatio="none" style={{ width: `${props.w}px`, height: `${props.h}px`, display: 'block' }}>
      <polygon points="6,0 18,0 12,22 19,22 4,60 8,30 1,30" fill={props.color} />
    </svg>
  )
}

function Pick(props: { size: number; fill: string; stroke: string; children: string; textColor: string }) {
  return (
    <div class="relative" style={{ width: `${props.size}px`, height: `${props.size * 1.1}px` }}>
      <svg viewBox="0 0 100 110" class="absolute inset-0 h-full w-full">
        <path d="M50 106 C 30 92 4 62 4 32 C 4 10 24 4 50 4 C 76 4 96 10 96 32 C 96 62 70 92 50 106 Z" fill={props.fill} stroke={props.stroke} stroke-width="5" />
      </svg>
      <span
        class="absolute inset-x-0 text-center"
        style={{ top: '26%', 'font-family': FONT.marker, 'font-size': `${props.size * 0.27}px`, color: props.textColor, transform: 'rotate(-6deg)' }}
      >
        {props.children}
      </span>
    </div>
  )
}

export default function Zine(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  let frame!: HTMLDivElement
  const fit = createAutoFit(() => frame, () => [JSON.stringify(props.doc), props.format.id])
  const s = () =>
    (landscape() ? Math.min(props.format.width / 1920, props.format.height / 1000) : Math.min(props.format.width / 1080, props.format.height / 1500)) *
    fit()
  const px = (n: number) => `${n * s()}px`

  const cfg = () => infoTypeOf(props.doc)
  const yearMode = () => cfg().dateMode === 'year'
  const isCycle = () => props.doc.kind === 'cycle'
  const items = () =>
    isCycle() ? (cfg().keepOrder ? [...props.doc.concerts] : sortByDate(props.doc.concerts)) : props.doc.concerts.slice(0, 1)
  const when = (c: Concert) => fmtWhen(props.doc, c, items().indexOf(c))
  // Album runtime: sum of "m:ss" durations.
  const runtime = () => {
    const secs = items().reduce((sum, c) => {
      const m = c.time.match(/^(\d+):(\d{1,2})$/)
      return m ? sum + Number(m[1]) * 60 + Number(m[2]) : sum
    }, 0)
    return secs ? Math.round(secs / 60) : 0
  }
  const upcoming = (c: Concert) => !!c.date && c.date > TODAY
  const groups = () => groupByVenue(items().filter((c) => c.venue), '').filter((g) => g.venue)
  const maxGroup = () => Math.max(1, ...groups().map((g) => g.items.length))
  const words = () => ({
    groupTitle: cfg().group ? cfg().group!.many.charAt(0).toUpperCase() + cfg().group!.many.slice(1) : '',
    listTitle: cfg().listTitle,
  })
  const span = () => {
    if (cfg().dateMode === 'none') return runtime() ? [String(runtime()), 'minutos'] : undefined
    const dates = items().map((c) => c.date).filter(Boolean)
    if (!dates.length) return undefined
    if (yearMode()) {
      const ys = dates.map((d) => Number(yearOf(d)))
      const n = Math.max(...ys) - Math.min(...ys) + 1
      return [String(n), `${plural(n, 'año')} publicando`]
    }
    const n = spanDays(dates)
    return n > 1 ? [String(n), plural(n, 'día')] : undefined
  }
  const figures = () =>
    [
      [String(items().length), noun(cfg().item, items().length)],
      groups().length && cfg().group ? [String(groups().length), noun(cfg().group!, groups().length)] : undefined,
      span(),
    ].filter(Boolean) as string[][]
  const headline = () => (isCycle() ? props.doc.title : items()[0]?.artist || props.doc.title)
  const colors = () => [p().accent2, p().accent, p().fg]
  // Each ransom letter is ~0.8em wide; size the headline so its longest word fits the column.
  const ransomSize = () => {
    const column = landscape() ? 700 : 430
    const longest = Math.max(1, ...headline().split(/\s+/).map((w) => w.length))
    return Math.min(124, column / (longest * 0.62))
  }

  const Label = (lp: { children: string; color?: string }) => (
    <h3 style={{ 'font-family': FONT.marker, 'font-size': px(28), color: lp.color ?? p().accent2, 'line-height': 1.1, 'margin-bottom': px(8) }}>{lp.children}</h3>
  )

  const List = () => (
    <section>
      <Label>{words().listTitle}</Label>
      <ol class="flex flex-col" style={{ gap: px(10) }}>
        <For each={items()}>
          {(c) => (
            <li class="flex items-center" style={{ gap: px(12) }}>
              <Show
                when={c.image}
                fallback={
                  <div
                    class="flex shrink-0 items-center justify-center"
                    style={{
                      width: px(54),
                      height: px(54),
                      background: upcoming(c) ? p().accent : p().accent2,
                      'background-image': 'radial-gradient(#0003 30%, transparent 32%)',
                      'background-size': `${px(7)} ${px(7)}`,
                      transform: `rotate(${(c.artist.length % 5) - 2}deg)`,
                    }}
                  >
                    <span style={{ 'font-family': FONT.heavy, 'font-size': px(20), color: '#111' }}>{yearMode() ? when(c).slice(-2) : when(c).slice(0, 5)}</span>
                  </div>
                }
              >
                <img src={c.image} alt="" class="shrink-0 object-cover" style={{ width: px(54), height: px(54), filter: cfg().dateMode === 'day' ? 'grayscale(1) contrast(1.3)' : 'none', border: `${px(2)} solid ${p().fg}` }} />
              </Show>
              <div class="min-w-0">
                <p class="truncate" style={{ 'font-family': FONT.body, 'font-weight': 800, 'font-size': px(22), color: p().fg, 'line-height': 1.15 }}>
                  {c.artist || 'Sin título'}
                </p>
                <p class="truncate" style={{ 'font-family': FONT.type, 'font-size': px(16), color: upcoming(c) ? p().accent : p().accent2 }}>
                  {[when(c), c.venue, c.time && (cfg().timeInput === 'time' ? `${c.time} h` : c.time), c.price, c.note].filter(Boolean).join(' · ')}
                </p>
              </div>
            </li>
          )}
        </For>
      </ol>
    </section>
  )

  const Figures = () => (
    <section class="flex flex-col" style={{ gap: px(2) }}>
      <For each={figures()}>
        {([v, l]) => (
          <p class="flex items-baseline" style={{ gap: px(14) }}>
            <span style={{ 'font-family': FONT.heavy, 'font-size': px(64), color: p().accent2, 'line-height': 1 }}>{v}</span>
            <span class="uppercase" style={{ 'font-family': FONT.type, 'font-size': px(30), color: p().fg, 'letter-spacing': '0.08em' }}>
              {l}
            </span>
          </p>
        )}
      </For>
    </section>
  )

  const Bars = () => (
    <Show when={groups().length > 1}>
      <section>
        <Label>{words().groupTitle}</Label>
        <div class="flex items-end" style={{ gap: px(14), height: px(170) }}>
          <For each={groups()}>
            {(g, i) => (
              <div class="flex min-w-0 flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                <span style={{ 'font-family': FONT.heavy, 'font-size': px(26), color: p().fg }}>{g.items.length}</span>
                <Bolt color={i() % 2 ? p().accent : p().accent2} w={34 * s()} h={(40 + (90 * g.items.length) / maxGroup()) * s()} />
                <span class="w-full truncate text-center" style={{ 'font-family': FONT.type, 'font-size': px(14), color: p().fg, 'margin-top': px(4) }}>
                  {g.venue}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>
    </Show>
  )

  const Quote = () => (
    <Show when={props.doc.intro}>
      <p style={{ 'font-family': FONT.marker, 'font-size': px(34), color: p().accent, 'line-height': 1.25, transform: 'rotate(-2deg)' }}>“{props.doc.intro}”</p>
    </Show>
  )

  const Title = () => (
    <div class="flex flex-col items-end text-right" style={{ gap: px(8) }}>
      <Show when={props.doc.banner}>
        <p style={{ 'font-family': FONT.type, 'font-size': px(24), background: p().fg, color: '#111', padding: `${px(2)} ${px(12)}`, transform: 'rotate(2deg)' }}>
          {props.doc.banner}
        </p>
      </Show>
      <Show when={props.doc.logo} fallback={<Ransom text={headline()} size={ransomSize() * s()} colors={colors()} />}>
        <img src={props.doc.logo} alt={headline()} style={{ 'max-width': '100%', 'max-height': px(260), 'object-fit': 'contain' }} />
      </Show>
      <Show when={props.doc.subtitle}>
        <p style={{ 'font-family': FONT.marker, 'font-size': px(36), color: p().accent2 }}>{props.doc.subtitle}</p>
      </Show>
      <Show when={props.doc.highlight.big}>
        <p class="flex items-baseline" style={{ gap: px(10) }}>
          <span
            style={{
              'font-family': FONT.heavy,
              'font-size': px(110),
              color: p().accent2,
              border: `${px(5)} solid ${p().accent2}`,
              'border-radius': '50%',
              padding: `0 ${px(26)}`,
              'line-height': 1.1,
            }}
          >
            {props.doc.highlight.big}
          </span>
          <span class="uppercase" style={{ 'font-family': FONT.type, 'font-size': px(28), color: p().fg, 'max-width': px(240), 'line-height': 1.1 }}>
            {props.doc.highlight.text}
          </span>
        </p>
      </Show>
    </div>
  )

  // Covers get as wide as the band allows, up to 150px.
  const coverSize = () => Math.min(150, 960 / Math.max(items().length, 1)) * s()
  const hasAnyCover = () => items().some((c) => c.image)

  const CoverCard = (cp: { src: string; label: string; size: number; hot: boolean; tilt: number }) => (
    <div class="relative" style={{ width: `${cp.size}px`, transform: `rotate(${cp.tilt * 2.5}deg)` }}>
      <div
        class="absolute left-1/2"
        style={{ top: px(-8), width: px(46), height: px(16), 'margin-left': px(-23), background: '#f4efe6cc', transform: 'rotate(-4deg)', 'z-index': 2 }}
      />
      <img
        src={cp.src}
        alt=""
        class="block aspect-square w-full object-cover"
        style={{ border: `${px(4)} solid #111`, 'box-shadow': `${px(4)} ${px(4)} 0 #111` }}
      />
      <span
        class="absolute"
        style={{
          right: px(-8),
          bottom: px(-10),
          'font-family': FONT.marker,
          'font-size': px(Math.max(18, cp.size / s() / 4.5)),
          background: cp.hot ? p().accent : '#ffffff',
          color: '#111',
          padding: `0 ${px(8)}`,
          border: `${px(3)} solid #111`,
          transform: 'rotate(-6deg)',
        }}
      >
        {cp.label}
      </span>
    </div>
  )

  const Timeline = () => (
    <section class="relative" style={{ padding: `${px(14)} 0 ${px(30)}` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute h-full" style={{ left: px(-44), right: px(-44), top: 0, width: `calc(100% + ${px(88)})` }}>
        <polygon points={BAND} fill={p().accent2} />
      </svg>
      <div class="absolute left-0 right-0" style={{ top: hasAnyCover() ? `calc(${px(14)} + ${coverSize() / 2}px)` : px(54), height: px(5), background: '#111' }} />
      <div class="relative flex justify-between" style={{ gap: px(4) }}>
        <Index each={items()}>
          {(c) => (
            <div class="flex min-w-0 flex-1 flex-col items-center text-center" style={{ gap: px(hasAnyCover() ? 14 : 4) }}>
              <Show
                when={c().image}
                fallback={
                  <Pick
                    size={Math.min(92, 900 / Math.max(items().length, 1)) * s()}
                    fill={upcoming(c()) ? p().accent : '#ffffff'}
                    stroke="#111"
                    textColor="#111"
                  >
                    {when(c())}
                  </Pick>
                }
              >
                <CoverCard src={c().image} label={when(c())} size={coverSize()} hot={upcoming(c())} tilt={(items().indexOf(c()) % 3) - 1} />
              </Show>
              <span
                class="w-full overflow-hidden"
                style={{
                  'font-family': FONT.body,
                  'font-weight': 800,
                  'font-size': px(14),
                  color: upcoming(c()) ? p().accent : '#111',
                  'line-height': 1.15,
                  display: '-webkit-box',
                  '-webkit-line-clamp': '2',
                  '-webkit-box-orient': 'vertical',
                }}
              >
                {c().artist}
              </span>
            </div>
          )}
        </Index>
      </div>
    </section>
  )

  const Gutter = () => (
    <div class="relative" style={{ margin: `${px(-60)} 0` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full">
        <polygon points={TORN} fill={p().accent2} />
      </svg>
    </div>
  )

  const Footer = () => (
    <footer class="flex items-end justify-between" style={{ 'font-family': FONT.type, 'font-size': px(17), color: p().fg, gap: px(20) }}>
      <span style={{ background: p().accent2, color: '#111', padding: `${px(2)} ${px(10)}`, 'font-weight': 700 }}>{props.doc.footer}</span>
      <span class="text-right" style={{ opacity: 0.8 }}>
        {[props.doc.ticketsUrl && `Entradas · ${props.doc.ticketsUrl}`, props.doc.credit].filter(Boolean).join('  ·  ')}
      </span>
    </footer>
  )

  return (
    <div
      ref={frame}
      class="relative h-full w-full overflow-hidden"
      style={{
        'background-color': '#111111',
        'background-image': 'radial-gradient(#ffffff0d 1px, transparent 1.5px)',
        'background-size': `${px(9)} ${px(9)}`,
      }}
    >
      <div data-fit class="relative flex h-full flex-col overflow-hidden" style={{ padding: px(44), gap: px(26) }}>
        <Show
          when={landscape()}
          fallback={
            <>
              <div class="grid min-h-0 flex-1" style={{ 'grid-template-columns': `1fr ${px(70)} 1fr`, gap: px(20) }}>
                <div data-fit class="flex min-h-0 flex-col overflow-hidden" style={{ gap: px(22) }}>
                  <List />
                  <Bars />
                </div>
                <Gutter />
                <div data-fit class="flex min-h-0 flex-col justify-between overflow-hidden" style={{ gap: px(22) }}>
                  <Figures />
                  <Quote />
                  <Title />
                </div>
              </div>
              <Timeline />
              <Footer />
            </>
          }
        >
          <div class="grid min-h-0 flex-1" style={{ 'grid-template-columns': `0.8fr 0.6fr ${px(60)} 1fr`, gap: px(24) }}>
            <div data-fit class="min-h-0 overflow-hidden">
              <List />
            </div>
            <div data-fit class="flex min-h-0 flex-col justify-center overflow-hidden" style={{ gap: px(20) }}>
              <Figures />
              <Bars />
            </div>
            <Gutter />
            <div data-fit class="flex min-h-0 flex-col justify-between overflow-hidden" style={{ gap: px(16) }}>
              <Quote />
              <Title />
            </div>
          </div>
          <Timeline />
          <Footer />
        </Show>
      </div>
    </div>
  )
}
