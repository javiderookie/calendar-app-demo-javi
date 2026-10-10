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
