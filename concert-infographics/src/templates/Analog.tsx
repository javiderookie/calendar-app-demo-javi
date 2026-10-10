import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import type { TemplateProps } from '.'
import type { Concert, Palette } from '../types'
import { dateParts, longDate, sortByDate } from '../lib/dates'
import { createAutoFit } from '../lib/autofit'

// Retro risograph poster: cream paper with grain, four inks, mixed display type,
// vinyl records as date markers. Inspired by vintage music infographics.

const FONT = {
  display: '"Rye", serif',
  script: '"Yellowtail", cursive',
  slab: '"Alfa Slab One", serif',
  sans: '"Oswald", sans-serif',
}

// Paper grain as a small random-alpha PNG (SVG filters don't survive PNG export).
const GRAIN = (() => {
  if (typeof document === 'undefined') return 'none'
  const size = 160
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 60
    img.data[i + 1] = 45
    img.data[i + 2] = 30
    img.data[i + 3] = Math.random() * 38
  }
  ctx.putImageData(img, 0, 0)
  return `url(${canvas.toDataURL('image/png')})`
})()

const ordinal = (n: number) => `${n}°`

function Stripes(props: { p: Palette; s: number; flip?: boolean }) {
  const bars = () => {
    const list = [props.p.fg, props.p.accent2, props.p.accent]
    return props.flip ? [...list].reverse() : list
  }
  return (
    <div class="flex min-w-0 flex-1 flex-col" style={{ gap: `${10 * props.s}px` }}>
      <For each={bars()}>{(color) => <div style={{ height: `${22 * props.s}px`, background: color }} />}</For>
    </div>
  )
}

function Vinyl(props: { p: Palette; size: number; label: string; children?: JSX.Element }) {
  return (
    <div class="relative shrink-0" style={{ width: `${props.size}px`, height: `${props.size}px` }}>
      <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="49" fill={props.p.fg} />
        <For each={[44, 40, 36, 32]}>
          {(r) => <circle cx="50" cy="50" r={r} fill="none" stroke={props.p.bg} stroke-opacity="0.18" stroke-width="0.6" />}
        </For>
        <circle cx="50" cy="50" r="27" fill={props.label} />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">{props.children}</div>
    </div>
  )
}

function Note(props: { color: string; size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: `${props.size}px`, height: `${props.size}px` }}>
      <path fill={props.color} d="M9 3v11.3A3.5 3.5 0 1 0 11 17V8h7V3H9z" />
    </svg>
  )
}

