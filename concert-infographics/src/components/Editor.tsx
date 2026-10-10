import { For, Show } from 'solid-js'
import { doc, newConcert, resetDoc, setDoc } from '../lib/store'
import { FORMATS } from '../lib/formats'
import { TEMPLATES, templateById } from '../templates'
import { fileToDataUrl } from '../lib/image'
import type { Concert, Infographic, Kind } from '../types'
import { Field, inputClass } from './Field'

type TextKey = 'title' | 'subtitle' | 'venue' | 'ticketsUrl' | 'footer' | 'credit'
type ConcertKey = Exclude<keyof Concert, 'id' | 'image'>

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

  const removeConcert = (id: string) => setDoc('concerts', (list) => list.filter((c) => c.id !== id))

  return (
    <div class="flex flex-col gap-6">
      <section class="flex flex-col gap-3">
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
        <div class="grid grid-cols-2 gap-3">
          <Field label="Plantilla">
            <select class={inputClass} value={doc.templateId} onChange={(e) => chooseTemplate(e.currentTarget.value)}>
              <For each={TEMPLATES}>{(t) => <option value={t.id}>{t.label}</option>}</For>
            </select>
          </Field>
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
        <h2 class="text-sm font-extrabold uppercase">Cabecera</h2>
        {text('title', doc.kind === 'cycle' ? 'Nombre del ciclo' : 'Título (si no hay artista)')}
        {text('subtitle', 'Subtítulo / antetítulo')}
        {text('venue', 'Sala / ciudad')}
        <div class="grid grid-cols-2 gap-3">
          {text('ticketsUrl', 'Entradas')}
          {text('footer', 'Pie / firma')}
        </div>
        {text('credit', 'Crédito (arriba)')}
      </section>

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
          <h2 class="text-sm font-extrabold uppercase">{doc.kind === 'cycle' ? 'Conciertos' : 'Concierto'}</h2>
          <Show when={doc.kind === 'cycle'}>
            <button
              type="button"
              class="rounded-md bg-neutral-900 px-3 py-1 text-sm font-semibold text-white"
              onClick={() => setDoc('concerts', doc.concerts.length, newConcert())}
            >
              + Añadir
            </button>
          </Show>
        </div>
        <For each={doc.kind === 'cycle' ? doc.concerts : doc.concerts.slice(0, 1)}>
          {(c, i) => (
            <div class="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-white p-3">
              {concertField(i(), 'artist', 'Artista')}
              {concertField(i(), 'venue', 'Sala (opcional)')}
              {concertField(i(), 'date', 'Fecha', 'date')}
              {concertField(i(), 'time', 'Hora', 'time')}
              {concertField(i(), 'price', 'Precio')}
              {concertField(i(), 'note', 'Nota')}
              <Field label="Foto / portada (opcional)" class="col-span-2">
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

      <button type="button" class="self-start text-xs text-neutral-500 underline" onClick={resetDoc}>
        Restablecer ejemplo
      </button>
    </div>
  )
}
