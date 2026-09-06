import test from 'node:test'
import assert from 'node:assert/strict'

import { formatTemporal } from '../src/display.ts'
import { normalizeDate, normalizeInstant, normalizeYearMonth } from '../src/normalize.ts'

test('formatTemporal renders instants in an explicit display timezone without changing the canonical instant', () => {
  const temporal = normalizeInstant('2026-09-05T23:00:00Z', {
    role: 'model-frame',
    sourceTimeZone: 'UTC',
    timeZoneBasis: 'declared',
    displayTimeZone: 'America/Argentina/Buenos_Aires',
  })

  const displayed = formatTemporal(temporal, {
    locale: 'es-AR',
    hour12: false,
    timeZoneLabel: 'hora ARG',
  })

  assert.match(displayed, /20:00/)
  assert.match(displayed, /hora ARG/)
  assert.equal(temporal.canonical, '2026-09-05T23:00:00.000Z')
})

test('formatTemporal never shifts a calendar date through the requested timezone', () => {
  const temporal = normalizeDate('2026-07-01', { role: 'observation' })
  const displayed = formatTemporal(temporal, {
    locale: 'es-AR',
    timeZone: 'America/Los_Angeles',
  })

  const lower = displayed.toLowerCase()
  assert.match(lower, /1/)
  assert.match(lower, /jul/)
  assert.match(lower, /2026/)
})

test('formatTemporal renders a year-month without inventing a day or hour', () => {
  const temporal = normalizeYearMonth('2026-07', { role: 'observation' })
  const displayed = formatTemporal(temporal, { locale: 'es-AR' })

  assert.match(displayed.toLowerCase(), /jul.*2026/)
  assert.doesNotMatch(displayed, /00:00/)
})
