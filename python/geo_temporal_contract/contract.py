from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, TypeAlias

TemporalKind: TypeAlias = Literal["instant", "date", "year-month"]
TemporalRole: TypeAlias = Literal[
    "observation",
    "model-frame",
    "publication",
    "snapshot",
    "fetch",
    "generation",
]
TimeZoneBasis: TypeAlias = Literal["declared", "derived", "inferred", "assumed", "unknown"]
FreshnessReference: TypeAlias = Literal["fetchedAt", "generatedAt"]


@dataclass(frozen=True, slots=True)
class TemporalValue:
    kind: TemporalKind
    role: TemporalRole
    canonical: str
    source_value: str | None
    source_time_zone: str | None
    time_zone_basis: TimeZoneBasis | None
    time_zone_note: str | None
    display_time_zone: str | None


@dataclass(frozen=True, slots=True)
class SourceRef:
    id: str
    provider: str
    dataset: str | None = None
    url: str | None = None


@dataclass(frozen=True, slots=True)
class Provenance:
    fetched_at: str | None
    generated_at: str | None


@dataclass(frozen=True, slots=True)
class FreshnessPolicy:
    stale_after_minutes: float
    reference: FreshnessReference


@dataclass(frozen=True, slots=True)
class TemporalEnvelope:
    source: SourceRef
    temporal: TemporalValue
    provenance: Provenance
    freshness: FreshnessPolicy | None = None
    schema_version: Literal["0.1"] = "0.1"
