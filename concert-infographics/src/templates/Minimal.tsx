import { For, Show } from 'solid-js'
import type { TemplateProps } from '.'
import { dateParts, sortByDate } from '../lib/dates'

// Clean agenda-style template: light layout, thin rules, tabular dates.
export default function Minimal(props: TemplateProps) {
  const scale = () => Math.min(props.format.width, props.format.height) / 1080
  const concerts = () => sortByDate(props.doc.concerts)

  return (
    <div
      class="flex h-full w-full flex-col"
      style={{
        background: props.doc.palette.fg,
        color: props.doc.palette.bg,
        padding: `${80 * scale()}px`,
      }}
    >
      <div style={{ width: `${80 * scale()}px`, height: `${8 * scale()}px`, background: props.doc.palette.accent }} />
      <h1 class="font-extrabold leading-none" style={{ 'font-size': `${96 * scale()}px`, 'margin-top': `${32 * scale()}px` }}>
        {props.doc.title}
      </h1>
      <Show when={props.doc.subtitle || props.doc.venue}>
        <p style={{ 'font-size': `${30 * scale()}px`, opacity: 0.7, 'margin-top': `${16 * scale()}px` }}>
          {[props.doc.subtitle, props.doc.venue].filter(Boolean).join(' — ')}
        </p>
      </Show>

      <ul class="flex flex-1 flex-col justify-center">
        <For each={concerts()}>
          {(c) => {
            const d = () => dateParts(c.date)
            return (
              <li
                class="grid items-baseline border-b"
                style={{
                  'grid-template-columns': `${200 * scale()}px 1fr auto`,
                  'border-color': `${props.doc.palette.bg}33`,
                  padding: `${22 * scale()}px 0`,
                  'font-size': `${32 * scale()}px`,
                }}
              >
                <span class="font-semibold uppercase tabular-nums" style={{ color: props.doc.palette.accent }}>
                  {d().day} {d().month}
                </span>
                <span class="truncate font-extrabold">{c.artist || 'Artista'}</span>
                <span style={{ opacity: 0.7 }}>{[c.time, c.price].filter(Boolean).join(' · ')}</span>
              </li>
            )
          }}
        </For>
      </ul>

      <p class="font-semibold" style={{ 'font-size': `${24 * scale()}px` }}>
        {[props.doc.ticketsUrl, props.doc.footer].filter(Boolean).join('  ·  ')}
      </p>
    </div>
  )
}
