const DATE_FORMAT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** Formats an ISO-8601 timestamp as e.g. "12 Oct 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : DATE_FORMAT.format(date)
}

/** Formats an ISO-8601 timestamp as e.g. "4:30 pm". */
export function formatTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : TIME_FORMAT.format(date)
}

/** Formats an ISO-8601 timestamp as e.g. "12 Oct 2026, 4:30 pm". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : `${DATE_FORMAT.format(date)}, ${TIME_FORMAT.format(date)}`
}
