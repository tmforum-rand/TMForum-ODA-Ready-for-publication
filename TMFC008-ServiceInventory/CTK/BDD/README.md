# TMFC008 - Service Inventory: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC008 |
| Component Name | ServiceInventory |
| Version | 1.3.0 |
| Functional Block | Production |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | API Name | Resource | operationId |
|--------|----------|----------|-------------|
| TMF638 | service-inventory-management-api | service | createService |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF633 | service-catalog-management-api | serviceSpecification | serviceCatalog |

Optional dependent APIs skipped (required: false): TMF669, TMF639, TMF638 (self-reference), TMF673, TMF674, TMF675, TMF641, TMF632.

## BDD Pattern

TMFC005 — single mandatory dependent API (TMF633) with one mandatory exposed API (TMF638), yielding 2 scenario rows (success and failure).

## Payload Files

### Base Payload (Dependent API Stub)

| File | API | Resource | Schema |
|------|-----|----------|--------|
| `payloads/service-catalog-0001.json` | TMF633 | serviceSpecification | ServiceSpecification_Create |

### Target Payloads (Exposed API — TMF638)

| File | Scenario | serviceSpecification.id |
|------|----------|-------------------------|
| `payloads/service-target-0001.json` | success | `__VALID_ID__` |
| `payloads/service-target-0002.json` | failure | `non-existent-id` |

## Generated Scenarios

1. Valid serviceSpecification reference in TMF638 `service` (TMF633 stub returns 200)
2. Invalid serviceSpecification reference in TMF638 `service` (TMF633 stub returns 404)

## Dependent Resource Mapping

### TMF633 → TMF638 (service)

| Field | Value |
|-------|-------|
| Dependent resource | `serviceSpecification` |
| resourceFieldPath | `serviceSpecification` |
| Injection | `_.set(payload, 'serviceSpecification.id', validId)` |
| Schema | `Service_Create.serviceSpecification` = `ServiceSpecificationRef` (requires `id`) |

## Cross-Version Field Notes

### TMF638 `Service_FVO` vs `Service_Create` (v5 vs v4)

| Field | v5.0.0 (`Service_FVO`) | v4.0.0 (`Service_Create`) | Included |
|-------|------------------------|---------------------------|---------|
| `@type` | Yes (via `Entity_FVO` → `Extensible_FVO`) | No | Yes: `"Service"` |
| `state` | Yes | Yes | Yes: `"active"` |
| `serviceSpecification` | Yes | Yes | Yes |
| `serviceSpecification.@type` | Yes (via `ServiceSpecificationRef_FVO` → `Extensible_FVO`) | No | Yes: `"ServiceSpecificationRef"` |
| `serviceSpecification.id` | Yes | Yes | Yes (`__VALID_ID__` / `non-existent-id`) |

### TMF633 `ServiceSpecification_Create` (v4.0.0 only)

TMF633 is declared at v4.0.0 only. No `@type` discriminator is required.

| Field | Required | Included |
|-------|----------|---------|
| `name` | Yes | Yes |

## Operation Mapping

| Exposed API | Resource | operationId |
|-------------|----------|-------------|
| TMF638 | service | `createService` |

## Notes

The pre-existing `TMFC008_ServiceInventory.feature` file contained an error where `resourceType` was set to `serviceSpecification` instead of `service`. The canonical artifact is `TMFC008-DependentAPIInteraction.feature`.

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF638-v5.yaml` | Service Inventory Management | v5.0.0 | Local |
| `specs/TMF638-v4.json` | Service Inventory Management | v4.0.0 | Local |
| `specs/TMF633-v4.json` | Service Catalog Management | v4.0.0 | Local |
