from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal

from .contract import TemporalEnvelope

FreshnessState = Literal["fresh", "stale", "future", "unknown"]


@dataclass(frozen=True, slots=True)
class FreshnessResult:
    state: FreshnessState
    age_minutes: float | None


def _parse_instant(value: str) -> datetime | None:
    candidate = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None


def freshness_state(envelope: TemporalEnvelope, now: datetime) -> FreshnessResult:
    policy = envelope.freshness
    if policy is None or now.tzinfo is None:
        return FreshnessResult(state="unknown", age_minutes=None)

    reference = (
        envelope.provenance.fetched_at
        if policy.reference == "fetchedAt"
        else envelope.provenance.generated_at
    )
    if reference is None:
        return FreshnessResult(state="unknown", age_minutes=None)

    parsed = _parse_instant(reference)
    if parsed is None:
        return FreshnessResult(state="unknown", age_minutes=None)

    age_minutes = (now - parsed).total_seconds() / 60
    if age_minutes < 0:
        return FreshnessResult(state="future", age_minutes=age_minutes)
    if age_minutes >= policy.stale_after_minutes:
        return FreshnessResult(state="stale", age_minutes=age_minutes)
    return FreshnessResult(state="fresh", age_minutes=age_minutes)
