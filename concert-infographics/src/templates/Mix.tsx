import { For, Index, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dotDate, sortByDate, weekdayIndex } from '../lib/dates'
import { venueName } from '../lib/groups'
import { createAutoFit } from '../lib/autofit'

// DJ-manual style: dusty blue paper with pale mountains, italic "The art of" over a bold
// word, two turntables (deck A = first show, deck B = last) joined by a mixer, and
// numbered steps whose weekday is lit on an L-M-X-J-V-S-D strip like beat counters.
// Inspired by instructional DJ infographics.

const FONT = { script: '"Playfair Display", serif', heavy: '"Oswald", sans-serif', mono: '"Inter", sans-serif' }
const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function Turntable(props: { size: number; label: string; ink: string; paper: string; hand?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" style={{ width: `${props.size}px`, height: `${props.size}px`, 'flex-shrink': 0 }}>
      <rect x="2" y="2" width="116" height="116" rx="10" fill={props.paper} stroke={props.ink} stroke-width="3" />
      <circle cx="54" cy="62" r="46" fill={props.ink} />
      <For each={[40, 34, 28]}>{(r) => <circle cx="54" cy="62" r={r} fill="none" stroke={props.paper} stroke-opacity="0.18" stroke-width="1" />}</For>
      <circle cx="54" cy="62" r="15" fill={props.paper} />
      <text x="54" y="67" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="700" font-size="14" fill={props.ink}>
        {props.label}
      </text>
      <circle cx="104" cy="16" r="6" fill={props.ink} />
      <path d="M104 16 L104 70 L88 88" fill="none" stroke={props.ink} stroke-width="4" stroke-linecap="round" />
      <rect x="98" y="96" width="12" height="18" rx="2" fill={props.ink} />
    </svg>
  )
}

