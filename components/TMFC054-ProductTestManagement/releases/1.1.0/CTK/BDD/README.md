# TMFC054 - Product Test Management: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC054 |
| Component Name | ProductTestManagement |
| Version | 1.1.0 |
| Functional Block | CoreCommerce |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | API Name | Resource | operationId |
|--------|----------|----------|-------------|
| TMF769 | product-test-api | productTestSpecification | createProductTestSpecification |
| TMF769 | product-test-api | productTest | createProductTest |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF620 | product-catalog-management-api | productSpecification | productCatalog |
| TMF637 | product-inventory-management-api | product | productInventory |

Optional dependent APIs skipped (required: false): TMF632, TMF669, TMF653, TMF638, TMF724, TMF701.

## BDD Pattern

TMFC007 — two mandatory dependent APIs (TMF620 and TMF637), each mapped to a different POST resource in the single mandatory exposed API (TMF769). This yields 4 scenario rows (2 per dependency × 2 success/failure).

The two exposed resources map to different dependencies:
- `productTestSpecification` POST → validates `relatedProductSpecification[0]` against TMF620
- `productTest` POST → validates `relatedProduct` against TMF637

## Payload Files

### Base Payloads (Dependent API Stubs)

| File | API | Resource | Schema |
|------|-----|----------|--------|
| `payloads/product-catalog-0001.json` | TMF620 | productSpecification | ProductSpecification_FVO / ProductSpecification_Create |
| `payloads/product-inventory-0001.json` | TMF637 | product | Product_FVO / Product_Create |

### Target Payloads (Exposed API — TMF769)

| File | Scenario | Exposed Resource | Field | Value |
|------|----------|------------------|-------|-------|
| `payloads/product-test-spec-target-0001.json` | success | productTestSpecification | relatedProductSpecification[0].id | `__VALID_ID__` |
| `payloads/product-test-spec-target-0002.json` | failure | productTestSpecification | relatedProductSpecification[0].id | `non-existent-id` |
| `payloads/product-test-target-0001.json` | success | productTest | relatedProduct.id | `__VALID_ID__` |
| `payloads/product-test-target-0002.json` | failure | productTest | relatedProduct.id | `non-existent-id` |

## Generated Scenarios

1. Valid productSpecification reference in TMF769 `productTestSpecification` (TMF620 stub returns 200)
2. Invalid productSpecification reference in TMF769 `productTestSpecification` (TMF620 stub returns 404)
3. Valid product reference in TMF769 `productTest` (TMF637 stub returns 200)
4. Invalid product reference in TMF769 `productTest` (TMF637 stub returns 404)

## Dependent Resource Mapping

### TMF620 → TMF769 (productTestSpecification)

| Field | Value |
|-------|-------|
| Dependent resource | `productSpecification` |
| resourceFieldPath | `relatedProductSpecification[0]` |
| Injection | `_.set(payload, 'relatedProductSpecification[0].id', validId)` |
| Schema | `ProductTestSpecification_FVO.relatedProductSpecification[0]` = `ProductSpecificationRef_FVO` (requires `id`, `name`, `@type`) |

### TMF637 → TMF769 (productTest)

| Field | Value |
|-------|-------|
| Dependent resource | `product` |
| resourceFieldPath | `relatedProduct` |
| Injection | `_.set(payload, 'relatedProduct.id', validId)` |
| Schema | `ProductTest_FVO.relatedProduct` = `ProductRef_FVO` (requires `id`, `name`, `@type`) |

## Cross-Version Field Notes

### TMF769 `ProductTestSpecification_FVO` (v5 only)

`ProductTestSpecification_FVO` inherits from `EntitySpecification_FVO` → `Entity` → `Extensible` (requires `@type`).

| Field | Required Source | Included |
|-------|----------------|---------|
| `@type` | `Extensible` | Yes: `"ProductTestSpecification"` |
| `name` | `EntitySpecification_FVO` | Yes |
| `relatedProductSpecification` | `ProductTestSpecification_FVO` | Yes |
| `relatedProductSpecification[0].@type` | `EntityRef_FVO` → `Extensible` | Yes: `"ProductSpecificationRef"` |
| `relatedProductSpecification[0].id` | `EntityRef_FVO` | Yes (`__VALID_ID__` / `non-existent-id`) |
| `relatedProductSpecification[0].name` | `EntityRef_FVO` | Yes |

### TMF769 `ProductTest_FVO` (v5 only)

`ProductTest_FVO` inherits from `Extensible` (requires `@type`) and `Addressable`.

| Field | Required Source | Included |
|-------|----------------|---------|
| `@type` | `Extensible` | Yes: `"ProductTest"` |
| `name` | `ProductTest_FVO` | Yes |
| `testSpecification` | `ProductTest_FVO` | Yes (hardcoded, see note below) |
| `relatedProduct` | `ProductTest_FVO` | Yes |
| `relatedProduct.@type` | `EntityRef_FVO` → `Extensible` | Yes: `"ProductRef"` |
| `relatedProduct.id` | `EntityRef_FVO` | Yes (`__VALID_ID__` / `non-existent-id`) |
| `relatedProduct.name` | `EntityRef_FVO` | Yes |

**Note on `testSpecification` in `productTest` target payloads:** `ProductTest_FVO.testSpecification` is required and references a `ProductTestSpecification` managed by the component under test (not a dependent API resource). The target payloads use a hardcoded `testSpecification.id = "test-product-test-spec-001"`. The TMF637 dependency test scenarios are designed to verify that the component correctly validates `relatedProduct` against the TMF637 product stub. Implementations that strictly validate `testSpecification.id` at creation time may need a pre-existing `productTestSpecification` to be seeded before running the TMF637 dependency scenarios.

### TMF620 `ProductSpecification_FVO` vs `ProductSpecification_Create` (v5 vs v4.1)

| Field | v5.0.0 (`ProductSpecification_FVO`) | v4.1.0 (`ProductSpecification_Create`) | Included |
|-------|--------------------------------------|----------------------------------------|---------|
| `@type` | Yes (explicit `required`) | No | Yes: `"ProductSpecification"` |
| `name` | Yes | Yes | Yes |
| `lifecycleStatus` | Yes | No | Yes: `"active"` |
| `lastUpdate` | Yes (date-time) | No | Yes: `"2026-01-01T00:00:00.000Z"` |

### TMF637 `Product_FVO` vs `Product_Create` (v5 vs v4)

| Field | v5.0.0 (`Product_FVO`) | v4.0.0 (`Product_Create`) | Included |
|-------|------------------------|---------------------------|---------|
| `@type` | Yes (via `Entity_FVO` → `Extensible_FVO`) | No | Yes: `"Product"` |
| `status` | No | Yes | Yes: `"active"` |

## Operation Mapping

| Exposed API | Resource | operationId |
|-------------|----------|-------------|
| TMF769 | productTestSpecification | `createProductTestSpecification` |
| TMF769 | productTest | `createProductTest` |

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF769-v5.yaml` | Product Test Management | v5.0.0 | Local |
| `specs/TMF620-v5.yaml` | Product Catalog Management | v5.0.0 | Local |
| `specs/TMF620-v4.json` | Product Catalog Management | v4.1.0 | Local |
| `specs/TMF637-v5.yaml` | Product Inventory Management | v5.0.0 | Local |
| `specs/TMF637-v4.json` | Product Inventory Management | v4.0.0 | Local |
