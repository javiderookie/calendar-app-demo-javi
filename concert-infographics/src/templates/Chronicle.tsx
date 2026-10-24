import { For, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dotDate, sortByDate, yearOf } from '../lib/dates'
import { groupByVenue, venueName } from '../lib/groups'
import { createAutoFit } from '../lib/autofit'

// Chronicle style: brand pill, "THE HISTORY OF" stacked beside a huge last word on a
// colour block, a thick central spine with date boxes and alternating entries, and an
// icon legend (one badge per venue). Inspired by genre-history timelines.

const FONT = { heavy: '"Anton", sans-serif', sans: '"Oswald", sans-serif' }
const BADGE = ['#1f7a45', '#c0392b', '#d68910', '#2e86c1', '#7d3c98', '#117a65', '#a04000', '#566573', '#b03a2e']

export default function Chronicle(props: TemplateProps) {
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
  const badgeOf = (venue: string) => {
    const i = Math.max(0, venues().findIndex((v) => v.venue === venue))
    return { color: BADGE[i % BADGE.length], letter: venue.replace(/^(el|la|los|las)\s+/i, '').charAt(0).toUpperCase() }
  }
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)
  const titleParts = () => {
    const words = headline().trim().split(/\s+/)
    return words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : [props.doc.subtitle, words[0] ?? '']
  }
  const twoSided = () => !landscape()
  const k = () => Math.max(0.6, Math.min(1.2, (landscape() ? 5 : 9) / Math.max(concerts().length / (twoSided() ? 1 : 2), 1)))

  const Badge = (bp: { venue: string; size: number }) => (
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: px(bp.size),
        height: px(bp.size),
        background: badgeOf(bp.venue).color,
        color: '#fff',
        'font-family': FONT.heavy,
        'font-size': px(bp.size * 0.55),
        border: `${px(2)} solid ${p().bg}`,
        'box-shadow': `0 0 0 ${px(2)} ${badgeOf(bp.venue).color}`,
      }}
    >
      {badgeOf(bp.venue).letter}
    </span>
  )

  const Header = () => (
    <header class="flex flex-col" style={{ gap: px(14) }}>
      <Show when={props.doc.footer}>
        <p class="self-center uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(26), background: p().fg, color: p().bg, padding: `${px(2)} ${px(24)}`, 'border-radius': px(6) }}>
          {props.doc.footer}
        </p>
      </Show>
      <div class="flex items-stretch">
        <div class="flex flex-col justify-center text-right" style={{ 'padding-right': px(18), 'border-right': `${px(8)} solid ${p().accent}` }}>
          <p class="uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(46), color: p().fg, 'line-height': 1 }}>
            {titleParts()[0]}
          </p>
          <Show when={props.doc.subtitle && titleParts()[0] !== props.doc.subtitle}>
            <p class="uppercase" style={{ 'font-family': FONT.sans, 'font-size': px(22), color: p().fg, opacity: 0.7 }}>
              {props.doc.subtitle}
            </p>
          </Show>
        </div>
        <div class="min-w-0 flex-1" style={{ background: p().accent, padding: `${px(4)} ${px(24)}` }}>
          <h1 class="truncate uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(titleParts()[1].length > 9 ? 110 : 150), color: '#fff', 'line-height': 1.05 }}>
            {titleParts()[1]}
          </h1>
        </div>
      </div>
    </header>
  )

  const Entry = (c: TemplateProps['doc']['concerts'][number], side: 'left' | 'right') => {
    const venue = venueName(c, props.doc.venue)
    return (
      <div class="flex items-center" style={{ gap: px(12 * k()), 'flex-direction': side === 'left' ? 'row-reverse' : 'row' }}>
        <span
          class="shrink-0"
          style={{
            'font-family': FONT.heavy,
            'font-size': px(34 * k()),
            background: p().accent,
            color: '#fff',
            padding: `0 ${px(10 * k())}`,
            'line-height': 1.25,
          }}
        >
          {dotDate(c.date) || '--.--'}
        </span>
        <Show when={c.image}>
          <img src={c.image} alt="" class="shrink-0 object-cover" style={{ width: px(76 * k()), height: px(76 * k()), filter: 'grayscale(0.4)' }} />
        </Show>
        <div class="min-w-0" style={{ 'text-align': side === 'left' ? 'right' : 'left' }}>
          <p class="truncate uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(30 * k()), color: p().fg, 'line-height': 1.1 }}>
            {c.artist || 'Artista'}
          </p>
          <p
            class="flex items-center uppercase"
            style={{
              gap: px(6),
              'font-family': FONT.sans,
              'font-size': px(17 * k()),
              color: p().accent,
              'justify-content': side === 'left' ? 'flex-end' : 'flex-start',
            }}
          >
            <Badge venue={venue} size={22 * k()} />
            <span class="truncate">{[venue, c.time && `${c.time} h`, c.price].filter(Boolean).join(' · ')}</span>
          </p>
        </div>
      </div>
    )
  }

  const Spine = () => (
    <section data-fit class="relative min-h-0 flex-1 overflow-hidden">
      <div class="absolute top-0 bottom-0" style={{ left: '50%', width: px(10), 'margin-left': px(-5), background: p().accent }} />
      <ol class="relative flex h-full flex-col justify-around" style={{ gap: px(6 * k()), padding: `${px(8)} 0` }}>
        <Show
          when={twoSided()}
          fallback={
            <For each={Array.from({ length: Math.ceil(concerts().length / 2) }, (_, i) => i)}>
              {(row) => (
                <li class="grid items-center" style={{ 'grid-template-columns': '1fr 1fr', gap: px(40) }}>
                  <div class="min-w-0">{concerts()[row * 2] && Entry(concerts()[row * 2], 'left')}</div>
                  <div class="min-w-0">{concerts()[row * 2 + 1] && Entry(concerts()[row * 2 + 1], 'right')}</div>
                </li>
              )}
            </For>
          }
        >
          <For each={concerts()}>
            {(c, i) => (
              <li class="grid items-center" style={{ 'grid-template-columns': '1fr 1fr', gap: px(26) }}>
                <div class="min-w-0">{i() % 2 === 0 && Entry(c, 'left')}</div>
                <div class="min-w-0">{i() % 2 === 1 && Entry(c, 'right')}</div>
              </li>
            )}
          </For>
        </Show>
      </ol>
    </section>
  )

  const Legend = () => (
    <footer class="flex flex-col" style={{ gap: px(10) }}>
      <div class="flex flex-wrap items-center justify-center" style={{ gap: `${px(8)} ${px(20)}`, 'border-top': `${px(3)} solid ${p().fg}`, 'padding-top': px(10) }}>
        <span class="uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(22), color: p().fg }}>
          Leyenda
        </span>
        <For each={venues()}>
          {(v) => (
            <span class="flex items-center uppercase" style={{ gap: px(6), 'font-family': FONT.sans, 'font-size': px(17), color: p().fg }}>
              <Badge venue={v.venue} size={22} />
              {v.venue}
            </span>
          )}
        </For>
      </div>
      <p class="text-center uppercase" style={{ 'font-family': FONT.sans, 'font-size': px(17), color: p().fg, opacity: 0.75, 'letter-spacing': '0.06em' }}>
        {[props.doc.intro, props.doc.ticketsUrl && `Entradas · ${props.doc.ticketsUrl}`, props.doc.credit, yearOf(concerts()[0]?.date ?? '')]
          .filter(Boolean)
          .join('  ·  ')}
      </p>
    </footer>
  )

  return (
    <div
      ref={frame}
      class="h-full w-full overflow-hidden"
      style={{
        'background-color': p().bg,
        'background-image': `radial-gradient(${p().fg}14 ${px(1.4)}, transparent ${px(1.6)})`,
        'background-size': `${px(16)} ${px(16)}`,
        padding: px(40),
      }}
    >
      <div data-fit class="flex h-full flex-col overflow-hidden" style={{ gap: px(18) }}>
        <Header />
        <Show when={props.doc.banner}>
          <p class="text-center uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(28), color: p().accent }}>
            {props.doc.banner}
          </p>
        </Show>
        <Spine />
        <Legend />
      </div>
    </div>
  )
}