export default function Mix(props: TemplateProps) {
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
  const firstShow = () => concerts()[0]
  const lastShow = () => concerts()[concerts().length - 1]
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)
  const titleParts = () => {
    const words = headline().trim().split(/\s+/)
    return words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : ['', words[0] ?? '']
  }
  const twoCols = () => concerts().length > (landscape() ? 5 : 8)
  const k = () => Math.max(0.6, Math.min(1.15, 7 / Math.max(concerts().length / (twoCols() ? 2 : 1), 1)))

  const Mountains = (mp: { bottom?: boolean }) => (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      class="pointer-events-none absolute left-0 w-full"
      style={{ [mp.bottom ? 'bottom' : 'top']: '0', height: '14%', transform: mp.bottom ? 'none' : 'scaleY(-1)' }}
    >
      <polygon points="0,200 120,40 260,200" fill={p().accent2} fill-opacity="0.55" />
      <polygon points="160,200 330,70 470,200" fill={p().accent2} fill-opacity="0.35" />
      <polygon points="620,200 780,30 950,200" fill={p().accent2} fill-opacity="0.5" />
      <polygon points="820,200 940,90 1000,140 1000,200" fill={p().accent2} fill-opacity="0.3" />
    </svg>
  )

  const Header = () => (
    <header class="grid items-end" style={{ 'grid-template-columns': '1.2fr 1fr', gap: px(30) }}>
      <div>
        <Show when={props.doc.banner}>
          <p
            class="inline-block uppercase"
            style={{
              'font-family': FONT.heavy,
              'font-weight': 700,
              'font-size': px(20),
              border: `${px(3)} solid ${p().fg}`,
              padding: `${px(2)} ${px(12)}`,
              color: p().fg,
              'margin-bottom': px(10),
              'letter-spacing': '0.08em',
            }}
          >
            {props.doc.banner}
          </p>
        </Show>
        <Show when={titleParts()[0]}>
          <p style={{ 'font-family': FONT.script, 'font-style': 'italic', 'font-size': px(56), color: p().fg, 'line-height': 1 }}>{titleParts()[0]}</p>
        </Show>
        <h1 class="uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(titleParts()[1].length > 9 ? 84 : 112), color: p().fg, 'line-height': 1, 'letter-spacing': '0.04em' }}>
          {titleParts()[1]}
        </h1>
      </div>
      <div>
        <Show when={props.doc.subtitle}>
          <p class="uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 600, 'font-size': px(24), color: p().fg, 'letter-spacing': '0.1em' }}>
            {props.doc.subtitle}
          </p>
        </Show>
        <Show when={props.doc.intro}>
          <p style={{ 'font-family': FONT.mono, 'font-size': px(17), color: p().fg, opacity: 0.85, 'line-height': 1.45 }}>{props.doc.intro}</p>
        </Show>
      </div>
    </header>
  )

  const Decks = () => (
    <section class="flex items-center justify-between" style={{ gap: px(20) }}>
      <div class="flex items-center" style={{ gap: px(14) }}>
        <Turntable size={170 * s()} label="A" ink={p().fg} paper={p().accent} />
        <div style={{ 'font-family': FONT.heavy, color: p().fg }}>
          <p style={{ 'font-size': px(16), 'letter-spacing': '0.12em' }}>DECK A · ABRE</p>
          <p class="uppercase" style={{ 'font-weight': 700, 'font-size': px(28), 'line-height': 1.05, 'max-width': px(200) }}>
            {firstShow()?.artist || '—'}
          </p>
          <p style={{ 'font-size': px(18) }}>{dotDate(firstShow()?.date ?? '')}</p>
        </div>
      </div>
      <div class="flex flex-col items-center" style={{ gap: px(6) }}>
        <div
          class="flex items-center justify-center rounded-full"
          style={{ width: px(96), height: px(96), border: `${px(4)} solid ${p().fg}`, background: p().accent }}
        >
          <span style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(34), color: p().fg }}>MIX</span>
        </div>
        <div class="relative" style={{ width: px(130), height: px(14), background: p().fg, 'border-radius': px(7) }}>
          <div class="absolute" style={{ left: '50%', top: px(-8), width: px(14), height: px(30), 'margin-left': px(-7), background: p().accent, border: `${px(3)} solid ${p().fg}` }} />
        </div>
        <p class="uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(18), color: p().fg, 'letter-spacing': '0.12em' }}>
          {concerts().length} {concerts().length === 1 ? 'sesión' : 'sesiones'}
        </p>
      </div>
      <div class="flex items-center" style={{ gap: px(14), 'flex-direction': 'row-reverse' }}>
        <Turntable size={170 * s()} label="B" ink={p().fg} paper={p().accent} />
        <div class="text-right" style={{ 'font-family': FONT.heavy, color: p().fg }}>
          <p style={{ 'font-size': px(16), 'letter-spacing': '0.12em' }}>DECK B · CIERRA</p>
          <p class="uppercase" style={{ 'font-weight': 700, 'font-size': px(28), 'line-height': 1.05, 'max-width': px(200) }}>
            {(isCycle() ? lastShow()?.artist : venueName(firstShow() ?? ({} as never), props.doc.venue)) || '—'}
          </p>
          <p style={{ 'font-size': px(18) }}>{isCycle() ? dotDate(lastShow()?.date ?? '') : firstShow()?.time}</p>
        </div>
      </div>
    </section>
  )

  const Step = (c: TemplateProps['doc']['concerts'][number], n: number) => {
    const wd = () => (c.date ? weekdayIndex(c.date) : -1)
    return (
      <li class="flex items-center" style={{ gap: px(16 * k()) }}>
        <span
          class="flex shrink-0 items-center justify-center"
          style={{ width: px(52 * k()), height: px(52 * k()), background: p().accent2, color: '#fff', 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(30 * k()) }}
        >
          {n}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(28 * k()), color: p().fg, 'line-height': 1.1 }}>
            {c.artist || 'Artista'}
          </p>
          <p class="truncate" style={{ 'font-family': FONT.mono, 'font-size': px(15 * k()), color: p().fg, opacity: 0.8 }}>
            {[dotDate(c.date), venueName(c, props.doc.venue), c.time && `${c.time} h`, c.price].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div class="flex shrink-0" style={{ gap: px(4 * k()) }}>
          <Index each={WEEK}>
            {(d, i) => (
              <span class="flex flex-col items-center" style={{ gap: px(2) }}>
                <span style={{ 'font-family': FONT.mono, 'font-size': px(11 * k()), color: p().fg, opacity: 0.7 }}>{d()}</span>
                <span
                  style={{
                    width: px(9 * k()),
                    height: px(30 * k()),
                    background: i === wd() ? p().fg : 'transparent',
                    border: `${px(2)} solid ${p().fg}`,
                    opacity: i === wd() ? 1 : 0.45,
                  }}
                />
              </span>
            )}
          </Index>
        </div>
      </li>
    )
  }

  const Steps = () => (
    <section data-fit class="min-h-0 flex-1 overflow-hidden">
      <ol
        class="grid h-full content-around"
        style={{
          'grid-template-columns': twoCols() ? '1fr 1fr' : '1fr',
          'grid-template-rows': twoCols() ? `repeat(${Math.ceil(concerts().length / 2)}, auto)` : 'none',
          'grid-auto-flow': twoCols() ? 'column' : 'row',
          gap: `${px(10 * k())} ${px(36)}`,
        }}
      >
        <For each={concerts()}>{(c, i) => Step(c, i() + 1)}</For>
      </ol>
    </section>
  )

  const Footer = () => (
    <footer
      class="flex items-center justify-between"
      style={{ 'font-family': FONT.heavy, 'font-size': px(18), color: p().fg, border: `${px(3)} solid ${p().fg}`, padding: `${px(6)} ${px(16)}`, background: `${p().accent}cc` }}
    >
      <span style={{ 'font-weight': 700, 'letter-spacing': '0.1em' }}>{props.doc.ticketsUrl ? `ENTRADAS · ${props.doc.ticketsUrl}` : props.doc.footer}</span>
      <span>{[props.doc.ticketsUrl && props.doc.footer, props.doc.credit].filter(Boolean).join(' · ')}</span>
    </footer>
  )

  return (
    <div
      ref={frame}
      class="relative h-full w-full overflow-hidden"
      style={{ 'background-color': p().bg, 'background-image': `radial-gradient(ellipse at 30% 20%, #ffffff55, transparent 60%)` }}
    >
      <Mountains />
      <Mountains bottom />
      <div data-fit class="relative flex h-full flex-col overflow-hidden" style={{ padding: `${px(56)} ${px(48)} ${px(40)}`, gap: px(22) }}>
        <Header />
        <Decks />
        <div style={{ height: px(3), background: p().fg, opacity: 0.6 }} />
        <Steps />
        <Footer />
      </div>
    </div>
  )
}
