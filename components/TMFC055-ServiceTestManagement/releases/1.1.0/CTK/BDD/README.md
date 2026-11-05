# TMFC055 - Service Test Management: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC055 |
| Component Name | ServiceTestManagement |
| Version | 1.1.0 |
| Functional Block | Production |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | API Name | Resource | operationId |
|--------|----------|----------|-------------|
| TMF653 | service-test-management-api | serviceTest | createServiceTest |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF638 | service-inventory-management-api | service | serviceInventory |

Optional dependent APIs skipped (required: false): TMF632, TMF669, TMF633, TMF639, TMF701.

## BDD Pattern

TMFC005 — single mandatory dependent API (TMF638) with one mandatory exposed API (TMF653), yielding 2 scenario rows (success and failure).

`serviceTestSpecification` POST is not included because its dependency (`relatedServiceSpecification`) maps to TMF633 (service-catalog-management-api), which is `required: false`.

## Payload Files

### Base Payload (Dependent API Stub)

| File | API | Resource | Schema |
|------|-----|----------|--------|
| `payloads/service-inventory-0001.json` | TMF638 | service | Service_FVO / Service_Create |

### Target Payloads (Exposed API — TMF653)

| File | Scenario | relatedService.id |
|------|----------|-------------------|
| `payloads/service-test-target-0001.json` | success | `__VALID_ID__` |
| `payloads/service-test-target-0002.json` | failure | `non-existent-id` |

## Generated Scenarios

1. Valid service reference in TMF653 `serviceTest` (TMF638 service stub returns 200)
2. Invalid service reference in TMF653 `serviceTest` (TMF638 service stub returns 404)

## Dependent Resource Mapping

### TMF638 → TMF653 (serviceTest)

| Field | Value |
|-------|-------|
| Dependent resource | `service` |
| resourceFieldPath | `relatedService` |
| Injection | `_.set(payload, 'relatedService.id', validId)` |
| Schema | `ServiceTest_Create.relatedService` = `ServiceRef` (requires `id`) |

## Cross-Version Field Notes

### TMF653 `ServiceTest_Create` (v4.2.0 only)

TMF653 is declared at v4.2.0 only. No `@type` discriminator is required for `ServiceTest_Create`.

| Field | Required | Included |
|-------|----------|---------|
| `name` | Yes | Yes |
| `relatedService` | Yes | Yes |
| `relatedService.id` | Yes (via ServiceRef) | Yes (`__VALID_ID__` / `non-existent-id`) |
| `testSpecification` | Yes | Yes (hardcoded, see note below) |

**Note on `testSpecification` in target payloads:** `ServiceTest_Create.testSpecification` is required and references a `serviceTestSpecification` managed by the component under test (not a dependent API resource). The target payloads use a hardcoded `testSpecification.id = "test-service-test-spec-001"`. These scenarios are designed to verify that the component correctly validates `relatedService` against the TMF638 service stub. Implementations that strictly validate `testSpecification.id` at creation time may need a pre-existing `serviceTestSpecification` to be seeded before running these scenarios.

### TMF638 `Service_FVO` vs `Service_Create` (v5 vs v4)

| Field | v5.0.0 (`Service_FVO`) | v4.0.0 (`Service_Create`) | Included |
|-------|------------------------|---------------------------|---------|
| `@type` | Yes (via `Entity_FVO` → `Extensible_FVO`) | No | Yes: `"Service"` |
| `state` | Yes | Yes | Yes: `"active"` |
| `serviceSpecification` | Yes | Yes | Yes (hardcoded, see note below) |

**Note on `serviceSpecification` in base payload:** Both v4 and v5 `Service` schemas require `serviceSpecification`. Since TMF633 (service-catalog-management-api) is `required: false` for TMFC055, the base payload uses a hardcoded `serviceSpecification.id = "test-service-spec-001"`. The TMF638 stub does not enforce referential integrity of this field.

## Operation Mapping

| Exposed API | Resource | operationId |
|-------------|----------|-------------|
| TMF653 | serviceTest | `createServiceTest` |

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF653-v4.json` | Service Test Management | v4.2.0 | Local |
| `specs/TMF638-v5.yaml` | Service Inventory Management | v5.0.0 | Local |
| `specs/TMF638-v4.json` | Service Inventory Management | v4.0.0 | Local |
