# TMFC022 - Party Privacy Management: BDD Conformance Test Artifacts

## Component Overview

| Field | Value |
|-------|-------|
| Component ID | TMFC022 |
| Component Name | PartyPrivacyManagement |
| Version | 1.2.0 |
| Functional Block | PartyManagement |

## API Coverage

### Exposed APIs (Mandatory)

| API ID | Resource | Operation | operationId |
|--------|----------|-----------|-------------|
| TMF644 | partyPrivacyAgreement | POST | createPartyPrivacyAgreement |

### Dependent APIs (Mandatory)

| API ID | API Name | Resource | dependentComponent |
|--------|----------|----------|--------------------|
| TMF632 | party-management-api | individual | party |
| TMF669 | party-role-management-api | partyRole | partyRole |

## BDD Pattern

**TMFC007** — Multiple independent mandatory dependent APIs. Two dependent APIs (TMF632 and TMF669) are each tested independently, yielding 4 scenario rows (2 per dependency: success and failure).

## Payload Files

### Base Payloads (Dependent API Stubs)

| File | API | Schema | Notes |
|------|-----|--------|-------|
| `payloads/party-management-0001.json` | TMF632 | Individual_FVO / Individual_Create | v4 requires `givenName`, `familyName`; v5 additionally requires `@type` |
| `payloads/party-role-0001.json` | TMF669 | PartyRole_FVO / PartyRole_Create | v4 requires `name` only; v5 additionally requires `@type` and `engagedParty`; `engagedParty.id` is hardcoded (`test-party-001`) since the stub does not enforce referential integrity |

### Target Payloads (Exposed API — TMF644)

| File | Scenario | engagedParty[0].@type | id |
|------|----------|-----------------------|----|
| `payloads/privacy-target-0001.json` | TMF632 success | PartyRef | `__VALID_ID__` |
| `payloads/privacy-target-0002.json` | TMF632 failure | PartyRef | `non-existent-id` |
| `payloads/privacy-target-0003.json` | TMF669 success | PartyRoleRef | `__VALID_ID__` |
| `payloads/privacy-target-0004.json` | TMF669 failure | PartyRoleRef | `non-existent-id` |

## Cross-Version Field Notes

### TMF644 `PartyPrivacyAgreement_Create` / `PartyPrivacyAgreement_FVO`

| Field | v4.0.0 Required | v5.0.0 Required | Included |
|-------|-----------------|-----------------|---------|
| `@type` | No | Yes | Yes |
| `name` | Yes | Yes | Yes |
| `agreementType` | Yes | Yes | Yes |
| `agreementItem` | Yes | No | Yes (empty object `{}` satisfies no-required-properties constraint) |
| `engagedParty` | Yes | Yes | Yes |

### TMF644 `engagedParty[0]`

| Field | v4 (`RelatedParty`) | v5 (`PartyRef_FVO` / `PartyRoleRef_FVO`) | Included |
|-------|---------------------|------------------------------------------|---------|
| `id` | Yes | Yes | Yes |
| `@referredType` | Yes | No | Yes |
| `@type` | No | Yes | Yes |
| `href` | No | No (but conventional) | Yes |

### TMF632 (v4 vs v5)

| Field | v4 (`Individual_Create`) | v5 (`Individual_FVO`) | Included |
|-------|--------------------------|-----------------------|---------|
| `givenName` | Yes | Yes | Yes |
| `familyName` | Yes | Yes | Yes |
| `@type` | No | Yes | Yes |

### TMF669 (v4 vs v5)

| Field | v4 (`PartyRole_Create`) | v5 (`PartyRole_FVO`) | Included |
|-------|-------------------------|----------------------|---------|
| `name` | Yes | Yes | Yes |
| `@type` | No | Yes | Yes |
| `engagedParty` | No | Yes | Yes |
| `engagedParty.id` | N/A | Yes | Yes (hardcoded: `test-party-001`) |
| `engagedParty.@type` | N/A | Yes | Yes |
| `engagedParty.@referredType` | N/A (optional in v4 RelatedParty) | No | Yes (for v4 consistency) |

## Spec Files

| File | API | Version | Source |
|------|-----|---------|--------|
| `specs/TMF644-v5.yaml` | Privacy Management | v5.0.0 | Local |
| `specs/TMF644-v4.json` | Privacy Management | v4.0.0 | Local |
| `specs/TMF632-v5.yaml` | Party Management | v5.0.0 | Local |
| `specs/TMF632-v4.json` | Party Management | v4.0.0 | Local |
| `specs/TMF669-v5.yaml` | Party Role Management | v5.0.0 | Local |
| `specs/TMF669-v4.json` | Party Role Management | v4.0.0 | Local |
