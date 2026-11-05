# TMFC011 - Resource Order Management — BDD Artefacts

## Component

**ID:** TMFC011  
**Name:** ResourceOrderManagement  
**Version:** 1.3.0  
**Description:** The Resource Order Management Component manages the end-to-end lifecycle of a resource order request.

---

## Generation Pattern

**TMFC007 pattern** — multiple mandatory dependent APIs, no chained dependencies.

---

## Exposed APIs

| API ID | Name | Resource | operationId | Required |
|--------|------|----------|-------------|----------|
| TMF652 | resource-order-management-api | resourceOrder | createResourceOrder | true |

Source: `specifications/TMFC011-ResourceOrderManagement/specs/TMF652-v4.json`

---

## Mandatory Dependent APIs

| API ID | Name | Resource | Versions Available | Required |
|--------|------|----------|--------------------|----------|
| TMF634 | resource-catalog-management-api | resourceSpecification | v4.1.0, v5.0.0 | true |
| TMF639 | resource-inventory-management-api | resource | v4.0.0 | true |

Optional dependent APIs (excluded from BDD generation):
- TMF702 resource-activation-management-api (required: false)
- TMF685 resource-pool-management-api (required: false)
- TMF664 resource-function-activation-management-api (required: false)
- TMF632 party-management-api (required: false)
- TMF646 appointment-management-api (required: false)
- TMF673 geographic-address-management-api (required: false)
- TMF674 geographic-site-management-api (required: false)
- TMF675 geographic-location-management-api (required: false)

---

## Cross-Version Required Field Comparison — TMF634

Both v4 and v5 spec files were available locally and compared.

| Field | v4 (ResourceSpecification_Create) | v5 (ResourceSpecification_FVO via Extensible_FVO) |
|-------|-----------------------------------|---------------------------------------------------|
| `name` | required | required (inner allOf object) |
| `@type` | not required | **required** (via Extensible_FVO.required) |

**Conclusion:** `@type` is required in v5 but not in v4. Per the Cross-Version Required Field Comparison Rule and the `@type` Discriminator Rule, `@type` has been included in `resource-catalog-0001.json` to ensure cross-version compatibility.

Value used: `"@type": "ResourceSpecification"` (PascalCase concrete class name per the `@type` Discriminator Rule).

---

## TMF639 — Single Version (v4 only)

TMF639 is declared with a single version (v4.0.0). No cross-version comparison required.

Note: The `Resource_Create` schema declares `required: ['href', 'id', 'name']` but the schema description states "Skipped properties: id,href". Per Base Payload Generation Rule 5 (remove `id` and `href` unless explicitly required as POST input), only `name` is included in `resource-inventory-0001.json`.

---

## Dependent Resource Mapping

### TMF634 — Resource Catalog

- **Selected Resource:** `resourceSpecification`
- **Selection Criteria:** Supports GET, GET /id, and POST in the TMF634 spec
- **Field Path in Exposed API:** `orderItem[0].resourceSpecification`
- **Schema Path:** `ResourceOrder_Create` → `orderItem[]` (array of `ResourceOrderItem`) → `resourceSpecification` (type: `ResourceSpecificationRef`)
- **resourceFieldPath:** `orderItem[0].resourceSpecification`

### TMF639 — Resource Inventory

- **Selected Resource:** `resource`
- **Selection Criteria:** Supports GET, GET /id, and POST in the TMF639 spec
- **Field Path in Exposed API:** `orderItem[0].resource`
- **Schema Path:** `ResourceOrder_Create` → `orderItem[]` (array of `ResourceOrderItem`) → `resource` (type: `ResourceRefOrValue`, required: `href`, `id`)
- **resourceFieldPath:** `orderItem[0].resource`

---

## Operation Mapping

| API | Resource | operationId |
|-----|----------|-------------|
| TMF652 | resourceOrder | createResourceOrder |

---

## Generated Scenarios