export default function Analog(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  // Shrinks everything when the content would overflow the canvas.
  let frame!: HTMLDivElement
  const fit = createAutoFit(() => frame, () => [JSON.stringify(props.doc), props.format.id])
  const base = () =>
    landscape()
      ? Math.min(props.format.width / 1920, props.format.height / 1000)
      : Math.min(props.format.width / 1080, props.format.height / 1400)
  const s = () => base() * fit()
  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)
  const withImages = () => concerts().filter((c) => c.image)
  // Shrink rows as the cycle grows so long line-ups still fit.
  const rowScale = () => Math.max(0.6, Math.min(1, 4.5 / Math.max(concerts().length, 1)))
  const twoCols = () => isCycle() && concerts().length > 6

  const px = (n: number) => `${n * s()}px`

  const Header = () => (
    <header class="flex flex-col items-center">
      <div class="flex w-full items-center" style={{ gap: px(28) }}>
        <Stripes p={p()} s={s()} />
        <h1
          class="shrink text-center uppercase leading-[0.95]"
          style={{
            'font-family': FONT.display,
            'font-size': px(headline().length > 12 ? 104 : 140),
            color: p().accent,
            'text-shadow': `${px(5)} ${px(5)} 0 ${p().fg}`,
            'max-width': '72%',
            'overflow-wrap': 'anywhere',
          }}
        >
          {headline()}
        </h1>
        <Stripes p={p()} s={s()} flip />
      </div>
      <Show when={props.doc.subtitle}>
        <p style={{ 'font-family': FONT.script, 'font-size': px(84), color: p().fg, 'margin-top': px(-6), 'line-height': 1.1 }}>
          {props.doc.subtitle}
        </p>
      </Show>
    </header>
  )

  const Facts = () => (
    <section class="flex items-center" style={{ gap: px(40) }}>
      <Show when={props.doc.highlight.big}>
        <div class="flex shrink-0 items-baseline" style={{ gap: px(14) }}>
          <span style={{ 'font-family': FONT.slab, 'font-size': px(150), color: p().fg, 'line-height': 0.9 }}>
            {props.doc.highlight.big}
          </span>
          <span
            style={{
              'font-family': FONT.script,
              'font-size': px(56),
              color: p().accent,
              'max-width': px(300),
              'line-height': 1,
            }}
          >
            {props.doc.highlight.text}
          </span>
        </div>
      </Show>
      <Show when={props.doc.intro}>
        <div class="flex-1" style={{ 'border-left': `${px(4)} solid ${p().accent2}`, 'padding-left': px(28) }}>
          <p style={{ 'font-family': FONT.sans, 'font-size': px(30), color: p().fg, 'line-height': 1.3 }}>{props.doc.intro}</p>
        </div>
      </Show>
    </section>
  )

  const Row = (c: Concert, index: () => number) => {
    // Accessors: the row is reused while its fields are edited.
    const d = () => dateParts(c.date)
    const k = () => (isCycle() ? rowScale() : 1.5)
    const meta = () => [c.time && `${c.time} h`, c.venue, c.price].filter(Boolean).join('  ·  ')
    return (
      <li class="flex items-center" style={{ gap: px(30 * k()) }}>
        <Vinyl p={p()} size={150 * k() * s()} label={index() % 2 ? p().accent2 : p().accent}>
          <span style={{ 'font-family': FONT.sans, 'font-size': px(15 * k()), color: p().fg, 'text-transform': 'uppercase' }}>
            {d().weekday}
          </span>
          <span style={{ 'font-family': FONT.slab, 'font-size': px(36 * k()), color: p().fg }}>{d().day}</span>
          <span style={{ 'font-family': FONT.sans, 'font-size': px(15 * k()), color: p().fg, 'text-transform': 'uppercase' }}>
            {d().month}
          </span>
        </Vinyl>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline" style={{ gap: px(14 * k()) }}>
            <Show when={isCycle()}>
              <span style={{ 'font-family': FONT.script, 'font-size': px(46 * k()), color: p().accent2 }}>{ordinal(index() + 1)}</span>
            </Show>
            <span
              class="uppercase"
              classList={{ truncate: isCycle() }}
              style={{ 'font-family': FONT.slab, 'font-size': px((isCycle() ? 56 : 40) * k()), color: p().fg, 'line-height': 1.05 }}
            >
              {isCycle() ? c.artist || 'Artista' : longDate(c.date)}
            </span>
          </div>
          <Show when={meta()}>
            <p style={{ 'font-family': FONT.sans, 'font-size': px(28 * k()), color: p().fg, 'letter-spacing': '0.04em' }}>{meta()}</p>
          </Show>
          <Show when={c.note}>
            <p style={{ 'font-family': FONT.script, 'font-size': px(34 * k()), color: p().accent }}>{c.note}</p>
          </Show>
        </div>
      </li>
    )
  }

  const Lineup = () => (
    <section data-fit class="flex flex-1 flex-col justify-center overflow-hidden" style={{ gap: px(18) }}>
      <Show when={isCycle()}>
        <div class="flex items-center" style={{ gap: px(16) }}>
          <h2 class="uppercase" style={{ 'font-family': FONT.sans, 'font-weight': 600, 'font-size': px(44), color: p().fg }}>
            El cartel
          </h2>
          <Note color={p().accent} size={36 * s()} />
          <Note color={p().accent2} size={28 * s()} />
        </div>
      </Show>
      <ul
        class="grid"
        style={{
          'grid-template-columns': twoCols() ? '1fr 1fr' : '1fr',
          gap: `${px(22 * rowScale())} ${px(40)}`,
        }}
      >
        <For each={concerts()}>{(c, i) => Row(c, i)}</For>
      </ul>
    </section>
  )

  const Covers = () => (
    <Show when={withImages().length > 0}>
      <section class="flex" style={{ gap: px(20) }}>
        <For each={withImages().slice(0, 6)}>
          {(c) => (
            <figure class="min-w-0 flex-1" style={{ 'max-width': px(190) }}>
              <img src={c.image} alt="" class="aspect-square w-full object-cover" style={{ border: `${px(4)} solid ${p().fg}` }} />
              <figcaption
                class="truncate uppercase"
                style={{ 'font-family': FONT.sans, 'font-size': px(20), color: p().fg, 'margin-top': px(6) }}
              >
                <Show when={isCycle()}>
                  <span style={{ 'font-family': FONT.script, color: p().accent2, 'font-size': px(30) }}>
                    {ordinal(concerts().indexOf(c) + 1)}{' '}
                  </span>
                </Show>
                {c.artist}
              </figcaption>
            </figure>
          )}
        </For>
      </section>
    </Show>
  )

  const Footer = () => (
    <footer class="flex items-end justify-between" style={{ gap: px(30), 'border-top': `${px(4)} solid ${p().fg}`, 'padding-top': px(20) }}>
      <div class="min-w-0">
        <p style={{ 'font-family': FONT.script, 'font-size': px(64), color: p().accent, 'line-height': 1 }}>{props.doc.venue}</p>
        <Show when={props.doc.ticketsUrl}>
          <p class="uppercase" style={{ 'font-family': FONT.sans, 'font-size': px(26), color: p().fg, 'letter-spacing': '0.08em' }}>
            Entradas · {props.doc.ticketsUrl}
          </p>
        </Show>
      </div>
      <p class="shrink-0 uppercase" style={{ 'font-family': FONT.slab, 'font-size': px(30), color: p().fg }}>
        {props.doc.footer}
      </p>
    </footer>
  )

  return (
    <div
      ref={frame}
      class="relative h-full w-full overflow-hidden"
      style={{ 'background-color': p().bg, 'background-image': GRAIN, padding: px(64) }}
    >
      <Show when={props.doc.credit}>
        <p
          class="absolute uppercase"
          style={{
            top: px(22),
            right: px(64),
            'font-family': FONT.sans,
            'font-weight': 600,
            'font-size': px(18),
            'letter-spacing': '0.2em',
            color: p().fg,
          }}
        >
          {props.doc.credit}
        </p>
      </Show>
      <Show
        when={landscape()}
        fallback={
          <div data-fit class="flex h-full flex-col overflow-hidden" style={{ gap: px(36) }}>
            <Header />
            <Facts />
            <Lineup />
            <Covers />
            <Footer />
          </div>
        }
      >
        <div class="grid h-full" style={{ 'grid-template-columns': '1fr 1fr', gap: px(60) }}>
          <div data-fit class="flex flex-col justify-between overflow-hidden" style={{ gap: px(30) }}>
            <Header />
            <Facts />
            <Footer />
          </div>
          <Lineup />
        </div>
      </Show>
    </div>
  )
}
