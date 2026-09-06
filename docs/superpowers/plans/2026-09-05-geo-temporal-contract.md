# Geo Temporal Contract v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small reusable temporal contract that distinguishes instants, calendar dates, year-month periods, timezone evidence, provenance, and freshness for Pulso Público and GeoPlatform.

**Architecture:** Keep the canonical contract language-neutral in JSON Schema, with dependency-light TypeScript and Python reference implementations. Store real source examples as fixtures. UTC/offset timestamps remain canonical instants; display timezone conversion happens only at presentation time, while calendar-only values are never shifted through a timezone.

**Tech Stack:** JSON Schema 2020-12, TypeScript on Node 22, Python 3.11+ stdlib (`datetime`, `zoneinfo`), Node test runner, pytest.

**Spec:** `docs/CONTRACT.md`

## Global Constraints

- No microservice in v0.1.
- No database dependency.
- No mutation of source timestamps without preserving source semantics.
- `instant` values require RFC 3339 timezone information (`Z` or numeric offset).
- `date` and `year-month` values are calendar semantics and must not be shifted through a timezone.
- Every timezone interpretation records a `timeZoneBasis`: `declared`, `derived`, `inferred`, `assumed`, or `unknown`.
- TypeScript and Python behavior must agree for the core fixtures.

---

### Task 1: Contract schema and fixtures

**Files:**
- Create: `schema/temporal-envelope.schema.json`
- Create: `fixtures/inpres.json`
- Create: `fixtures/conae.json`
- Create: `fixtures/open-meteo.json`
- Test: `python/tests/test_schema_fixtures.py`

**Interfaces:**
- Produces: JSON Schema v0.1 and three source fixtures consumed by both implementations.

- [ ] Write schema fixture tests first and confirm they fail because the schema/fixtures do not exist.
- [ ] Add the minimal schema and fixtures.
- [ ] Re-run the fixture tests and confirm they pass.

### Task 2: TypeScript core

**Files:**
- Create: `typescript/src/contract.ts`
- Create: `typescript/src/normalize.ts`
- Create: `typescript/src/display.ts`
- Create: `typescript/src/freshness.ts`
- Create: `typescript/src/index.ts`
- Test: `typescript/test/normalize.test.ts`
- Test: `typescript/test/display.test.ts`
- Test: `typescript/test/freshness.test.ts`

**Interfaces:**
- Produces: `normalizeInstant`, `normalizeDate`, `normalizeYearMonth`, `formatTemporal`, `freshnessState`.

- [ ] Add one failing behavior test at a time.
- [ ] Implement only enough production code to make each test pass.
- [ ] Run Node tests and TypeScript typecheck after each behavior group.

### Task 3: Python core

**Files:**
- Create: `python/geo_temporal_contract/contract.py`
- Create: `python/geo_temporal_contract/normalize.py`
- Create: `python/geo_temporal_contract/display.py`
- Create: `python/geo_temporal_contract/freshness.py`
- Create: `python/geo_temporal_contract/__init__.py`
- Test: `python/tests/test_normalize.py`
- Test: `python/tests/test_display.py`
- Test: `python/tests/test_freshness.py`

**Interfaces:**
- Produces: Python equivalents of the TypeScript core behavior.

- [ ] Add failing pytest behavior tests.
- [ ] Implement the minimum stdlib-only Python code.
- [ ] Run pytest after each behavior group.

### Task 4: Documentation and integration examples

**Files:**
- Create: `docs/CONTRACT.md`
- Create: `README.md`

**Interfaces:**
- Documents: Pulso Público mapping, GeoPlatform mapping, and source-time evidence rules.

- [ ] Document the semantic distinction between instant/date/year-month.
- [ ] Document CONAE as `assumed`, Open-Meteo as `declared`, and INPRES as `inferred` unless stronger source evidence is later verified.
- [ ] Add minimal TypeScript and Python usage examples.

### Task 5: Final verification

- [ ] Run `npm test`.
- [ ] Run `pytest`.
- [ ] Validate all fixtures against the JSON Schema.
- [ ] Inspect `git diff --check`.
- [ ] Ensure no secrets, credentials, or production URLs with tokens are present.
