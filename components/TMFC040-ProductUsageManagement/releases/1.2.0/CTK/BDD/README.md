# TMFC040 - Product Usage Management: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC040 |
| Component Name | ProductUsageManagement |
| Version | 1.2.0 |
| Functional Block | CoreCommerce |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | API Name | Resource | operationId |
|--------|----------|----------|-------------|
| TMF635 | usage-management-api | usage | createUsage |
| TMF677 | usage-consumption-management-api | queryUsageConsumption | createQueryUsageConsumption |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF632 | party-management-api | individual | party |

Optional dependent APIs skipped: TMF669 (required: false), TMF620 (required: false), TMF637 (required: false), TMF701 (required: false).

## BDD Pattern

Single mandatory dependent API (TMF632) with two mandatory exposed APIs (TMF635 and TMF677), yielding 4 scenario rows — 2 per exposed API (success and failure).

## Payload Files

### Base Payload (Dependent API Stub)

| File | API | Schema | Notes |
|------|-----|--------|-------|
| `payloads/party-management-0001.json` | TMF632 | Individual_FVO / Individual_Create | v4 requires `givenName`, `familyName`; v5 additionally requires `@type: "Individual"` |

### Target Payloads (Exposed APIs)

| File | Exposed API | Scenario | resourceFieldPath |
|------|-------------|----------|-------------------|
| `payloads/usage-target-0001.json` | TMF635 | TMF632 success | `relatedParty[0]` |
| `payloads/usage-target-0002.json` | TMF635 | TMF632 failure | `relatedParty[0]` |
| `payloads/usage-consumption-target-0001.json` | TMF677 | TMF632 success | `relatedParty[0].partyOrPartyRole` |
| `payloads/usage-consumption-target-0002.json` | TMF677 | TMF632 failure | `relatedParty[0].partyOrPartyRole` |

## Generated Scenarios

1. Valid Individual reference in TMF635 `usage` (TMF632 party stub returns 200)
2. Invalid Individual reference in TMF635 `usage` (TMF632 party stub returns 404)
3. Valid Individual reference in TMF677 `queryUsageConsumption` (TMF632 party stub returns 200)
4. Invalid Individual reference in TMF677 `queryUsageConsumption` (TMF632 party stub returns 404)

## Dependent Resource Mapping

### TMF632 → TMF635 (usage)

| Field | Value |
|-------|-------|
| Dependent resource | `individual` |
| resourceFieldPath | `relatedParty[0]` |
| Injection | `_.set(payload, 'relatedParty[0].id', validId)` |
| Schema | `Usage_Create.relatedParty[0]` = `RelatedParty` (requires `@referredType`, `id`) |

### TMF632 → TMF677 (queryUsageConsumption)

| Field | Value |
|-------|-------|
| Dependent resource | `individual` |
| resourceFieldPath | `relatedParty[0].partyOrPartyRole` |
| Injection | `_.set(payload, 'relatedParty[0].partyOrPartyRole.id', validId)` |
| Schema | `QueryUsageConsumption_FVO.relatedParty[0]` = `RelatedPartyRefOrPartyRoleRef_FVO`; party ID at `partyOrPartyRole.id` |

## Cross-Version Field Notes

### TMF635 `Usage_Create` (v4 only)

| Field | Required | Included | Notes |
|-------|----------|----------|-------|
| `relatedParty` | No | Yes | Optional but required for party validation test |
| `relatedParty[0].id` | Yes (via RelatedParty) | Yes | Party identifier injected by CTK |
| `relatedParty[0].@referredType` | Yes (via RelatedParty) | Yes | Discriminator for v4 |

TMF635 only declares v4 in the component specification; no v5 version exists for TMF635 in TMFC040.

### TMF677 `QueryUsageConsumption_FVO` vs `QueryUsageConsumption_Create` (v5 vs v4)

| Field | v4.0.0 Required | v5.0.0 Required | Included |
|-------|-----------------|-----------------|---------|
| `@type` | No | Yes (via Entity→Extensible) | Yes |
| `relatedParty` | No | No | Yes (required for party validation test) |

**TMF677 v4/v5 structural incompatibility:**

The `relatedParty` structure differs fundamentally between versions:

- **v4** (`QueryUsageConsumption_Create`): `relatedParty[0]` is a `RelatedParty` object; the party ID is at `relatedParty[0].id` directly; `resourceFieldPath: relatedParty[0]`
- **v5** (`QueryUsageConsumption_FVO`): `relatedParty[0]` is a `RelatedPartyRefOrPartyRoleRef_FVO` object; the party ID is nested at `relatedParty[0].partyOrPartyRole.id`; `resourceFieldPath: relatedParty[0].partyOrPartyRole`

Target payloads use the **v5 structure** (highest declared version). When deployed against a v4 implementation, the `partyOrPartyRole` field will not be understood, and the party reference validation scenario may behave differently.

### TMF677 v5 `RelatedPartyRefOrPartyRoleRef_FVO`

| Field | Required | Included |
|-------|----------|---------|
| `@type` | Yes (via Extensible) | Yes: `"RelatedPartyRefOrPartyRoleRef"` |
| `role` | Yes | Yes: `"customer"` |
| `partyOrPartyRole` | No | Yes (party reference for validation test) |
| `partyOrPartyRole.@type` | Yes (via EntityRef→Extensible) | Yes: `"PartyRef"` |
| `partyOrPartyRole.id` | Yes (via EntityRef) | Yes |

### TMF632 (v4 vs v5)

| Field | v4 (`Individual_Create`) | v5 (`Individual_FVO`) | Included |
|-------|--------------------------|-----------------------|---------|
| `givenName` | Yes | Yes | Yes |
| `familyName` | Yes | Yes | Yes |
| `@type` | No | Yes | Yes |

## Operation Mapping

| Exposed API | Resource | operationId |
|-------------|----------|-------------|
| TMF635 | usage | `createUsage` |
| TMF677 | queryUsageConsumption | `createQueryUsageConsumption` |

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF635-v4.json` | Usage Management | v4.0.0 | Local |
| `specs/TMF677-v5.yaml` | Usage Consumption Management | v5.0.0 | Local |
| `specs/TMF677-v4.json` | Usage Consumption Management | v4.0.0 | Local |
| `specs/TMF632-v5.yaml` | Party Management | v5.0.0 | Local |
| `specs/TMF632-v4.json` | Party Management | v4.0.0 | Local |
