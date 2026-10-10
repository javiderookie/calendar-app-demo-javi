import type { JSX } from 'solid-js'

export const inputClass =
  'w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm focus:border-neutral-900 focus:outline-none'

export function Field(props: { label: string; children: JSX.Element; class?: string }) {
  return (
    <label class={`flex flex-col gap-1 ${props.class ?? ''}`}>
      <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500">{props.label}</span>
      {props.children}
    </label>
  )
}