1. Valid `resourceSpecification` reference (TMF634) → `resource-target-0001.json` — success
2. Invalid `resourceSpecification` reference (TMF634) → `resource-target-0002.json` — failure
3. Valid `resource` reference (TMF639) → `resource-target-0003.json` — success
4. Invalid `resource` reference (TMF639) → `resource-target-0004.json` — failure

---

## Generated Payloads

### Base Payloads

| File | Dependent API | Resource | Schema Source |
|------|---------------|----------|---------------|
| `resource-catalog-0001.json` | TMF634 | resourceSpecification | TMF634-v4.json + TMF634-v5.yaml (union of required fields) |
| `resource-inventory-0001.json` | TMF639 | resource | TMF639-v4.json |

### Target Payloads

| File | Exposed API | Resource | Dependency Reference | Expected |
|------|-------------|----------|----------------------|----------|
| `resource-target-0001.json` | TMF652 | resourceOrder | `orderItem[0].resourceSpecification` with `__VALID_ID__` / `__VALID_HREF__` | success |
| `resource-target-0002.json` | TMF652 | resourceOrder | `orderItem[0].resourceSpecification` with `non-existent-id` / `non-existent-href` | failure |
| `resource-target-0003.json` | TMF652 | resourceOrder | `orderItem[0].resource` with `__VALID_ID__` / `__VALID_HREF__` | success |
| `resource-target-0004.json` | TMF652 | resourceOrder | `orderItem[0].resource` with `non-existent-id` / `non-existent-href` | failure |

---

## Local Spec Files Used

All OpenAPI specifications were resolved from local files — no internet access was required.

| File | API | Version |
|------|-----|---------|
| `specs/TMF652-v4.json` | TMF652 Resource Order Management | v4.0.0 |
| `specs/TMF634-v4.json` | TMF634 Resource Catalog Management | v4.1.0 |
| `specs/TMF634-v5.yaml` | TMF634 Resource Catalog Management | v5.0.0 |
| `specs/TMF639-v4.json` | TMF639 Resource Inventory Management | v4.0.0 |

---

## Placeholder Injection Verification

The CTK runtime injects dependent resource identifiers using lodash:

```javascript
_.set(payload, `${resourceFieldPath}.id`, this.dependentAPI_ID);
_.set(payload, `${resourceFieldPath}.href`, this.dependentAPI_HREF);
```

Verification:

- `_.set(payload, 'orderItem[0].resourceSpecification.id', value)` → updates `payload.orderItem[0].resourceSpecification.id` ✓
- `_.set(payload, 'orderItem[0].resourceSpecification.href', value)` → updates `payload.orderItem[0].resourceSpecification.href` ✓
- `_.set(payload, 'orderItem[0].resource.id', value)` → updates `payload.orderItem[0].resource.id` ✓
- `_.set(payload, 'orderItem[0].resource.href', value)` → updates `payload.orderItem[0].resource.href` ✓

---

## Schema Validation Summary

### `resource-catalog-0001.json`
- `name` (string): required by v4 and v5 ✓
- `@type` (string): required by v5 (Extensible_FVO), added for cross-version compatibility ✓
- `id`, `href`: not included (not in v4 POST schema properties, v4 schema lists no `id`/`href` in ResourceSpecification_Create) ✓

### `resource-inventory-0001.json`
- `name` (string): required in Resource_Create (v4) ✓
- `id`, `href`: excluded — schema description states "Skipped properties: id,href" ✓

### Target Payloads
- All use `orderItem` (not `resourceOrderItem`) — confirmed from `ResourceOrder_Create` schema ✓
- `orderItem[0].id` (string "1"): used for order item identification ✓
- `orderItem[0].action` (string "add"): standard action value ✓
- `orderItem[0].resourceSpecification` matches `ResourceSpecificationRef` definition ✓
- `orderItem[0].resource` matches `ResourceRefOrValue` definition (which requires `href` and `id`) ✓
