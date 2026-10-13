const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'MYR'

const moneyFormatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: CURRENCY,
})

/**
 * Money arrives from the API as decimal strings (e.g. "240.00"), never floats,
 * to match DecimalField on the backend. Format for display only.
 */
export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  return moneyFormatter.format(Number(value))
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** "2026-11-14" → "Sat 14 Nov 2026". Dates are parsed as local calendar days. */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(y, m - 1, d))
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Number of nights between two ISO dates. */
export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const [a, b] = [checkIn, checkOut].map((s) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  })
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

/** Today's date as YYYY-MM-DD in the browser's timezone. */
export function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function plural(count, word, pluralWord = `${word}s`) {
  return `${count} ${count === 1 ? word : pluralWord}`
}
