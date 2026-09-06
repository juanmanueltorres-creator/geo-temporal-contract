from __future__ import annotations

import re
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .contract import TemporalRole, TemporalValue, TimeZoneBasis

_RFC3339_WITH_ZONE = re.compile(r"(?:Z|[+-]\d{2}:\d{2})$", re.IGNORECASE)
_YEAR_MONTH = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def _validate_time_zone(value: str | None) -> None:
    if value is None:
        return
    try:
        ZoneInfo(value)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"Invalid IANA timezone: {value}") from exc


def _utc_millisecond_iso(value: datetime) -> str:
    utc = value.astimezone(timezone.utc)
    return utc.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def normalize_instant(
    value: str,
    *,
    role: TemporalRole,
    source_time_zone: str | None,
    time_zone_basis: TimeZoneBasis,
    display_time_zone: str | None,
    source_value: str | None = None,
    time_zone_note: str | None = None,
) -> TemporalValue:
    if not _RFC3339_WITH_ZONE.search(value):
        raise ValueError("Instant timestamp must include timezone information (Z or numeric offset)")

    candidate = value[:-1] + "+00:00" if value.upper().endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError as exc:
        raise ValueError("Instant timestamp must be a valid RFC 3339 date-time") from exc

    if parsed.tzinfo is None:
        raise ValueError("Instant timestamp must include timezone information")

    _validate_time_zone(source_time_zone)
    _validate_time_zone(display_time_zone)

    return TemporalValue(
        kind="instant",
        role=role,
        canonical=_utc_millisecond_iso(parsed),
        source_value=value if source_value is None else source_value,
        source_time_zone=source_time_zone,
        time_zone_basis=time_zone_basis,
        time_zone_note=time_zone_note,
        display_time_zone=display_time_zone,
    )


def normalize_date(
    value: str,
    *,
    role: TemporalRole,
    source_value: str | None = None,
    time_zone_note: str | None = None,
) -> TemporalValue:
    try:
        parsed = date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError("Calendar date must use valid YYYY-MM-DD") from exc

    if parsed.isoformat() != value:
        raise ValueError("Calendar date must use valid YYYY-MM-DD")

    return TemporalValue(
        kind="date",
        role=role,
        canonical=value,
        source_value=value if source_value is None else source_value,
        source_time_zone=None,
        time_zone_basis=None,
        time_zone_note=time_zone_note,
        display_time_zone=None,
    )


def normalize_year_month(
    value: str,
    *,
    role: TemporalRole,
    source_value: str | None = None,
    time_zone_note: str | None = None,
) -> TemporalValue:
    if not _YEAR_MONTH.fullmatch(value):
        raise ValueError("Calendar month must use YYYY-MM")

    return TemporalValue(
        kind="year-month",
        role=role,
        canonical=value,
        source_value=value if source_value is None else source_value,
        source_time_zone=None,
        time_zone_basis=None,
        time_zone_note=time_zone_note,
        display_time_zone=None,
    )
