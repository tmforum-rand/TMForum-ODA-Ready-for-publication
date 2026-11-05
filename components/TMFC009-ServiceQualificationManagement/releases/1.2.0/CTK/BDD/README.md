# TMFC009 - Service Qualification Management

## Purpose

This BDD directory contains dependency validation artefacts for TMFC009 - Service Qualification Management, generated following the Component Conformance BDD generation process.

## Component

TMFC009 - Service Qualification Management

## Mandatory Exposed APIs

| API ID | Resource | Operation |
|--------|----------|-----------|
| TMF645 | checkServiceQualification | createCheckServiceQualification |

## Mandatory Dependent APIs

| API ID | Resource |
|--------|----------|
| TMF633 | serviceSpecification |

## Generated Payloads

### Base Payloads

| File | Dependent API | Description |
|------|---------------|-------------|
| service-catalog-0001.json | TMF633 | Minimum valid ServiceSpecification for dependent stub initialisation |

### Target Payloads

| File | Purpose |
|------|---------|
| service-target-0001.json | Valid ServiceSpecification reference (success scenario) |
| service-target-0002.json | Invalid ServiceSpecification reference (failure scenario) |

## Resource Mapping

| Dependent API | Resource | Field Path |
|---------------|----------|------------|
| TMF633 | serviceSpecification | serviceQualificationItem[0].service.serviceSpecification |

## Generated Scenarios

### Scenario 1

Valid ServiceSpecification reference

Expected Result: success

### Scenario 2

Invalid ServiceSpecification reference

Expected Result: failure

## Operation Mapping

TMF645 checkServiceQualification

→ createCheckServiceQualification

## Pattern

Single mandatory dependent API validation (TMFC005 pattern).

## Version Notes

- TMF645 declares both v4.0.0 and v5.0.0. Only v5 (`TMF645-v5.yaml`) was available locally. Target payloads are generated from the v5 schema. The `@type` discriminator field is required in all v5 payloads via the `Extensible` base schema. Cross-version compatibility with v4 could not be verified locally; the v4 spec should be obtained and validated separately if v4 conformance testing is required.
- TMF633 declares v4.0.0 only. The base payload is generated from the v4 `ServiceSpecification_Create` schema. No `@type` field is required in the base payload.
