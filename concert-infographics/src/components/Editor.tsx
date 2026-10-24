import { For, Show } from 'solid-js'
import { blankDoc, doc, loadPreset, newConcert, PRESETS, setDoc } from '../lib/store'
import { INFO_TYPES, infoTypeOf, type InfoType } from '../lib/infoTypes'
import { FORMATS } from '../lib/formats'
import { TEMPLATES, templateById } from '../templates'
import { fileToDataUrl } from '../lib/image'
import { findCovers } from '../lib/covers'
import { createSignal } from 'solid-js'
import type { Concert, Infographic, Kind } from '../types'
import { Field, inputClass } from './Field'
import TemplatePicker from './TemplatePicker'

type TextKey = 'title' | 'subtitle' | 'banner' | 'venue' | 'ticketsUrl' | 'footer' | 'credit'
type ConcertKey = Exclude<keyof Concert, 'id' | 'image' | 'pin'>

export default function Editor() {
  const text = (key: TextKey, label: string) => (
    <Field label={label}>
      <input class={inputClass} value={doc[key]} onInput={(e) => setDoc(key, e.currentTarget.value)} />
    </Field>
  )

  const concertField = (index: number, key: ConcertKey, label: string, type = 'text') => (
    <Field label={label}>
      <input
        class={inputClass}
        type={type}
        value={doc.concerts[index][key]}
        onInput={(e) => setDoc('concerts', index, key, e.currentTarget.value)}
      />
    </Field>
  )

  const chooseTemplate = (id: string) => {
    setDoc('templateId', id)
    setDoc('palette', { ...templateById(id).palette })
  }

  const setImage = async (index: number, file?: File) => {
    if (!file) return
    setDoc('concerts', index, 'image', await fileToDataUrl(file))
  }

  const cfg = () => infoTypeOf(doc)
  const hasCovers = () => doc.infoType === 'discography' || doc.infoType === 'album'
  const [coverStatus, setCoverStatus] = createSignal('')

  const searchCovers = async () => {
    if (!doc.title.trim()) return setCoverStatus('Escribe primero el grupo o artista en la cabecera.')
    const artist = doc.infoType === 'album' ? doc.subtitle.split('·')[0].trim() || doc.title : doc.title
    const entries =
      doc.infoType === 'album'
        ? [{ id: doc.concerts[0]?.id ?? '', title: doc.title }]
        : doc.concerts.filter((c) => !c.image).map((c) => ({ id: c.id, title: c.artist }))
    setCoverStatus('Buscando portadas…')
    try {
      const found = await findCovers(artist, entries)
      for (const [id, image] of Object.entries(found)) setDoc('concerts', (c) => c.id === id, 'image', image)
      const n = Object.keys(found).length
      setCoverStatus(n ? `Encontradas ${n} de ${entries.length}. Sube a mano las que falten.` : 'No he encontrado portadas; súbelas a mano.')
    } catch (err) {
      setCoverStatus(`No se pudo buscar (${(err as Error).message}). Súbelas a mano.`)
    }
  }

  const chooseType = (type: InfoType) => {
    const next = INFO_TYPES.find((t) => t.id === type)!
    setDoc('infoType', type)
    if (type !== 'cycle') setDoc('kind', 'cycle')
    if (!next.templates.includes(doc.templateId)) chooseTemplate(next.templates[0])
  }

  const startBlank = () => {
    if (confirm(`Empezar una ${cfg().label.toLowerCase()} en blanco? Se sustituye el borrador actual.`)) setDoc(blankDoc(doc.infoType))
  }

  const recommended = () => TEMPLATES.filter((t) => cfg().templates.includes(t.id)).sort((a, b) => cfg().templates.indexOf(a.id) - cfg().templates.indexOf(b.id))
  const others = () => TEMPLATES.filter((t) => !cfg().templates.includes(t.id))

  const removeConcert = (id: string) => setDoc('concerts', (list) => list.filter((c) => c.id !== id))

  return (
    <div class="flex flex-col gap-6">
      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-extrabold uppercase">1 · ¿Qué infografía quieres?</h2>
        <div class="grid grid-cols-2 gap-2">
          <For each={INFO_TYPES}>
            {(t) => (
              <button
                type="button"
                class="flex items-start gap-2 rounded-lg border bg-white p-2 text-left"
                classList={{ 'border-orange-600 ring-2 ring-orange-600/30': doc.infoType === t.id, 'border-neutral-200': doc.infoType !== t.id }}
                onClick={() => chooseType(t.id)}
              >
                <span class="text-xl leading-none">{t.icon}</span>
                <span>
                  <span class="block text-sm font-bold">{t.label}</span>
                  <span class="block text-xs text-neutral-500">{t.hint}</span>
                </span>
              </button>
            )}
          </For>
        </div>
        <button type="button" class="self-start text-xs text-neutral-600 underline" onClick={startBlank}>
          Empezar {cfg().label.toLowerCase()} en blanco
        </button>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-extrabold uppercase">2 · Diseño</h2>
        <Show when={doc.infoType === 'cycle'}>
        <div class="grid grid-cols-2 gap-1 rounded-lg bg-neutral-200 p-1 text-sm font-semibold">
          <For each={[['single', 'Concierto'], ['cycle', 'Ciclo'] ] as [Kind, string][]}>
            {([kind, label]) => (
              <button
                type="button"
                class="rounded-md py-1.5"
                classList={{ 'bg-white shadow': doc.kind === kind }}
                onClick={() => setDoc('kind', kind)}
              >
                {label}
              </button>
            )}
          </For>
        </div>
        </Show>
        <div class="grid grid-cols-2 gap-3">
          <Field label="Formato">
            <select
              class={inputClass}
              value={doc.formatId}
              onChange={(e) => setDoc('formatId', e.currentTarget.value as Infographic['formatId'])}
            >
              <For each={FORMATS}>{(f) => <option value={f.id}>{f.label}</option>}</For>
            </select>
          </Field>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Plantilla · elige una</span>
          <TemplatePicker recommended={recommended()} others={others()} current={doc.templateId} onPick={chooseTemplate} />
        </div>
        <div class="grid grid-cols-4 gap-3">
          <For each={[['bg', 'Fondo'], ['fg', 'Tinta'], ['accent', 'Acento'], ['accent2', 'Acento 2']] as const}>
            {([key, label]) => (
              <Field label={label}>
                <input
                  type="color"
                  class="h-9 w-full cursor-pointer rounded-md border border-neutral-300"
                  value={doc.palette[key]}
                  onInput={(e) => setDoc('palette', key, e.currentTarget.value)}
                />
              </Field>
            )}
          </For>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-extrabold uppercase">3 · Cabecera</h2>
        {text('title', doc.kind === 'single' ? 'Título (si no hay artista)' : cfg().subject)}
        {text('subtitle', `Subtítulo · ${cfg().subtitleHint}`)}
        {text('banner', 'Rótulo (p. ej. «Primer avance de cartel», «Pop, punk y mala leche»)')}
        {text('venue', doc.infoType === 'cycle' || doc.infoType === 'filmcycle' ? 'Sede / ciudad (separa etiquetas con «·»)' : 'Etiquetas (separa con «·»)')}
        <div class="grid grid-cols-2 gap-3">
          {text('ticketsUrl', 'Entradas')}
          {text('footer', 'Pie / firma')}
        </div>
        {text('credit', 'Crédito (arriba)')}
        <Field label="Logo (PNG con fondo transparente, opcional)">
          <div class="flex items-center gap-3">
            <Show when={doc.logo}>
              <img src={doc.logo} alt="" class="h-10 max-w-24 rounded bg-neutral-800 object-contain p-1" />
            </Show>
            <input
              type="file"
              accept="image/*"
              class="min-w-0 flex-1 text-xs"
              onChange={async (e) => {
                const file = e.currentTarget.files?.[0]
                if (file) setDoc('logo', await fileToDataUrl(file, 900, 'image/png'))
              }}
            />
            <Show when={doc.logo}>
              <button type="button" class="text-xs text-red-600" onClick={() => setDoc('logo', '')}>
                Quitar
              </button>
            </Show>
          </div>
        </Field>
      </section>

      <Show when={doc.templateId === 'map'}>
        <section class="flex flex-col gap-3">
          <h2 class="text-sm font-extrabold uppercase">Mapa</h2>
          <p class="text-xs text-neutral-500">
            Arrastra los pines en la vista previa para colocarlos. Los conciertos del mismo día comparten número y color.
          </p>
          <Field label="Imagen de mapa (opcional; si no, se usa el ilustrado)">
            <input
              type="file"
              accept="image/*"
              class="text-xs"
              onChange={async (e) => {
                const file = e.currentTarget.files?.[0]
                if (file) setDoc('mapImage', await fileToDataUrl(file, 1600))
              }}
            />
          </Field>
          <div class="flex gap-4 text-xs">
            <Show when={doc.mapImage}>
              <button type="button" class="text-red-600 underline" onClick={() => setDoc('mapImage', '')}>
                Quitar imagen de mapa
              </button>
            </Show>
            <button
              type="button"
              class="text-neutral-600 underline"
              onClick={() => setDoc('concerts', {}, 'pin', undefined)}
            >
              Recolocar pines automáticamente
            </button>
          </div>
        </section>
      </Show>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-extrabold uppercase">Datos destacados</h2>
        <div class="grid grid-cols-[90px_1fr] gap-3">
          <Field label="Cifra">
            <input class={inputClass} value={doc.highlight.big} onInput={(e) => setDoc('highlight', 'big', e.currentTarget.value)} />
          </Field>
          <Field label="Texto de la cifra">
            <input class={inputClass} value={doc.highlight.text} onInput={(e) => setDoc('highlight', 'text', e.currentTarget.value)} />
          </Field>
        </div>
        <Field label="Intro">
          <textarea class={inputClass} rows={3} value={doc.intro} onInput={(e) => setDoc('intro', e.currentTarget.value)} />
        </Field>
      </section>

      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-extrabold uppercase">4 · {doc.kind === 'cycle' ? cfg().listTitle : 'Concierto'}</h2>
          <Show when={hasCovers()}>
            <button type="button" class="rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm font-semibold" onClick={searchCovers}>
              Buscar portadas
            </button>
          </Show>
          <Show when={doc.kind === 'cycle'}>
            <button
              type="button"
              class="rounded-md bg-neutral-900 px-3 py-1 text-sm font-semibold text-white"
              onClick={() => setDoc('concerts', doc.concerts.length, newConcert({ time: '' }))}
            >
              + Añadir {cfg().item.one}
            </button>
          </Show>
        </div>
        <Show when={hasCovers() && coverStatus()}>
          <p class="text-xs text-neutral-600">{coverStatus()}</p>
        </Show>
        <For each={doc.kind === 'cycle' ? doc.concerts : doc.concerts.slice(0, 1)}>
          {(c, i) => (
            <div class="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-white p-3">
              {concertField(i(), 'artist', cfg().fields.artist)}
              <Show when={cfg().fields.venue}>{(label) => concertField(i(), 'venue', label())}</Show>
              <Show when={cfg().fields.date}>{(label) => concertField(i(), 'date', label(), 'date')}</Show>
              <Show when={cfg().fields.time}>{(label) => concertField(i(), 'time', label(), cfg().timeInput)}</Show>
              <Show when={cfg().fields.price}>{(label) => concertField(i(), 'price', label())}</Show>
              {concertField(i(), 'note', cfg().fields.note)}
              <Show when={doc.templateId === 'madrid'}>
                <div class="col-span-2">{concertField(i(), 'coords', 'Coordenadas (lat, lon) si la sala no se reconoce')}</div>
              </Show>
              <Field label={hasCovers() ? 'Portada' : 'Foto (opcional)'} class="col-span-2">
                <div class="flex items-center gap-3">
                  <Show when={c.image}>
                    <img src={c.image} alt="" class="h-10 w-10 rounded object-cover" />
                  </Show>
                  <input
                    type="file"
                    accept="image/*"
                    class="min-w-0 flex-1 text-xs"
                    onChange={(e) => setImage(i(), e.currentTarget.files?.[0])}
                  />
                  <Show when={c.image}>
                    <button type="button" class="text-xs text-red-600" onClick={() => setDoc('concerts', i(), 'image', '')}>
                      Quitar
                    </button>
                  </Show>
                </div>
              </Field>
              <Show when={doc.kind === 'cycle' && doc.concerts.length > 1}>
                <button type="button" class="col-span-2 text-left text-xs text-red-600" onClick={() => removeConcert(c.id)}>
                  Eliminar
                </button>
              </Show>
            </div>
          )}
        </For>
      </section>

      <section class="flex items-end gap-2 border-t border-neutral-200 pt-4">
        <Field label="Cargar ejemplo" class="flex-1">
          <select id="preset" class={inputClass}>
            <For each={PRESETS}>{(p) => <option value={p.id}>{p.label}</option>}</For>
          </select>
        </Field>
        <button
          type="button"
          class="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold"
          onClick={() => {
            const id = (document.getElementById('preset') as HTMLSelectElement).value
            if (confirm('Esto sustituye el borrador actual. ¿Continuar?')) loadPreset(id)
          }}
        >
          Cargar
        </button>
      </section>
    </div>
  )
}
