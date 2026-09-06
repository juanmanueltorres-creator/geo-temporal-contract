from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .contract import TemporalValue


def _parse_canonical_instant(value: str) -> datetime:
    candidate = value[:-1] + "+00:00" if value.endswith("Z") else value
    parsed = datetime.fromisoformat(candidate)
    if parsed.tzinfo is None:
        raise ValueError("Canonical instant must include timezone information")
    return parsed


def format_temporal(
    temporal: TemporalValue,
    *,
    time_zone: str | None = None,
    time_zone_label: str | None = None,
) -> str:
    if temporal.kind != "instant":
        return temporal.canonical

    target = time_zone or temporal.display_time_zone or temporal.source_time_zone or "UTC"
    try:
        zone = ZoneInfo(target)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"Invalid IANA timezone: {target}") from exc

    displayed = _parse_canonical_instant(temporal.canonical).astimezone(zone).strftime("%Y-%m-%d %H:%M")
    return f"{displayed} · {time_zone_label}" if time_zone_label else displayed
