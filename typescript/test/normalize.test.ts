import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeDate, normalizeInstant, normalizeYearMonth } from '../src/normalize.ts'

test('normalizeInstant converts an offset timestamp to a UTC canonical instant', () => {
  const value = normalizeInstant('2026-08-30T10:30:50-03:00', {
    role: 'observation',
    sourceTimeZone: 'America/Argentina/Buenos_Aires',
    timeZoneBasis: 'inferred',
    displayTimeZone: 'America/Argentina/Buenos_Aires',
  })

  assert.equal(value.kind, 'instant')
  assert.equal(value.canonical, '2026-08-30T13:30:50.000Z')
  assert.equal(value.sourceValue, '2026-08-30T10:30:50-03:00')
})

test('normalizeInstant rejects timestamps without timezone information', () => {
  assert.throws(
    () => normalizeInstant('2026-09-05T23:00:00', {
      role: 'observation',
      sourceTimeZone: null,
      timeZoneBasis: 'unknown',
      displayTimeZone: null,
    }),
    /timezone/i,
  )
})

test('normalizeDate preserves calendar semantics without timezone conversion', () => {
  const value = normalizeDate('2026-07-01', { role: 'observation' })
  assert.deepEqual(value, {
    kind: 'date',
    role: 'observation',
    canonical: '2026-07-01',
    sourceValue: '2026-07-01',
    sourceTimeZone: null,
    timeZoneBasis: null,
    timeZoneNote: null,
    displayTimeZone: null,
  })
})

test('normalizeYearMonth rejects fake midnight timestamps', () => {
  assert.throws(
    () => normalizeYearMonth('2026-07-01T00:00:00Z', { role: 'observation' }),
    /YYYY-MM/,
  )
})
