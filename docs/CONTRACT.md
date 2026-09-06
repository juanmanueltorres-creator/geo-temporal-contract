# Geo Temporal Contract v0.1

## Why this exists

Public, scientific, operational, and geospatial sources often expose values that *look* like timestamps but do not mean the same thing. A model frame, a monthly indicator, a satellite acquisition, a field check-in, and the time when an API was fetched are different temporal facts.

This contract keeps those meanings explicit before a UI converts anything for a human reader.

## Core rule

**Canonicalization is not presentation.**

- Real instants are normalized to one UTC representation: `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Calendar dates stay `YYYY-MM-DD`.
- Calendar months stay `YYYY-MM`.
- A display timezone is applied only to real instants.
- The raw source value is retained so normalization remains auditable.

This prevents a monthly value such as `2026-07` from becoming a fake `2026-07-01T00:00:00Z` event that can shift to the previous day when displayed in another timezone.

## Temporal kinds

### `instant`

A real point on the global timeline. The input must include a UTC marker (`Z`) or a numeric offset such as `-03:00`.

Examples: earthquake occurrence, thermal anomaly acquisition, model frame, field check-in, fetch timestamp.

### `date`

A calendar date whose meaning is the date itself. No timezone conversion is allowed.

Examples: a publication day or reporting day when no clock time is claimed.

### `year-month`

A calendar month. No day or hour is invented.

Examples: monthly CAMMESA generation or monthly INPI filings.

## Roles

`role` answers *what the temporal value means*:

- `observation`
- `model-frame`
- `publication`
- `snapshot`
- `fetch`
- `generation`

`kind` and `role` are deliberately separate. An observation can be an instant, date, or month depending on the source.

## Timezone evidence

When an instant is interpreted in a timezone, `timeZoneBasis` records the strength of that interpretation:

| Basis | Meaning |
| --- | --- |
| `declared` | The source or request explicitly identifies the timezone. |
| `derived` | The timezone is deterministically derived from trusted metadata, such as an authoritative project setting or coordinate-to-IANA lookup. |
| `inferred` | The interpretation follows source context or an existing adapter but stronger explicit evidence is still desirable. |
| `assumed` | The source is ambiguous and the adapter makes a documented operational assumption. |
| `unknown` | No defensible timezone interpretation is available. |

Calendar-only values use `null` because timezone interpretation does not apply to them.

## Envelope

```json
{
  "schemaVersion": "0.1",
  "source": {
    "id": "open-meteo-ecmwf",
    "provider": "Open-Meteo",
    "dataset": "ECMWF IFS HRES 9 km"
  },
  "temporal": {
    "kind": "instant",
    "role": "model-frame",
    "canonical": "2026-09-05T23:00:00.000Z",
    "sourceValue": "2026-09-05T23:00",
    "sourceTimeZone": "UTC",
    "timeZoneBasis": "declared",
    "timeZoneNote": "The request explicitly asks for timezone=UTC.",
    "displayTimeZone": "America/Argentina/Buenos_Aires"
  },
  "provenance": {
    "fetchedAt": "2026-09-05T23:31:00Z",
    "generatedAt": "2026-09-05T23:31:00Z"
  },
  "freshness": {
    "staleAfterMinutes": 480,
    "reference": "fetchedAt"
  }
}
```

## Freshness is separate from event time

`freshness` measures the age of a selected provenance clock (`fetchedAt` or `generatedAt`). It does not change the time of the underlying event or model frame.

The reference implementations expose four states:

- `fresh`
- `stale`
- `future` — useful for surfacing clock skew instead of hiding it
- `unknown`

## v0.1 source profiles

### INPRES

- Kind: `instant`
- Role: `observation`
- Adapter behavior: source table interpreted as Argentina local time and normalized to UTC.
- Current evidence basis: `inferred` until stronger explicit source documentation is verified.

### CONAE thermal hotspots

- Kind: `instant`
- Role: `observation`
- Current Pulso behavior: ambiguous public timestamps are interpreted as UTC.
- Evidence basis: `assumed`.
- The limitation must remain visible; the contract does not promote this assumption to verified fact.

### Open-Meteo / ECMWF

- Kind: `instant`
- Role: `model-frame`
- The request explicitly uses `timezone=UTC` before normalization.
- Evidence basis: `declared`.

## Geospatial timezone derivation

Coordinate-to-IANA lookup is intentionally outside the dependency-free v0.1 core. GeoPlatform can add an adapter around a dedicated resolver such as `timezonefinder` and record that result as `timeZoneBasis: "derived"`.

Keeping the resolver outside the contract avoids coupling the temporal model to a specific polygon dataset or lookup implementation.
