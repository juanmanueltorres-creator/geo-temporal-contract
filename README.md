# geo-temporal-contract

A small cross-language contract for **what time means in a data source**: instant vs calendar period, source timezone evidence, provenance, display timezone, freshness, and clock-skew visibility.

The project grew out of a practical problem in Pulso Público: INPRES, CONAE, Open-Meteo, national indicators, UI formatting, and browser-local time were all capable of representing different clocks in different ways. The same class of problem exists in GeoPlatform across weather, Sentinel/GEE products, reports, caches, and field workflows.

## Design principle

```text
source value
    ↓
semantic classification
    ↓
canonical value + timezone evidence + provenance
    ↓
consumer-specific display

UTC is storage/transport for real instants.
UTC is NOT a substitute for calendar semantics.
```

## What v0.1 contains

- JSON Schema 2020-12 contract.
- TypeScript reference implementation for React/Vite consumers.
- Python 3.11+ stdlib reference implementation for FastAPI/data-pipeline consumers.
- Realistic source fixtures for INPRES, CONAE, and Open-Meteo/ECMWF.
- Explicit freshness states including `future` to expose clock skew.
- No microservice, database, scheduler, or mandatory geospatial dependency.

## Repository layout

```text
schema/                       canonical JSON contract
fixtures/                     source examples

typescript/src/               TS normalization/display/freshness
python/geo_temporal_contract/ Python normalization/display/freshness

docs/CONTRACT.md              semantics and evidence rules
```

## TypeScript

```ts
import { formatTemporal, normalizeInstant } from './typescript/src/index.ts'

const frame = normalizeInstant('2026-09-05T23:00:00Z', {
  role: 'model-frame',
  sourceTimeZone: 'UTC',
  timeZoneBasis: 'declared',
  displayTimeZone: 'America/Argentina/Buenos_Aires',
})

formatTemporal(frame, {
  locale: 'es-AR',
  hour12: false,
  timeZoneLabel: 'hora ARG',
})
// e.g. "5 sept 2026, 20:00 · hora ARG"
```

Calendar periods do not go through a timezone:

```ts
import { normalizeYearMonth } from './typescript/src/index.ts'

normalizeYearMonth('2026-07', { role: 'observation' }).canonical
// "2026-07"
```

## Python

```python
from geo_temporal_contract import format_temporal, normalize_instant

frame = normalize_instant(
    "2026-09-05T23:00:00Z",
    role="model-frame",
    source_time_zone="UTC",
    time_zone_basis="declared",
    display_time_zone="America/Argentina/Buenos_Aires",
)

format_temporal(frame, time_zone_label="hora ARG")
# "2026-09-05 20:00 · hora ARG"
```

Install the Python package from a checkout:

```bash
python -m pip install -e .
```

## Pulso Público integration target

The first consumer should replace component-local time formatters with the TypeScript core while preserving existing JSON/API contracts. The migration should distinguish:

- event/model instants → normalize + display in explicit Argentina timezone;
- monthly/date indicators → calendar semantics, no artificial hour;
- `fetchedAt` / `generatedAt` → provenance clocks;
- freshness → separate policy calculation.

CONAE remains explicitly `assumed` until the source provides stronger timezone evidence.

## GeoPlatform integration target

GeoPlatform can consume the same contract on both sides of its stack:

- **FastAPI/Python:** normalize external-service and pipeline timestamps at adapter boundaries; keep UTC instants and provenance explicit.
- **React/TypeScript:** replace ad-hoc `Date(...).toLocaleString(...)` calls with one presentation policy.
- **Field workflows:** separate `captured`, `received`, and `synced` clocks instead of collapsing them into one `updated_at` concept.
- **AOI/project display:** derive an IANA zone from authoritative project configuration or a coordinate resolver and mark the basis as `derived`.

This is the foundation for a later **World / Data Clock** view that can show source event time, model frame, fetch time, age, freshness, and timezone evidence side by side.

## Verification

```bash
npm test
pytest
```

The core intentionally has no runtime dependency on Temporal, Moment, Luxon, a timezone polygon database, or a web service in v0.1.

## Scope boundary

This library normalizes and explains temporal semantics. It does **not** synchronize the host operating-system clock. Infrastructure clock synchronization belongs to NTP/chrony or the hosting platform.
