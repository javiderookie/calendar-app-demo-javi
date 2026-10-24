import { For, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dateParts, dotDate, monthName, sortByDate, spanDays, yearOf } from '../lib/dates'
import { groupByVenue, groupByWeek, plural, venueName } from '../lib/groups'
import { createAutoFit } from '../lib/autofit'

// Tour-history style: two-tone title, duotone photo row, a striped central axis with
// one bubble per week (area ∝ shows that week), alternating labels, and a big total
// circle with satellite figures. Inspired by band touring-history infographics.

const FONT = { heavy: '"Oswald", sans-serif', body: '"Inter", sans-serif' }

export default function Bubbles(props: TemplateProps) {
  const p = () => props.doc.palette
  const landscape = () => props.format.width > props.format.height
  let frame!: HTMLDivElement
  const fit = createAutoFit(() => frame, () => [JSON.stringify(props.doc), props.format.id])
  const s = () =>
    (landscape() ? Math.min(props.format.width / 1920, props.format.height / 1000) : Math.min(props.format.width / 1080, props.format.height / 1500)) *
    fit()
  const px = (n: number) => `${n * s()}px`

  const isCycle = () => props.doc.kind === 'cycle'
  const concerts = () => (isCycle() ? sortByDate(props.doc.concerts) : props.doc.concerts.slice(0, 1))
  const weeks = () => groupByWeek(concerts())
  const maxWeek = () => Math.max(1, ...weeks().map((w) => w.items.length))
  const venues = () => groupByVenue(concerts(), props.doc.venue)
  const days = () => spanDays(concerts().map((c) => c.date))
  const photos = () => concerts().filter((c) => c.image).slice(0, 5)
  const headline = () => (isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title)
  const subtitleParts = () => {
    const words = props.doc.subtitle.trim().split(/\s+/)
    return words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : ['', props.doc.subtitle]
  }
  const first = () => concerts().find((c) => c.date)?.date ?? ''
  const last = () => [...concerts()].reverse().find((c) => c.date)?.date ?? ''
  const edgeLabel = (iso: string) => (iso ? `${monthName(iso).slice(0, 3)} ${yearOf(iso)}`.toUpperCase() : '')
  // Bubble diameter: area grows with the number of shows that week.
  const diameter = (count: number) => (52 + 70 * Math.sqrt((count - 1) / Math.max(maxWeek() - 1, 1))) * s()

  const Header = () => (
    <header class="text-center">
      <h1 class="uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(headline().length > 16 ? 92 : 124), color: p().accent, 'line-height': 1 }}>
        {headline()}
      </h1>
      <Show when={props.doc.subtitle}>
        <p class="uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 600, 'font-size': px(46), color: p().fg, 'line-height': 1.1 }}>
          {subtitleParts()[0]} <span style={{ color: p().accent }}>{subtitleParts()[1]}</span>
        </p>
      </Show>
    </header>
  )

  const Photos = () => (
    <Show when={photos().length}>
      <div class="flex justify-center" style={{ 'margin-top': px(-6) }}>
        <For each={photos()}>
          {(c, i) => (
            <div
              class="relative overflow-hidden rounded-full"
              style={{ width: px(170), height: px(170), 'margin-left': i() ? px(-22) : '0', border: `${px(5)} solid ${p().bg}` }}
            >
              <img src={c.image} alt="" class="h-full w-full object-cover" style={{ filter: 'grayscale(1) contrast(1.2)' }} />
              <div class="absolute inset-0" style={{ background: p().fg, 'mix-blend-mode': 'screen', opacity: 0.55 }} />
            </div>
          )}
        </For>
      </div>
    </Show>
  )

  const Axis = () => (
    <section data-fit class="relative min-h-0 flex-1 overflow-hidden">
      <div
        class="absolute top-0 bottom-0"
        style={{
          left: '39%',
          right: '39%',
          background: `repeating-linear-gradient(to bottom, ${p().accent2}22 0, ${p().accent2}22 ${px(26)}, ${p().accent2}38 ${px(26)}, ${p().accent2}38 ${px(52)})`,
        }}
      />
      <div class="absolute top-0 bottom-0" style={{ left: '50%', width: px(3), 'margin-left': px(-1.5), background: p().accent2 }} />
      <div class="relative flex h-full flex-col" style={{ padding: `${px(4)} 0` }}>
        <p class="text-center" style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(48), color: p().accent2, opacity: 0.55, 'line-height': 1.25 }}>
          {edgeLabel(first())}
        </p>
        <ol class="flex flex-1 flex-col justify-around" style={{ gap: px(6), padding: `${px(10)} 0` }}>
          <For each={weeks()}>
            {(w, i) => {
              const left = () => i() % 2 === 0
              const d = () => diameter(w.items.length)
              return (
                <li class="grid items-center" style={{ 'grid-template-columns': '1fr auto 1fr', gap: px(26) }}>
                  <div class="min-w-0" classList={{ 'text-right': true }} style={{ visibility: left() ? 'visible' : 'hidden' }}>
                    <Label items={w.items} start={w.start} align="right" />
                  </div>
                  <div class="flex items-center justify-center" style={{ width: px(130) }}>
                    <div
                      class="flex flex-col items-center justify-center rounded-full text-center leading-none"
                      style={{ width: `${d()}px`, height: `${d()}px`, background: p().fg, color: '#fff', border: `${px(3)} solid ${p().bg}` }}
                    >
                      <span style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': `${d() * 0.42}px` }}>{w.items.length}</span>
                      <Show when={w.items.length === maxWeek() && maxWeek() > 1}>
                        <span style={{ 'font-family': FONT.heavy, 'font-size': `${d() * 0.15}px` }}>SHOWS</span>
                      </Show>
                    </div>
                  </div>
                  <div class="min-w-0" style={{ visibility: left() ? 'hidden' : 'visible' }}>
                    <Label items={w.items} start={w.start} align="left" />
                  </div>
                </li>
              )
            }}
          </For>
        </ol>
        <p class="text-center" style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(48), color: p().accent2, opacity: 0.55, 'line-height': 1.25 }}>
          {edgeLabel(last())}
        </p>
      </div>
    </section>
  )

  const Label = (lp: { items: TemplateProps['doc']['concerts']; start: string; align: 'left' | 'right' }) => (
    <div style={{ 'text-align': lp.align }}>
      <p class="uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(20), color: p().fg, 'letter-spacing': '0.04em' }}>
        Semana del {dateParts(lp.start).day} {dateParts(lp.start).month}
      </p>
      <For each={lp.items}>
        {(c) => (
          <p class="truncate" style={{ 'font-family': FONT.body, 'font-size': px(17), color: '#444', 'line-height': 1.35 }}>
            <b style={{ color: p().accent }}>{dotDate(c.date)}</b> {c.artist} · {venueName(c, props.doc.venue)}
          </p>
        )}
      </For>
    </div>
  )

  const Totals = () => (
    <section class="flex items-center justify-center" style={{ gap: px(28) }}>
      <Satellite value={String(venues().length)} label={plural(venues().length, 'sala')} side="left" />
      <div
        class="flex flex-col items-center justify-center rounded-full text-center leading-none"
        style={{ width: px(250), height: px(250), background: p().accent, color: '#fff' }}
      >
        <span style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(110) }}>{concerts().length}</span>
        <span style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(40) }}>{plural(concerts().length, 'CONCIERTO')}</span>
      </div>
      <Satellite value={days() > 1 ? String(days()) : String(weeks().length)} label={days() > 1 ? 'días' : plural(weeks().length, 'semana')} side="right" />
    </section>
  )

  const Satellite = (sp: { value: string; label: string; side: 'left' | 'right' }) => (
    <div class="flex items-center" style={{ gap: px(12), 'flex-direction': sp.side === 'left' ? 'row-reverse' : 'row' }}>
      <div class="flex items-center justify-center rounded-full" style={{ width: px(72), height: px(72), background: p().fg, color: '#fff' }}>
        <span style={{ 'font-family': FONT.heavy, 'font-weight': 700, 'font-size': px(34) }}>{sp.value}</span>
      </div>
      <span class="uppercase" style={{ 'font-family': FONT.heavy, 'font-weight': 600, 'font-size': px(24), color: p().fg }}>
        {sp.label}
      </span>
    </div>
  )

  const Footer = () => (
    <footer class="flex justify-between uppercase" style={{ 'font-family': FONT.heavy, 'font-size': px(18), color: p().fg, 'letter-spacing': '0.06em' }}>
      <span style={{ 'font-weight': 700 }}>{props.doc.footer}</span>
      <span style={{ opacity: 0.7 }}>{[props.doc.ticketsUrl && `Entradas · ${props.doc.ticketsUrl}`, props.doc.credit].filter(Boolean).join('  ·  ')}</span>
    </footer>
  )

  return (
    <div ref={frame} class="h-full w-full overflow-hidden" style={{ 'background-color': p().bg, padding: px(44) }}>
      <Show
        when={landscape()}
        fallback={
          <div data-fit class="flex h-full flex-col overflow-hidden" style={{ gap: px(20) }}>
            <Header />
            <Photos />
            <Axis />
            <Totals />
            <Footer />
          </div>
        }
      >
        <div class="grid h-full" style={{ 'grid-template-columns': '0.85fr 1.15fr', gap: px(40) }}>
          <div data-fit class="flex flex-col justify-center overflow-hidden" style={{ gap: px(28) }}>
            <Header />
            <Photos />
            <Totals />
            <Footer />
          </div>
          <div class="flex min-h-0 flex-col">
            <Axis />
          </div>
        </div>
      </Show>
    </div>
  )
}
