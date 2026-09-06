from geo_temporal_contract.display import format_temporal
from geo_temporal_contract.normalize import normalize_date, normalize_instant, normalize_year_month


def test_format_temporal_renders_instant_in_explicit_display_timezone():
    temporal = normalize_instant(
        "2026-09-05T23:00:00Z",
        role="model-frame",
        source_time_zone="UTC",
        time_zone_basis="declared",
        display_time_zone="America/Argentina/Buenos_Aires",
    )

    assert format_temporal(temporal, time_zone_label="hora ARG") == "2026-09-05 20:00 · hora ARG"
    assert temporal.canonical == "2026-09-05T23:00:00.000Z"


def test_format_temporal_never_shifts_calendar_date_through_timezone():
    temporal = normalize_date("2026-07-01", role="observation")
    assert format_temporal(temporal, time_zone="America/Los_Angeles") == "2026-07-01"


def test_format_temporal_year_month_does_not_invent_day_or_hour():
    temporal = normalize_year_month("2026-07", role="observation")
    assert format_temporal(temporal) == "2026-07"
