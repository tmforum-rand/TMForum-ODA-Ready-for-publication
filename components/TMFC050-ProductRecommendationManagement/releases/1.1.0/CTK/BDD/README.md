# TMFC050 - Product Recommendation Management: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC050 |
| Component Name | ProductRecommendationManagement |
| Version | 1.1.0 |
| Functional Block | CoreCommerce |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | API Name | Resource | operationId |
|--------|----------|----------|-------------|
| TMF680 | recommendation-management-api | queryProductRecommendation | createQueryProductRecommendation |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF620 | product-catalog-management-api | category | productCatalog |

Optional dependent APIs skipped (required: false): TMF637, TMF622, TMF679, TMF666, TMF629, TMF663, TMF671, TMF673, TMF675, TMF632, TMF669, TMF678, TMF621, TMF635, TMF645.

## BDD Pattern

TMFC005 — single mandatory dependent API (TMF620) with one mandatory exposed API (TMF680), yielding 2 scenario rows (success and failure).

## Payload Files

### Base Payload (Dependent API Stub)

| File | API | Resource | Schema |
|------|-----|----------|--------|
| `payloads/product-catalog-0001.json` | TMF620 | category | Category_FVO / Category_Create |

### Target Payloads (Exposed API — TMF680)

| File | Scenario | category[0].id |
|------|----------|----------------|
| `payloads/recommendation-target-0001.json` | success | `__VALID_ID__` |
| `payloads/recommendation-target-0002.json` | failure | `non-existent-id` |

## Generated Scenarios

1. Valid category reference in TMF680 `queryProductRecommendation` (TMF620 category stub returns 200)
2. Invalid category reference in TMF680 `queryProductRecommendation` (TMF620 category stub returns 404)

## Dependent Resource Mapping

### TMF620 → TMF680 (queryProductRecommendation)

| Field | Value |
|-------|-------|
| Dependent resource | `category` |
| resourceFieldPath | `category[0]` |
| Injection | `_.set(payload, 'category[0].id', validId)` |
| Schema | `QueryProductRecommendation_Create.category[0]` = `CategoryRef` (requires `id`) |

`category` was selected as the TMF620 resource because:
- It is directly referenced as a top-level array in `QueryProductRecommendation_Create`
- `CategoryRef` requires only `id`, making the path and placeholder injection straightforward
- TMF620 supports POST `/category` (`createCategory`) in both v4 and v5 specs

## Cross-Version Field Notes

### TMF680 `QueryProductRecommendation_Create` (v4 only)

TMF680 declares only v4; no v5 exists for this component. No `@type` discriminator is required in target payloads.

| Field | Required | Included |
|-------|----------|---------|
| `category` | No | Yes (required for catalog dependency validation test) |
| `category[0].id` | Yes (via CategoryRef) | Yes |

### TMF620 `Category_Create` vs `Category_FVO` (v4 vs v5)

| Field | v4.1.0 (`Category_Create`) | v5.0.0 (`Category_FVO`) | Included |
|-------|----------------------------|-------------------------|---------|
| `name` | Yes | Yes | Yes |
| `@type` | No | Yes (via Extensible_FVO) | Yes: `"Category"` |

## Operation Mapping

| Exposed API | Resource | operationId |
|-------------|----------|-------------|
| TMF680 | queryProductRecommendation | `createQueryProductRecommendation` |

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF680-v4.json` | Recommendation Management | v4.0.0 | Local |
| `specs/TMF620-v5.yaml` | Product Catalog Management | v5.0.0 | Local |
| `specs/TMF620-v4.json` | Product Catalog Management | v4.1.0 | Local |
