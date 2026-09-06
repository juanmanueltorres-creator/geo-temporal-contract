import type { TemporalValue } from './contract.ts'

export interface FormatTemporalOptions {
  locale?: string
  timeZone?: string
  timeZoneLabel?: string | null
  hour12?: boolean
}

function appendLabel(value: string, label: string | null | undefined): string {
  return label ? `${value} · ${label}` : value
}

function formatInstant(value: string, timeZone: string, options: FormatTemporalOptions): string {
  const date = new Date(value)
  const formatted = new Intl.DateTimeFormat(options.locale ?? 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: options.hour12,
    timeZone,
  }).format(date)
  return appendLabel(formatted, options.timeZoneLabel)
}

function formatDate(value: string, locale: string): string {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function formatYearMonth(value: string, locale: string): string {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

export function formatTemporal(temporal: TemporalValue, options: FormatTemporalOptions = {}): string {
  const locale = options.locale ?? 'en'

  if (temporal.kind === 'instant') {
    const timeZone = options.timeZone ?? temporal.displayTimeZone ?? temporal.sourceTimeZone ?? 'UTC'
    return formatInstant(temporal.canonical, timeZone, options)
  }

  if (temporal.kind === 'date') {
    return formatDate(temporal.canonical, locale)
  }

  return formatYearMonth(temporal.canonical, locale)
}
