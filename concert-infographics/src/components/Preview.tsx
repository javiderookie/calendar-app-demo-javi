import { createSignal, onCleanup, onMount } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { doc } from '../lib/store'
import { formatById } from '../lib/formats'
import { templateById } from '../templates'

// Renders the infographic at its real pixel size and scales it down to fit.
export default function Preview(props: { ref: (el: HTMLDivElement) => void }) {
  let container!: HTMLDivElement
  const [box, setBox] = createSignal({ w: 0, h: 0 })
  const format = () => formatById(doc.formatId)
  const scale = () => {
    const { w, h } = box()
    if (!w || !h) return 0.3
    return Math.min(w / format().width, h / format().height, 1)
  }

  onMount(() => {
    const ro = new ResizeObserver(([entry]) =>
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height }),
    )
    ro.observe(container)
    onCleanup(() => ro.disconnect())
  })

  return (
    <div ref={container} class="flex h-full w-full items-center justify-center overflow-hidden">
      <div style={{ width: `${format().width * scale()}px`, height: `${format().height * scale()}px` }}>
        <div
          ref={props.ref}
          class="origin-top-left shadow-2xl"
          style={{
            width: `${format().width}px`,
            height: `${format().height}px`,
            transform: `scale(${scale()})`,
          }}
        >
          <Dynamic component={templateById(doc.templateId).component} doc={doc} format={format()} />
        </div>
      </div>
    </div>
  )
}
