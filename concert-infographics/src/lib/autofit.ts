import { createEffect, createSignal, on, onMount } from 'solid-js'

/**
 * Returns a scale factor (≤ 1) that shrinks a template until none of the
 * elements marked with `data-fit` inside `frame()` clip their content.
 * Re-runs whenever `track()` changes and once web fonts are ready.
 */
export function createAutoFit(frame: () => HTMLElement | undefined, track: () => unknown) {
  const [fit, setFit] = createSignal(1)

  const overflows = () =>
    Array.from(frame()?.querySelectorAll<HTMLElement>('[data-fit]') ?? []).some(
      (el) => el.scrollHeight > el.clientHeight + 1,
    )

  // Binary search for the largest fit factor that leaves nothing clipped.
  const refit = () => {
    setFit(1)
    if (!overflows()) return
    let lo = 0.3
    let hi = 1
    for (let i = 0; i < 9; i++) {
      const mid = (lo + hi) / 2
      setFit(mid)
      if (overflows()) hi = mid
      else lo = mid
    }
    setFit(lo)
  }

  onMount(() => document.fonts.ready.then(refit))
  createEffect(on(track, () => queueMicrotask(refit), { defer: true }))

  return fit
}
