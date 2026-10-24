import { For, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dateParts, sortByDate, spanDays } from '../lib/dates'
import { groupByVenue, plural, venueName } from '../lib/groups'
import { createAutoFit } from '../lib/autofit'
import { shade } from '../lib/color'

// Gadget-history style: a hanging title sign, a dark left rail with date tabs, colourful
// audio cables weaving behind each entry, and a closing figures panel.
// Inspired by "history of" product timelines.

const FONT = { round: '"Fredoka", sans-serif', body: '"Inter", sans-serif' }
const CABLE_COLORS = ['#2f8fb3', '#e0703a', '#d64545', '#8e5bb5', '#5aa95a', '#e2b33c']

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/** Wavy cables in a 1000×1000 box, drawn once. */
const CABLES = (() => {
  const rand = rng(7)
  return CABLE_COLORS.map((color, i) => {
    let y = 60 + i * 150 + rand() * 60
    let d = `M -20 ${y.toFixed(0)}`
    for (let x = 0; x <= 1040; x += 130) {
      const ny = Math.max(20, Math.min(980, y + (rand() - 0.5) * 260))
      d += ` S ${(x + 65).toFixed(0)} ${ny.toFixed(0)} ${(x + 130).toFixed(0)} ${((ny + y) / 2).toFixed(0)}`
      y = ny
    }
    return { color, d }
  })
})()

