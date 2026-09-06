from datetime import datetime, timezone

from geo_temporal_contract.contract import FreshnessPolicy, Provenance, SourceRef, TemporalEnvelope
from geo_temporal_contract.freshness import freshness_state
from geo_temporal_contract.normalize import normalize_instant


def envelope() -> TemporalEnvelope:
    return TemporalEnvelope(
        source=SourceRef(id="open-meteo-ecmwf", provider="Open-Meteo"),
        temporal=normalize_instant(
            "2026-09-05T23:00:00Z",
            role="model-frame",
            source_time_zone="UTC",
            time_zone_basis="declared",
            display_time_zone="America/Argentina/Buenos_Aires",
        ),
        provenance=Provenance(
            fetched_at="2026-09-05T23:31:00.000Z",
            generated_at="2026-09-05T23:31:00.000Z",
        ),
        freshness=FreshnessPolicy(stale_after_minutes=60, reference="fetchedAt"),
    )


def test_freshness_state_marks_snapshot_stale_at_configured_boundary():
    now = datetime(2026, 9, 6, 0, 31, tzinfo=timezone.utc)
    result = freshness_state(envelope(), now)

    assert result.state == "stale"
    assert result.age_minutes == 60


def test_freshness_state_exposes_future_timestamp_as_clock_skew():
    now = datetime(2026, 9, 5, 23, 30, tzinfo=timezone.utc)
    result = freshness_state(envelope(), now)

    assert result.state == "future"
    assert result.age_minutes == -1


def test_freshness_state_is_unknown_without_reference_timestamp():
    value = envelope()
    value = TemporalEnvelope(
        source=value.source,
        temporal=value.temporal,
        provenance=Provenance(fetched_at=None, generated_at=value.provenance.generated_at),
        freshness=value.freshness,
    )

    result = freshness_state(value, datetime(2026, 9, 6, 0, 31, tzinfo=timezone.utc))
    assert result.state == "unknown"
    assert result.age_minutes is None
