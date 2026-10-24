const DAY = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
const MONTH = new Intl.DateTimeFormat('es-ES', { month: 'short' })

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export const dateParts = (iso: string) => {
  if (!iso) return { weekday: '', day: '', month: '' }
  const date = parse(iso)
  return {
    weekday: DAY.format(date).replace('.', ''),
    day: String(date.getDate()),
    month: MONTH.format(date).replace('.', ''),
  }
}

export const sortByDate = <T extends { date: string; time: string }>(items: T[]) =>
  [...items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

const LONG = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

export const longDate = (iso: string) => (iso ? LONG.format(parse(iso)) : '')

const pad = (n: number) => String(n).padStart(2, '0')

/** "07.03" style day.month label. */
export const dotDate = (iso: string) => {
  if (!iso) return ''
  const d = parse(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`
}

/** Whole days from the first to the last date, inclusive. */
export const spanDays = (isoDates: string[]) => {
  const dates = isoDates.filter(Boolean).sort()
  if (!dates.length) return 0
  return Math.round((parse(dates[dates.length - 1]).getTime() - parse(dates[0]).getTime()) / 86400000) + 1
}

/** Monday (ISO) of the week containing `iso`. */
export const weekStart = (iso: string) => {
  const d = parse(iso)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 0 = Monday … 6 = Sunday. */
export const weekdayIndex = (iso: string) => (parse(iso).getDay() + 6) % 7

const MONTH_LONG = new Intl.DateTimeFormat('es-ES', { month: 'long' })
export const monthName = (iso: string) => (iso ? MONTH_LONG.format(parse(iso)) : '')
export const yearOf = (iso: string) => (iso ? String(parse(iso).getFullYear()) : '')
