# TMFC012 - Resource Inventory

## Purpose

This BDD directory contains dependency validation artefacts for TMFC012 - Resource Inventory, generated following the Component Conformance BDD generation process.

## Component

TMFC012 - Resource Inventory

## Mandatory Exposed APIs

| API ID | Resource | Operation |
|--------|----------|-----------|
| TMF639 | resource | createResource |

## Mandatory Dependent APIs

| API ID | Resource |
|--------|----------|
| TMF634 | resourceSpecification |

## Generated Payloads

### Base Payloads

| File | Dependent API | Description |
|------|---------------|-------------|
| resource-catalog-0001.json | TMF634 | Minimum valid ResourceSpecification for dependent stub initialisation |

### Target Payloads

| File | Purpose |
|------|---------|
| resource-target-0001.json | Valid ResourceSpecification reference (success scenario) |
| resource-target-0002.json | Invalid ResourceSpecification reference (failure scenario) |

## Resource Mapping

| Dependent API | Resource | Field Path |
|---------------|----------|------------|
| TMF634 | resourceSpecification | resourceSpecification |

## Generated Scenarios

### Scenario 1

Valid ResourceSpecification reference

Expected Result: success

### Scenario 2

Invalid ResourceSpecification reference

Expected Result: failure

## Operation Mapping

TMF639 resource

→ createResource

## Pattern

Single mandatory dependent API validation (TMFC005 pattern).

## Version Notes

- TMF634 declares both v4.1.0 and v5.0.0. The base payload was generated using the v5 schema (`ResourceSpecification_FVO`) as the primary source. The `@type` field is required in v5 via `Extensible_FVO` and is included in the base payload with value `ResourceSpecification`. The payload is also compatible with v4.1.0 (`ResourceSpecification_Create`), which requires only `name` and treats `@type` as optional.
- TMF639 (exposed API) declares v4.0.0 only. Target payloads are generated from the v4 `Resource_Create` schema. The `Resource_Create` schema description states "Skipped properties: id,href", indicating that `id` and `href` are server-assigned and should not be supplied in the POST request body. Target payloads include `name` and `resourceSpecification` only.
- The `ResourceSpecificationRef` within `Resource_Create` requires `id` (per the schema `required` array). Both `id` and `href` are included in the target payloads using the standard placeholder pattern.
