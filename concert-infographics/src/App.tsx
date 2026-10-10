import { createSignal } from 'solid-js'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { exportPng } from './lib/export'
import { formatById } from './lib/formats'
import { doc, persistDoc } from './lib/store'

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function App() {
  persistDoc()
  let canvas!: HTMLDivElement
  const [busy, setBusy] = createSignal(false)

  const download = async () => {
    const f = formatById(doc.formatId)
    setBusy(true)
    try {
      await exportPng(canvas, f.width, f.height, `${slug(doc.title)}-${f.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div class="flex h-screen flex-col">
      <header class="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3">
        <h1 class="text-lg font-extrabold">
          Infografías <span class="text-orange-600">de conciertos</span>
        </h1>
        <button
          type="button"
          class="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={busy()}
          onClick={download}
        >
          {busy() ? 'Exportando…' : 'Descargar PNG'}
        </button>
      </header>
      <main class="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside class="overflow-y-auto border-neutral-200 bg-neutral-50 p-5 md:w-[420px] md:border-r">
          <Editor />
        </aside>
        <section class="min-h-[60vh] flex-1 p-6 md:min-h-0">
          <Preview ref={(el) => (canvas = el)} />
        </section>
      </main>
    </div>
  )
}
