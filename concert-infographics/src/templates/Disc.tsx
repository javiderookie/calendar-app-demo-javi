import { For, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dateParts, sortByDate, spanDays } from '../lib/dates'
import { groupByMonth, groupByVenue, venueName } from '../lib/groups'
import { fmtWhen, infoTypeOf, noun } from '../lib/infoTypes'
import { createAutoFit } from '../lib/autofit'

// Band-profile style: black header strip, a giant record whose rim carries every date
// with callouts around it, a venue donut, key figures and a month timeline band.
// Inspired by music-history infographics built around a vinyl.

const FONT = { heavy: '"Anton", sans-serif', sans: '"Oswald", sans-serif' }

export default function Disc(props: TemplateProps) {
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
  const months = () => groupByMonth(concerts())
  const sliceColors = () => [p().accent, p().fg, p().accent2, '#e7c9a9', '#5a5a5a', '#7a1020', '#b5b5b5', '#a8743f', '#2f2f2f']
  const cfg = () => infoTypeOf(props.doc)
  const byGroupTitle = () => (cfg().group ? `${cfg().item.many} por ${cfg().group!.one}` : '')
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)

  const Header = () => (
    <header class="grid items-center" style={{ 'grid-template-columns': 'auto 1fr', gap: px(32), background: p().fg, padding: `${px(18)} ${px(44)}` }}>
      <div>
        <Show when={props.doc.subtitle}>
          <p style={{ 'font-family': FONT.sans, 'font-weight': 600, 'font-size': px(30), color: p().bg, 'line-height': 1 }}>{props.doc.subtitle}</p>
        </Show>
        <h1 style={{ 'font-family': FONT.heavy, 'font-size': px(headline().length > 12 ? 84 : 116), color: p().bg, 'line-height': 1, 'white-space': 'nowrap' }}>
          {headline()}
        </h1>
      </div>
      <Show when={props.doc.intro}>
        <p style={{ 'font-family': FONT.sans, 'font-size': px(21), color: p().bg, opacity: 0.9, 'line-height': 1.35 }}>{props.doc.intro}</p>
      </Show>
    </header>
  )

  // The record and its callouts live in one SVG so they scale together.
  const Record = () => {
    const W = 1000
    const H = 860
    const cx = W / 2
    const cy = H / 2
    const R = 270
    const n = () => Math.max(concerts().length, 1)
    const items = () =>
      concerts().map((c, i) => {
        const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n()
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        const side: 'start' | 'middle' | 'end' = Math.abs(cos) < 0.28 ? 'middle' : cos > 0 ? 'start' : 'end'
        return { c, i, cos, sin, side }
      })
    const fitLen = (text: string, size: number, max: number) => (text.length * size * 0.46 > max ? max : undefined)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} class="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="disc-label">
            <circle cx={cx} cy={cy} r={R * 0.42} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="#111" />
        <For each={[0.95, 0.88, 0.81, 0.74, 0.67, 0.6, 0.53]}>
          {(f) => <circle cx={cx} cy={cy} r={R * f} fill="none" stroke="#ffffff" stroke-opacity="0.09" stroke-width="2" />}
        </For>
        <path d={`M ${cx - R * 0.8} ${cy - R * 0.55} A ${R} ${R} 0 0 1 ${cx + R * 0.2} ${cy - R * 0.95}`} fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="18" />
        <g clip-path="url(#disc-label)">
          <circle cx={cx} cy={cy} r={R * 0.42} fill={p().accent} />
          <rect x={cx - R} y={cy - 16} width={R * 2} height={32} fill={p().bg} transform={`rotate(-28 ${cx} ${cy})`} />
          <rect x={cx - R} y={cy + 34} width={R * 2} height={12} fill={p().bg} transform={`rotate(-28 ${cx} ${cy})`} />
        </g>
        <text
          x={cx}
          y={cy - 34}
          text-anchor="middle"
          font-family={FONT.heavy}
          font-size={String(Math.min(54, 520 / Math.max(headline().length, 4)))}
          fill="#ffffff"
          transform={`rotate(-28 ${cx} ${cy})`}
        >
          {headline().toUpperCase()}
        </text>
        <circle cx={cx} cy={cy} r="9" fill={p().bg} />
        <For each={items()}>
          {(it) => {
            const rim = () => [cx + it.cos * R * 0.86, cy + it.sin * R * 0.86]
            const out1 = () => [cx + it.cos * (R + 8), cy + it.sin * (R + 8)]
            const out2 = () => [cx + it.cos * (R + 44), cy + it.sin * (R + 44)]
            const tx = () => out2()[0] + (it.side === 'start' ? 10 : it.side === 'end' ? -10 : 0)
            const ty = () => out2()[1] + (it.side === 'middle' ? (it.sin < 0 ? -40 : 30) : -6)
            const room = () => (it.side === 'middle' ? 320 : Math.max(120, it.side === 'start' ? W - tx() - 6 : tx() - 6))
            const meta = () => [venueName(it.c, props.doc.venue), it.c.time && `${it.c.time} h`].filter(Boolean).join(' · ')
            return (
              <g>
                <text x={rim()[0]} y={rim()[1] + 7} text-anchor="middle" font-family={FONT.sans} font-weight="600" font-size="20" fill="#ffffff">
                  {fmtWhen(props.doc, it.c, it.i)}
                </text>
                <line x1={out1()[0]} y1={out1()[1]} x2={out2()[0]} y2={out2()[1]} stroke={p().accent} stroke-width="3" />
                <circle cx={out1()[0]} cy={out1()[1]} r="5" fill={p().accent} />
                <text
                  x={tx()}
                  y={ty()}
                  text-anchor={it.side}
                  font-family={FONT.heavy}
                  font-size="30"
                  fill={p().fg}
                  textLength={fitLen(it.c.artist || 'Artista', 30, room())}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {(it.c.artist || 'Artista').toUpperCase()}
                </text>
                <text
                  x={tx()}
                  y={ty() + 26}
                  text-anchor={it.side}
                  font-family={FONT.sans}
                  font-size="21"
                  fill={p().fg}
                  fill-opacity="0.75"
                  textLength={fitLen(meta(), 21, room())}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {meta()}
                </text>
              </g>
            )
          }}
        </For>
      </svg>
    )
  }

  const Donut = () => {
    // Only entries that belong to a group count, so slices always add up to 100%.
    const total = () => venues().reduce((sum, v) => sum + v.items.length, 0) || 1
    const arcs = () => {
      let acc = 0
      return venues().map((v, i) => {
        const a0 = (acc / total()) * Math.PI * 2 - Math.PI / 2
        acc += v.items.length
        const a1 = (acc / total()) * Math.PI * 2 - Math.PI / 2
        return { ...v, a0, a1, color: sliceColors()[i % sliceColors().length] }
      })
    }
    const arc = (a0: number, a1: number) => {
      const r = 46
      const large = a1 - a0 > Math.PI ? 1 : 0
      if (a1 - a0 >= Math.PI * 2 - 1e-6) return `M50 4 A46 46 0 1 1 49.99 4 Z`
      return `M50 50 L${50 + r * Math.cos(a0)} ${50 + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${50 + r * Math.cos(a1)} ${50 + r * Math.sin(a1)} Z`
    }
    return (
      <div class="flex items-center" style={{ gap: px(22) }}>
        <svg viewBox="0 0 100 100" style={{ width: px(190), height: px(190), 'flex-shrink': 0 }}>
          <For each={arcs()}>{(a) => <path d={arc(a.a0, a.a1)} fill={a.color} stroke={p().bg} stroke-width="1.2" />}</For>
          <circle cx="50" cy="50" r="20" fill={p().bg} />
          <text x="50" y="56" text-anchor="middle" font-family={FONT.heavy} font-size="17" fill={p().fg}>
            {concerts().length}
          </text>
        </svg>
        <ul class="flex min-w-0 flex-col" style={{ gap: px(3), 'font-family': FONT.sans, 'font-size': px(19), color: p().fg }}>
          <For each={arcs()}>
            {(a) => (
              <li class="flex items-center" style={{ gap: px(8) }}>
                <span class="inline-block shrink-0" style={{ width: px(14), height: px(14), background: a.color }} />
                <span class="truncate">{a.venue}</span>
                <span style={{ 'font-weight': 600, 'margin-left': 'auto', 'padding-left': px(8) }}>{Math.round((a.items.length / total()) * 100)}%</span>
              </li>
            )}
          </For>
        </ul>
      </div>
    )
  }

  const SectionTitle = (t: { children: string }) => (
    <h2 style={{ 'font-family': FONT.heavy, 'font-size': px(38), color: p().accent, 'line-height': 1.1, 'margin-bottom': px(8) }}>{t.children}</h2>
  )

  const Figures = () => (
    <div class="flex flex-col" style={{ gap: px(6) }}>
      <For
        each={[
          [String(concerts().length), noun(cfg().item, concerts().length)],
          ...(cfg().group ? [[String(venues().length), noun(cfg().group!, venues().length)]] : []),
          ...(cfg().dateMode === 'day' && spanDays(concerts().map((c) => c.date)) > 1 ? [[String(spanDays(concerts().map((c) => c.date))), 'días']] : []),
          ...(props.doc.highlight.big ? [[props.doc.highlight.big, props.doc.highlight.text]] : []),
        ]}
      >
        {([v, l]) => (
          <p class="flex items-baseline" style={{ gap: px(10), color: p().fg }}>
            <span style={{ 'font-family': FONT.heavy, 'font-size': px(48), color: p().accent, 'line-height': 1 }}>{v}</span>
            <span style={{ 'font-family': FONT.sans, 'font-size': px(22), 'text-transform': 'uppercase' }}>{l}</span>
          </p>
        )}
      </For>
    </div>
  )

  const Timeline = () => (
    <Show when={months().length}>
      <section>
        <div class="relative flex items-center" style={{ height: px(46) }}>
          <div class="absolute left-0 right-0" style={{ top: '50%', height: px(6), background: p().fg }} />
          <div
            class="absolute"
            style={{ right: px(-4), top: '50%', transform: 'translateY(-50%)', 'border-left': `${px(22)} solid ${p().fg}`, 'border-top': `${px(14)} solid transparent`, 'border-bottom': `${px(14)} solid transparent` }}
          />
          <Show when={props.doc.banner}>
            <span
              class="relative mx-auto uppercase"
              style={{ 'font-family': FONT.heavy, 'font-size': px(30), background: p().fg, color: p().bg, padding: `${px(2)} ${px(26)}`, 'border-radius': px(8) }}
            >
              {props.doc.banner}
            </span>
          </Show>
        </div>
        <div class="grid" style={{ 'grid-template-columns': `repeat(${months().length}, minmax(0, 1fr))`, gap: px(14), 'margin-top': px(10) }}>
          <For each={months()}>
            {(m) => (
              <div class="min-w-0">
                <p
                  class="inline-block uppercase"
                  style={{ 'font-family': FONT.heavy, 'font-size': px(30), background: p().accent, color: '#fff', padding: `0 ${px(14)}`, 'margin-bottom': px(6) }}
                >
                  {m.label} {m.year}
                </p>
                <For each={m.items}>
                  {(c) => (
                    <p class="truncate" style={{ 'font-family': FONT.sans, 'font-size': px(19), color: p().fg, 'line-height': 1.3 }}>
                      <b>{dateParts(c.date).day}</b> {c.artist}
                    </p>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </section>
    </Show>
  )

  const Footer = () => (
    <footer class="flex justify-between" style={{ 'font-family': FONT.sans, 'font-size': px(16), color: p().fg, opacity: 0.75 }}>
      <span>{props.doc.ticketsUrl ? `Entradas: ${props.doc.ticketsUrl}` : props.doc.footer}</span>
      <span>{[props.doc.ticketsUrl && props.doc.footer, props.doc.credit].filter(Boolean).join(' · ')}</span>
    </footer>
  )

  return (
    <div ref={frame} class="flex h-full w-full flex-col overflow-hidden" style={{ 'background-color': p().bg }}>
      <Header />
      <Show
        when={landscape()}
        fallback={
          <div data-fit class="flex min-h-0 flex-1 flex-col overflow-hidden" style={{ padding: `${px(18)} ${px(44)} ${px(24)}`, gap: px(18) }}>
            <div class="relative min-h-0 flex-1">
              <div class="absolute inset-0">
                <Record />
              </div>
            </div>
            <div class="grid" style={{ 'grid-template-columns': '0.8fr 1.2fr', gap: px(30) }}>
              <div>
                <SectionTitle>En cifras</SectionTitle>
                <Figures />
              </div>
              <Show when={cfg().group}>
                <div>
                  <SectionTitle>{byGroupTitle().charAt(0).toUpperCase() + byGroupTitle().slice(1)}</SectionTitle>
                  <Donut />
                </div>
              </Show>
            </div>
            <Show when={cfg().dateMode === 'day'}>
              <Timeline />
            </Show>
            <Footer />
          </div>
        }
      >
        <div data-fit class="grid min-h-0 flex-1 overflow-hidden" style={{ 'grid-template-columns': '1.15fr 0.85fr', padding: `${px(18)} ${px(44)} ${px(22)}`, gap: px(30) }}>
          <div class="relative min-h-0">
            <div class="absolute inset-0">
              <Record />
            </div>
          </div>
          <div class="flex min-h-0 flex-col justify-center" style={{ gap: px(18) }}>
            <Show when={cfg().group}>
              <div>
                <SectionTitle>{byGroupTitle().charAt(0).toUpperCase() + byGroupTitle().slice(1)}</SectionTitle>
                <Donut />
              </div>
            </Show>
            <div>
              <SectionTitle>En cifras</SectionTitle>
              <Figures />
            </div>
            <Footer />
          </div>
        </div>
      </Show>
    </div>
  )
}
