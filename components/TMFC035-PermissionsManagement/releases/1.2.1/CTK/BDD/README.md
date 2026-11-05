# TMFC035 - Permissions Management: BDD Conformance Artefacts

## Component Overview

**Component:** TMFC035 - Permissions Management  
**Version:** 1.2.1  
**Description:** The Permissions Management component manages and exposes roles and related permissions. This component enables creation, modification and deletion of permissions and delegate permissions.

---

## Exposed APIs

| API ID | API Name                        | Version | Required |
|--------|---------------------------------|---------|----------|
| TMF672 | User Role Permission Management | v4.0.0  | Yes      |
| TMF669 | Party Role Management           | v4.0.0, v5.0.0 | Yes |

## Mandatory Dependent APIs

| API ID | API Name         | Version         | Required |
|--------|------------------|-----------------|----------|
| TMF632 | Party Management | v4.0.0, v5.0.0  | Yes      |

TMF701 (Process Flow Management) is declared as `required: false` and is excluded from BDD generation.

---

## Generation Pattern

**Decision:** TMFC005 pattern (single mandatory dependent API: TMF632)  
**Dependent Resource Selected:** `individual` — first resource in TMF632 that supports GET, GET /id, and POST.  
**Exposed APIs:** Two mandatory exposed APIs (TMF672, TMF669) — scenarios generated for each.

---

## Dependent Resource Mapping

### TMF632 Party Management → `individual`

The `individual` resource from TMF632 is the selected dependent resource. It is referenced in the POST schemas of both mandatory exposed APIs.

**TMF672 Permission:**
- Field path: `user` (RelatedParty)
- The `user` field holds a reference to the party (individual) who is granted the permission.

**TMF669 PartyRole:**
- Field path: `engagedParty` (PartyRef / RelatedParty)
- The `engagedParty` field holds a reference to the party (individual) that plays the role.

---

## Operation Mapping

| API    | Resource   | operationId      |
|--------|------------|------------------|
| TMF672 | permission | createPermission |
| TMF669 | partyRole  | createPartyRole  |

---

## Generated Payloads

### Base Payloads (Dependent API Initialisation)

| File                       | API    | Resource   | Description                                          |
|----------------------------|--------|------------|------------------------------------------------------|
| party-individual-0001.json | TMF632 | individual | Minimum viable Individual payload for TMF632 v4/v5. |

**Cross-version notes:**
- TMF632 v4 requires: `givenName`, `familyName`
- TMF632 v5 requires: `@type`, `givenName`, `familyName`
- `@type: "Individual"` is included to satisfy v5 and is harmless for v4.

### Target Payloads (Exposed API Validation)

| File                        | API    | Resource   | Scenario       | resourceFieldPath |
|-----------------------------|--------|------------|----------------|-------------------|
| permission-target-0001.json | TMF672 | permission | success (valid individual reference)   | user         |
| permission-target-0002.json | TMF672 | permission | failure (invalid individual reference) | user         |
| party-role-target-0001.json | TMF669 | partyRole  | success (valid individual reference)   | engagedParty |
| party-role-target-0002.json | TMF669 | partyRole  | failure (invalid individual reference) | engagedParty |

**Cross-version notes for TMF672 target payloads:**
- TMF672 v4 `Permission_Create` requires: `user` (RelatedParty with `@referredType`, `id`), `validFor`
- `@referredType: "Individual"` is included as required by TMF672 v4 RelatedParty schema.

**Cross-version notes for TMF669 target payloads:**
- TMF669 v4 `PartyRole_Create` requires: `name`; `engagedParty` (RelatedParty) requires `@referredType`, `id` when present.
- TMF669 v5 `PartyRole_FVO` requires: `@type`, `name`, `engagedParty` (PartyRef_FVO with `@type`, `id`).
- Payload includes all fields required by both versions for full cross-version compatibility.

---

## Generated Scenarios

| # | Exposed API | Resource   | Dependent API | Dependent Resource | Scenario |
|---|-------------|------------|---------------|--------------------|----------|
| 1 | TMF672      | permission | TMF632        | individual         | Valid individual reference → success   |
| 2 | TMF672      | permission | TMF632        | individual         | Invalid individual reference → failure |
| 3 | TMF669      | partyRole  | TMF632        | individual         | Valid individual reference → success   |
| 4 | TMF669      | partyRole  | TMF632        | individual         | Invalid individual reference → failure |

---

## Placeholder Injection Verification

The CTK runtime injects dependent resource identifiers using lodash:

```javascript
_.set(payload, `${resourceFieldPath}.id`, this.dependentAPI_ID);
_.set(payload, `${resourceFieldPath}.href`, this.dependentAPI_HREF);
```

**Verification:**

| resourceFieldPath | Injection result                               |
|-------------------|------------------------------------------------|
| `user`            | `payload.user.id` and `payload.user.href`      |
| `engagedParty`    | `payload.engagedParty.id` and `payload.engagedParty.href` |

Both paths resolve correctly with lodash `_.set`. ✓

---

## Validation Checklist

- [x] Mandatory exposed APIs identified: TMF672, TMF669
- [x] Mandatory dependent API identified: TMF632
- [x] Dependent resource selected: `individual` (supports GET, GET/id, POST in TMF632)
- [x] POST operations identified: `createPermission` (TMF672), `createPartyRole` (TMF669)
- [x] Resource field paths resolved: `user` (TMF672), `engagedParty` (TMF669)
- [x] Placeholder injection paths verified
- [x] Base payload generated and validated against TMF632 v4 and v5 schemas
- [x] Target payloads generated and validated against exposed API POST schemas
- [x] Success and failure scenarios generated for each exposed API
- [x] Cross-version required field comparison performed (TMF632 v4/v5, TMF669 v4/v5)
- [x] `@type` included in base payload (v5 requirement: `"Individual"`)
- [x] `@type` included in partyRole target payloads (v5 requirement: `"PartyRole"`, `"PartyRef"`)
- [x] README mappings match generated payloads
- [x] operationIds verified against OpenAPI specifications
- [x] Compatible with componentTests.js runtime
