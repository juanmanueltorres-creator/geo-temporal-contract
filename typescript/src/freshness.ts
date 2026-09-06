import type { TemporalEnvelope } from './contract.ts'

export type FreshnessState = 'fresh' | 'stale' | 'future' | 'unknown'

export interface FreshnessResult {
  state: FreshnessState
  ageMinutes: number | null
}

export function freshnessState(envelope: TemporalEnvelope, now = new Date()): FreshnessResult {
  const policy = envelope.freshness
  if (!policy) return { state: 'unknown', ageMinutes: null }

  const reference = envelope.provenance[policy.reference]
  if (!reference) return { state: 'unknown', ageMinutes: null }

  const referenceMs = Date.parse(reference)
  if (!Number.isFinite(referenceMs) || Number.isNaN(now.getTime())) {
    return { state: 'unknown', ageMinutes: null }
  }

  const ageMinutes = (now.getTime() - referenceMs) / 60_000
  if (ageMinutes < 0) return { state: 'future', ageMinutes }
  if (ageMinutes >= policy.staleAfterMinutes) return { state: 'stale', ageMinutes }
  return { state: 'fresh', ageMinutes }
}
