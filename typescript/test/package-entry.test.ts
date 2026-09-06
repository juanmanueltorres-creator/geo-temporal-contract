import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatTemporal,
  normalizeInstant,
} from '@juanmanueltorres/geo-temporal-contract'

test('package root exposes the public TypeScript temporal API', () => {
  const temporal = normalizeInstant('2026-09-05T23:00:00Z', {
    role: 'observation',
    sourceTimeZone: 'UTC',
    timeZoneBasis: 'declared',
    displayTimeZone: 'America/Argentina/Buenos_Aires',
  })

  assert.equal(temporal.canonical, '2026-09-05T23:00:00.000Z')
  assert.match(
    formatTemporal(temporal, {
      locale: 'es-AR',
      timeZoneLabel: 'hora ARG',
      hour12: false,
    }),
    /20:00.*hora ARG/,
  )
})
