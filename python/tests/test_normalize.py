import pytest

from geo_temporal_contract.normalize import normalize_date, normalize_instant, normalize_year_month


def test_normalize_instant_converts_offset_timestamp_to_utc_canonical():
    value = normalize_instant(
        "2026-08-30T10:30:50-03:00",
        role="observation",
        source_time_zone="America/Argentina/Buenos_Aires",
        time_zone_basis="inferred",
        display_time_zone="America/Argentina/Buenos_Aires",
    )

    assert value.kind == "instant"
    assert value.canonical == "2026-08-30T13:30:50.000Z"
    assert value.source_value == "2026-08-30T10:30:50-03:00"


def test_normalize_instant_rejects_timestamp_without_timezone_information():
    with pytest.raises(ValueError, match="timezone"):
        normalize_instant(
            "2026-09-05T23:00:00",
            role="observation",
            source_time_zone=None,
            time_zone_basis="unknown",
            display_time_zone=None,
        )


def test_normalize_date_preserves_calendar_semantics_without_timezone_conversion():
    value = normalize_date("2026-07-01", role="observation")
    assert value.kind == "date"
    assert value.canonical == "2026-07-01"
    assert value.source_time_zone is None
    assert value.time_zone_basis is None


def test_normalize_year_month_rejects_fake_midnight_timestamp():
    with pytest.raises(ValueError, match="YYYY-MM"):
        normalize_year_month("2026-07-01T00:00:00Z", role="observation")
