import json
from pathlib import Path

import jsonschema
import pytest

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "schema" / "temporal-envelope.schema.json"
FIXTURE_NAMES = ("inpres.json", "conae.json", "open-meteo.json")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_real_source_fixtures_validate_against_contract_schema():
    schema = load_json(SCHEMA_PATH)
    validator = jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker())

    for fixture_name in FIXTURE_NAMES:
        fixture = load_json(ROOT / "fixtures" / fixture_name)
        errors = list(validator.iter_errors(fixture))
        assert errors == [], f"{fixture_name}: {[error.message for error in errors]}"


def test_year_month_is_calendar_semantics_not_midnight_utc():
    schema = load_json(SCHEMA_PATH)
    validator = jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker())
    sample = {
        "schemaVersion": "0.1",
        "source": {"id": "cammesa-renewables", "provider": "CAMMESA"},
        "temporal": {
            "kind": "year-month",
            "role": "observation",
            "canonical": "2026-07-01T00:00:00Z",
            "sourceValue": "2026-07",
            "sourceTimeZone": None,
            "timeZoneBasis": None,
            "displayTimeZone": None,
        },
        "provenance": {"fetchedAt": "2026-09-05T08:19:03.548Z", "generatedAt": None},
    }

    with pytest.raises(jsonschema.ValidationError):
        validator.validate(sample)


def test_instant_fixture_canonicals_use_one_utc_representation():
    for fixture_name in FIXTURE_NAMES:
        fixture = load_json(ROOT / "fixtures" / fixture_name)
        canonical = fixture["temporal"]["canonical"]
        assert canonical.endswith(".000Z"), f"{fixture_name}: {canonical}"
