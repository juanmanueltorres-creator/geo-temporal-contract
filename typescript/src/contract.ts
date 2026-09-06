export type TemporalKind = 'instant' | 'date' | 'year-month'

export type TemporalRole =
  | 'observation'
  | 'model-frame'
  | 'publication'
  | 'snapshot'
  | 'fetch'
  | 'generation'

export type TimeZoneBasis = 'declared' | 'derived' | 'inferred' | 'assumed' | 'unknown'

export interface InstantTemporal {
  kind: 'instant'
  role: TemporalRole
  canonical: string
  sourceValue: string | null
  sourceTimeZone: string | null
  timeZoneBasis: TimeZoneBasis
  timeZoneNote: string | null
  displayTimeZone: string | null
}

export interface DateTemporal {
  kind: 'date'
  role: TemporalRole
  canonical: string
  sourceValue: string | null
  sourceTimeZone: null
  timeZoneBasis: null
  timeZoneNote: string | null
  displayTimeZone: null
}

export interface YearMonthTemporal {
  kind: 'year-month'
  role: TemporalRole
  canonical: string
  sourceValue: string | null
  sourceTimeZone: null
  timeZoneBasis: null
  timeZoneNote: string | null
  displayTimeZone: null
}

export type TemporalValue = InstantTemporal | DateTemporal | YearMonthTemporal

export interface SourceRef {
  id: string
  provider: string
  dataset?: string | null
  url?: string | null
}

export interface Provenance {
  fetchedAt: string | null
  generatedAt: string | null
}

export interface FreshnessPolicy {
  staleAfterMinutes: number
  reference: 'fetchedAt' | 'generatedAt'
}

export interface TemporalEnvelope {
  schemaVersion: '0.1'
  source: SourceRef
  temporal: TemporalValue
  provenance: Provenance
  freshness?: FreshnessPolicy | null
}
