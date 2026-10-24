import { For, Show, createSignal } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { doc } from '../lib/store'
import { formatById } from '../lib/formats'
import type { Template } from '../templates'

const THUMB_W = 170

/** Live miniature of a template with the current draft, rendered at full size and scaled down. */
function Thumb(props: { template: Template; selected: boolean; onPick: () => void }) {
  const format = () => formatById(doc.formatId)
  const scale = () => THUMB_W / format().width
  return (
    <button
      type="button"
      class="flex flex-col gap-1.5 rounded-lg border bg-white p-1.5 text-left"
      classList={{ 'border-orange-600 ring-2 ring-orange-600/30': props.selected, 'border-neutral-200 hover:border-neutral-400': !props.selected }}
      onClick={props.onPick}
      title={props.template.label}
    >
      <div class="overflow-hidden rounded" style={{ width: `${THUMB_W}px`, height: `${format().height * scale()}px` }}>
        <div
          class="pointer-events-none origin-top-left"
          style={{ width: `${format().width}px`, height: `${format().height}px`, transform: `scale(${scale()})` }}
          aria-hidden="true"
        >
          {/* Thumbnails use the template's own palette so each one shows its real look. */}
          <Dynamic component={props.template.component} doc={{ ...doc, palette: props.template.palette }} format={format()} />
        </div>
      </div>
      <span class="px-0.5 text-xs font-semibold leading-tight" classList={{ 'text-orange-700': props.selected }}>
        {props.template.label}
      </span>
    </button>
  )
}

export default function TemplatePicker(props: { recommended: Template[]; others: Template[]; current: string; onPick: (id: string) => void }) {
  const [showAll, setShowAll] = createSignal(false)
  return (
    <div class="flex flex-col gap-2">
      <div class="grid grid-cols-2 gap-2">
        <For each={props.recommended}>
          {(t) => <Thumb template={t} selected={props.current === t.id} onPick={() => props.onPick(t.id)} />}
        </For>
      </div>
      <Show when={props.others.length}>
        <button type="button" class="self-start text-xs text-neutral-600 underline" onClick={() => setShowAll(!showAll())}>
          {showAll() ? 'Ocultar otras plantillas' : `Ver otras ${props.others.length} plantillas`}
        </button>
        <Show when={showAll()}>
          <div class="grid grid-cols-2 gap-2">
            <For each={props.others}>
              {(t) => <Thumb template={t} selected={props.current === t.id} onPick={() => props.onPick(t.id)} />}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
}