export default function Cables(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  let frame!: HTMLDivElement
  const fit = createAutoFit(() => frame, () => [JSON.stringify(props.doc), props.format.id])
  const s = () =>
    (landscape() ? Math.min(props.format.width / 1920, props.format.height / 1000) : Math.min(props.format.width / 1080, props.format.height / 1450)) *
    fit()
  const px = (n: number) => `${n * s()}px`

  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const venues = () => groupByVenue(concerts(), props.doc.venue)
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)
  const twoCols = () => concerts().length > (landscape() ? 5 : 9)
  const k = () => Math.max(0.62, Math.min(1.25, 7 / Math.max(concerts().length / (twoCols() ? 2 : 1), 1)))

  const Sign = () => (
    <header class="relative flex flex-col items-center">
      <div class="flex" style={{ gap: px(220), height: px(26) }}>
        <div style={{ width: px(4), background: shade(p().fg, 1.4) }} />
        <div style={{ width: px(4), background: shade(p().fg, 1.4) }} />
      </div>
      <div
        class="text-center"
        style={{
          background: p().accent,
          border: `${px(6)} solid ${shade(p().accent, 0.7)}`,
          'border-radius': px(18),
          padding: `${px(14)} ${px(44)}`,
          'box-shadow': `0 ${px(8)} ${px(18)} rgba(0,0,0,0.18)`,
        }}
      >
        <Show when={props.doc.subtitle}>
          <p style={{ 'font-family': FONT.round, 'font-weight': 500, 'font-size': px(30), color: '#fff', opacity: 0.9 }}>{props.doc.subtitle}</p>
        </Show>
        <h1 style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(headline().length > 16 ? 64 : 84), color: '#fff', 'line-height': 1.02 }}>
          {headline()}
        </h1>
      </div>
    </header>
  )

  const Entry = (c: TemplateProps['doc']['concerts'][number]) => {
    const d = () => dateParts(c.date)
    return (
      <li class="relative flex items-center" style={{ gap: px(18 * k()), 'min-height': px(96 * k()) }}>
        <div
          class="relative z-10 flex shrink-0 flex-col items-center justify-center leading-none"
          style={{
            width: px(118 * k()),
            height: px(78 * k()),
            background: '#9aa2a8',
            color: '#fff',
            'border-radius': `0 ${px(14)} ${px(14)} 0`,
            'margin-left': px(-24),
            'box-shadow': `inset ${px(5)} 0 0 ${shade(p().fg, 1.2)}`,
          }}
        >
          <span style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(36 * k()) }}>{d().day}</span>
          <span class="uppercase" style={{ 'font-family': FONT.round, 'font-weight': 600, 'font-size': px(18 * k()) }}>
            {d().month}
          </span>
        </div>
        <div class="flex min-w-0 flex-1 items-center" style={{ gap: px(16 * k()), background: p().bg, 'border-radius': px(14), padding: `${px(8 * k())} ${px(14)}`, 'box-shadow': `0 ${px(2)} ${px(6)} rgba(0,0,0,0.12)` }}>
          <Show
            when={c.image}
            fallback={
              <svg viewBox="0 0 40 40" style={{ width: px(50 * k()), height: px(50 * k()), 'flex-shrink': 0 }}>
                <rect x="2" y="6" width="36" height="28" rx="5" fill={p().accent2} />
                <circle cx="13" cy="20" r="7" fill="#fff" fill-opacity="0.85" />
                <circle cx="13" cy="20" r="2.5" fill={p().accent2} />
                <rect x="24" y="12" width="10" height="3" rx="1.5" fill="#fff" fill-opacity="0.8" />
                <rect x="24" y="18" width="10" height="3" rx="1.5" fill="#fff" fill-opacity="0.8" />
                <rect x="24" y="24" width="10" height="3" rx="1.5" fill="#fff" fill-opacity="0.8" />
              </svg>
            }
          >
            <img src={c.image} alt="" class="shrink-0 object-cover" style={{ width: px(50 * k()), height: px(50 * k()), 'border-radius': px(8) }} />
          </Show>
          <div class="min-w-0">
            <p class="truncate" style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px((twoCols() && !landscape() ? 26 : 30) * k()), color: p().fg, 'line-height': 1.1 }}>
              {c.artist || 'Artista'}
            </p>
            <p class="truncate" style={{ 'font-family': FONT.body, 'font-size': px(17 * k()), color: shade(p().fg, 1.6) }}>
              {[venueName(c, props.doc.venue), c.time && `${c.time} h`, c.price, c.note].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </li>
    )
  }

  const Rail = () => (
    <section data-fit class="relative min-h-0 flex-1 overflow-hidden">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" class="absolute inset-0 h-full w-full">
        <For each={CABLES}>
          {(cable) => (
            <>
              <path d={cable.d} fill="none" stroke={shade(cable.color, 0.6)} stroke-width="16" stroke-linecap="round" vector-effect="non-scaling-stroke" />
              <path d={cable.d} fill="none" stroke={cable.color} stroke-width="11" stroke-linecap="round" vector-effect="non-scaling-stroke" />
            </>
          )}
        </For>
      </svg>
      <div class="absolute top-0 bottom-0 left-0" style={{ width: px(110), background: p().fg, 'border-radius': `0 ${px(26)} ${px(26)} 0` }} />
      <ol
        class="relative grid h-full content-around"
        style={{
          'grid-template-columns': twoCols() ? '1fr 1fr' : '1fr',
          'grid-template-rows': twoCols() ? `repeat(${Math.ceil(concerts().length / 2)}, auto)` : 'none',
          'grid-auto-flow': twoCols() ? 'column' : 'row',
          gap: `${px(10 * k())} ${px(24)}`,
          'padding-left': px(46),
          'padding-right': px(8),
        }}
      >
        <For each={concerts()}>{(c) => Entry(c)}</For>
      </ol>
    </section>
  )

  const Panel = () => (
    <section
      class="flex items-center justify-between"
      style={{ gap: px(20), background: `${p().bg}`, border: `${px(3)} solid ${shade(p().bg, 0.85)}`, 'border-radius': px(20), padding: `${px(14)} ${px(26)}` }}
    >
      <div class="flex" style={{ gap: px(26) }}>
        <For
          each={[
            [String(concerts().length), plural(concerts().length, 'concierto')],
            [String(venues().length), plural(venues().length, 'sala')],
            ...(spanDays(concerts().map((c) => c.date)) > 1 ? [[String(spanDays(concerts().map((c) => c.date))), 'días']] : []),
          ]}
        >
          {([v, l], i) => (
            <div class="text-center leading-none">
              <p style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(54), color: CABLE_COLORS[i() % CABLE_COLORS.length] }}>{v}</p>
              <p class="uppercase" style={{ 'font-family': FONT.round, 'font-weight': 600, 'font-size': px(17), color: p().fg }}>
                {l}
              </p>
            </div>
          )}
        </For>
      </div>
      <div class="min-w-0 text-right" style={{ 'font-family': FONT.round, color: p().fg }}>
        <Show when={props.doc.intro}>
          <p style={{ 'font-weight': 700, 'font-size': px(24) }}>{props.doc.intro}</p>
        </Show>
        <p style={{ 'font-size': px(18), opacity: 0.75 }}>
          {[props.doc.ticketsUrl && `Entradas · ${props.doc.ticketsUrl}`, props.doc.footer, props.doc.credit].filter(Boolean).join('  ·  ')}
        </p>
      </div>
    </section>
  )

  return (
    <div ref={frame} class="h-full w-full overflow-hidden" style={{ 'background-color': p().bg, padding: `0 ${px(40)} ${px(36)}` }}>
      <div data-fit class="flex h-full flex-col overflow-hidden" style={{ gap: px(22) }}>
        <Sign />
        <Show when={props.doc.banner}>
          <p class="text-center uppercase" style={{ 'font-family': FONT.round, 'font-weight': 700, 'font-size': px(26), color: p().fg, 'letter-spacing': '0.1em' }}>
            {props.doc.banner}
          </p>
        </Show>
        <Rail />
        <Panel />
      </div>
    </div>
  )
}
