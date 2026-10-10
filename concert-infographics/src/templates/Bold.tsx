import { For, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dateParts, sortByDate } from '../lib/dates'

// Poster-style template: huge display title, date blocks in the accent color.
export default function Bold(props: TemplateProps) {
  const scale = () => Math.min(props.format.width, props.format.height) / 1080
  const concerts = () => sortByDate(props.doc.concerts)
  const isCycle = () => props.doc.kind === 'cycle'

  return (
    <div
      class="flex h-full w-full flex-col"
      style={{
        background: props.doc.palette.bg,
        color: props.doc.palette.fg,
        padding: `${72 * scale()}px`,
        gap: `${40 * scale()}px`,
      }}
    >
      <header>
        <Show when={props.doc.subtitle}>
          <p
            class="font-semibold uppercase tracking-[0.3em]"
            style={{ color: props.doc.palette.accent, 'font-size': `${28 * scale()}px` }}
          >
            {props.doc.subtitle}
          </p>
        </Show>
        <h1
          class="leading-[0.85]"
          style={{ 'font-family': '"Bebas Neue", sans-serif', 'font-size': `${180 * scale()}px` }}
        >
          {isCycle() ? props.doc.title : concerts()[0]?.artist || props.doc.title}
        </h1>
        <Show when={props.doc.venue}>
          <p style={{ 'font-size': `${32 * scale()}px`, opacity: 0.8 }}>{props.doc.venue}</p>
        </Show>
      </header>

      <ul class="flex flex-1 flex-col justify-center" style={{ gap: `${20 * scale()}px` }}>
        <For each={isCycle() ? concerts() : concerts().slice(0, 1)}>
          {(c) => {
            const d = () => dateParts(c.date)
            return (
              <li class="flex items-center" style={{ gap: `${28 * scale()}px` }}>
                <div
                  class="flex shrink-0 flex-col items-center justify-center font-extrabold uppercase leading-none"
                  style={{
                    background: props.doc.palette.accent,
                    color: props.doc.palette.bg,
                    width: `${120 * scale()}px`,
                    height: `${120 * scale()}px`,
                    'font-size': `${22 * scale()}px`,
                  }}
                >
                  <span>{d().weekday}</span>
                  <span style={{ 'font-size': `${52 * scale()}px` }}>{d().day}</span>
                  <span>{d().month}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-extrabold" style={{ 'font-size': `${44 * scale()}px` }}>
                    {c.artist || 'Artista'}
                  </p>
                  <p style={{ 'font-size': `${26 * scale()}px`, opacity: 0.75 }}>
                    {[c.time && `${c.time} h`, c.venue, c.price, c.note].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </li>
            )
          }}
        </For>
      </ul>

      <footer
        class="flex items-end justify-between border-t font-semibold"
        style={{
          'border-color': props.doc.palette.fg,
          'padding-top': `${24 * scale()}px`,
          'font-size': `${24 * scale()}px`,
        }}
      >
        <span>{props.doc.ticketsUrl && `Entradas: ${props.doc.ticketsUrl}`}</span>
        <span style={{ color: props.doc.palette.accent }}>{props.doc.footer}</span>
      </footer>
    </div>
  )
}
