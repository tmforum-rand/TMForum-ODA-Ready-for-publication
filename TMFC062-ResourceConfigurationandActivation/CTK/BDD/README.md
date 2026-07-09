# TMFC062 - Resource Configuration and Activation: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC062 |
| Component Name | ResourceConfigurationandActivation |
| Version | 1.1.0 |
| Functional Block | Production |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | API Name | Resource | operationId |
|--------|----------|----------|-------------|
| TMF702 | resource-activation-management-api | resource | createResource |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF634 | resource-catalog-management-api | resourceSpecification | resourceCatalog |
| TMF639 | resource-inventory-management-api | resource | resourceInventory |

Optional dependent APIs skipped: none declared beyond mandatory ones.

## BDD Pattern

TMFC007 — two mandatory dependent APIs (TMF634 and TMF639), both tested through the single exposed resource (`resource` POST in TMF702), yielding 4 scenario rows (2 per dependency × 2 success/failure).

## Payload Files

### Base Payloads (Dependent API Stubs)

| File | API | Resource | Schema |
|------|-----|----------|--------|
| `payloads/resource-catalog-0001.json` | TMF634 | resourceSpecification | ResourceSpecification_FVO / ResourceSpecification_Create |
| `payloads/resource-inventory-0001.json` | TMF639 | resource | Resource_Create |

### Target Payloads (Exposed API — TMF702)

| File | Scenario | Dependency Field | Value |
|------|----------|-----------------|-------|
| `payloads/resource-catalog-target-0001.json` | success | resourceSpecification.id | `__VALID_ID__` |
| `payloads/resource-catalog-target-0002.json` | failure | resourceSpecification.id | `non-existent-id` |
| `payloads/resource-inventory-target-0001.json` | success | resourceRelationship[0].resource.id | `__VALID_ID__` |
| `payloads/resource-inventory-target-0002.json` | failure | resourceRelationship[0].resource.id | `non-existent-id` |

## Generated Scenarios

1. Valid resourceSpecification reference in TMF702 `resource` (TMF634 stub returns 200)
2. Invalid resourceSpecification reference in TMF702 `resource` (TMF634 stub returns 404)
3. Valid resource reference in TMF702 `resource` (TMF639 stub returns 200)
4. Invalid resource reference in TMF702 `resource` (TMF639 stub returns 404)

## Dependent Resource Mapping

### TMF634 → TMF702 (resource)

| Field | Value |
|-------|-------|
| Dependent resource | `resourceSpecification` |
| resourceFieldPath | `resourceSpecification` |
| Injection | `_.set(payload, 'resourceSpecification.id', validId)` |
| Schema | `Resource_Create.resourceSpecification` = `ResourceSpecificationRef` (requires `id`, `href`) |

### TMF639 → TMF702 (resource)

| Field | Value |
|-------|-------|
| Dependent resource | `resource` |
| resourceFieldPath | `resourceRelationship[0].resource` |
| Injection | `_.set(payload, 'resourceRelationship[0].resource.id', validId)` |
| Schema | `Resource_Create.resourceRelationship[0].resource` = `ResourceRefOrValue` (requires `id`, `href`) |

`resourceRelationship[0].relationshipType` is set to `"reliesOn"` (required by `ResourceRelationship`); this value is documented in the schema as suitable for a resource that relies on another already-owned resource.

## Cross-Version Field Notes

### TMF702 `Resource_Create` (v4.0.0 only)

TMF702 is declared at v4.0.0 only. `Resource_Create` has **no required fields** — both `resourceSpecification` and `resourceRelationship` are optional. They are included in target payloads to exercise the dependency validation behaviour.

### TMF634 `ResourceSpecification_FVO` vs `ResourceSpecification_Create` (v5 vs v4.1)

| Field | v5.0.0 (`ResourceSpecification_FVO`) | v4.1.0 (`ResourceSpecification_Create`) | Included |
|-------|--------------------------------------|------------------------------------------|---------|
| `@type` | Yes (via `Entity_FVO` → `Extensible_FVO`) | No | Yes: `"ResourceSpecification"` |
| `name` | Yes | Yes | Yes |

### TMF639 `Resource_Create` (v4.0.0 only)

TMF639 v4 `Resource_Create` formally lists `href`, `id`, and `name` as required. For the stub base payload only `name` is included — stubs do not enforce referential integrity and assign `id`/`href` automatically upon POST.

| Field | v4.0.0 (`Resource_Create`) | Included |
|-------|---------------------------|---------|
| `id` | Yes (server-assigned) | No (stub assigns) |
| `href` | Yes (server-assigned) | No (stub assigns) |
| `name` | Yes | Yes |

## Operation Mapping

| Exposed API | Resource | operationId |
|-------------|----------|-------------|
| TMF702 | resource | `createResource` |

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF702-v4.json` | Resource Activation Management | v4.0.0 | Local |
| `specs/TMF634-v5.yaml` | Resource Catalog Management | v5.0.0 | Local |
| `specs/TMF634-v4.json` | Resource Catalog Management | v4.1.0 | Local |
| `specs/TMF639-v4.json` | Resource Inventory Management | v4.0.0 | Local |
