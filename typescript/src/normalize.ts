import type {
  DateTemporal,
  InstantTemporal,
  TemporalRole,
  TimeZoneBasis,
  YearMonthTemporal,
} from './contract.ts'

interface InstantMetadata {
  role: TemporalRole
  sourceValue?: string | null
  sourceTimeZone: string | null
  timeZoneBasis: TimeZoneBasis
  timeZoneNote?: string | null
  displayTimeZone: string | null
}

interface CalendarMetadata {
  role: TemporalRole
  sourceValue?: string | null
  timeZoneNote?: string | null
}

const RFC3339_WITH_ZONE = /(?:Z|[+-]\d{2}:\d{2})$/i
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

function assertValidTimeZone(value: string | null): void {
  if (value === null) return
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(new Date(0))
  } catch {
    throw new Error(`Invalid IANA timezone: ${value}`)
  }
}

export function normalizeInstant(value: string, metadata: InstantMetadata): InstantTemporal {
  if (!RFC3339_WITH_ZONE.test(value)) {
    throw new Error('Instant timestamp must include timezone information (Z or numeric offset)')
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Instant timestamp must be a valid RFC 3339 date-time')
  }

  assertValidTimeZone(metadata.sourceTimeZone)
  assertValidTimeZone(metadata.displayTimeZone)

  return {
    kind: 'instant',
    role: metadata.role,
    canonical: parsed.toISOString(),
    sourceValue: metadata.sourceValue ?? value,
    sourceTimeZone: metadata.sourceTimeZone,
    timeZoneBasis: metadata.timeZoneBasis,
    timeZoneNote: metadata.timeZoneNote ?? null,
    displayTimeZone: metadata.displayTimeZone,
  }
}

export function normalizeDate(value: string, metadata: CalendarMetadata): DateTemporal {
  if (!DATE_ONLY.test(value)) {
    throw new Error('Calendar date must use YYYY-MM-DD')
  }

  const [year, month, day] = value.split('-').map(Number)
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    throw new Error('Calendar date must be valid')
  }

  return {
    kind: 'date',
    role: metadata.role,
    canonical: value,
    sourceValue: metadata.sourceValue ?? value,
    sourceTimeZone: null,
    timeZoneBasis: null,
    timeZoneNote: metadata.timeZoneNote ?? null,
    displayTimeZone: null,
  }
}

export function normalizeYearMonth(value: string, metadata: CalendarMetadata): YearMonthTemporal {
  if (!YEAR_MONTH.test(value)) {
    throw new Error('Calendar month must use YYYY-MM')
  }

  return {
    kind: 'year-month',
    role: metadata.role,
    canonical: value,
    sourceValue: metadata.sourceValue ?? value,
    sourceTimeZone: null,
    timeZoneBasis: null,
    timeZoneNote: metadata.timeZoneNote ?? null,
    displayTimeZone: null,
  }
}
