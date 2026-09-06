import test from 'node:test'
import assert from 'node:assert/strict'

import { freshnessState } from '../src/freshness.ts'
import type { TemporalEnvelope } from '../src/contract.ts'

function envelope(): TemporalEnvelope {
  return {
    schemaVersion: '0.1',
    source: { id: 'open-meteo-ecmwf', provider: 'Open-Meteo' },
    temporal: {
      kind: 'instant',
      role: 'model-frame',
      canonical: '2026-09-05T23:00:00.000Z',
      sourceValue: '2026-09-05T23:00',
      sourceTimeZone: 'UTC',
      timeZoneBasis: 'declared',
      timeZoneNote: null,
      displayTimeZone: 'America/Argentina/Buenos_Aires',
    },
    provenance: {
      fetchedAt: '2026-09-05T23:31:00.000Z',
      generatedAt: '2026-09-05T23:31:00.000Z',
    },
    freshness: {
      staleAfterMinutes: 60,
      reference: 'fetchedAt',
    },
  }
}

test('freshnessState marks the snapshot stale at the configured boundary', () => {
  const result = freshnessState(envelope(), new Date('2026-09-06T00:31:00.000Z'))

  assert.equal(result.state, 'stale')
  assert.equal(result.ageMinutes, 60)
})

test('freshnessState exposes future timestamps instead of hiding clock skew', () => {
  const result = freshnessState(envelope(), new Date('2026-09-05T23:30:00.000Z'))

  assert.equal(result.state, 'future')
  assert.equal(result.ageMinutes, -1)
})

test('freshnessState is unknown without a usable policy reference', () => {
  const value = envelope()
  value.provenance.fetchedAt = null

  assert.deepEqual(freshnessState(value, new Date('2026-09-06T00:31:00.000Z')), {
    state: 'unknown',
    ageMinutes: null,
  })
})
