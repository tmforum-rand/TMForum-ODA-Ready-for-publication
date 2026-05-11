# Component Conformance Profile — PartyInteractionManagement (TMFC023) v1.2.2

## Component Under Test
**Component ID:** TMFC023  
**Name:** PartyInteractionManagement  
**Version:** 1.2.2  
**Status:** preview  
**Functional Block:** PartyManagement  
**Description:** Party Interaction deals with the initial greeting and welcoming of a new contact. This will typically be the first component in a customer experience journey, shared by unassisted (self-service, retail kiosk) or assisted (call center, retail store) channels. It will identify known Parties or new Parties and react appropriately to propose available actions. It records all the interactions for the Parties from all channels.  
**Publication Date:** 2025-10-21 00:00:00  

---

## Mandatory Exposed APIs (Conformance Required)

### TMF683 — party-interaction-management-api (**required: true**)
The component **MUST** expose TMF683 and conform to **either or both** of the following specifications (two versions are declared):

- **v5.0.0 (OpenAPI)**
  - Swagger/OAS: [TMF683 Party Interaction v5.0.0 OAS](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF683_Party_Interaction/5.0.0/swagger/TMF683-Party_Interaction-v5.0.0.oas.yaml)
  - Declared resources/methods:
    - `partyInteraction`: `GET`, `GET /id`, `POST`, `PATCH`, `DELETE`

- **v4.0.0 (OpenAPI)**
  - Swagger: [TMF683 Party Interaction v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/Historic/TMF683_Party_Interaction/4.0.0/swagger/TMF683-PartyInteraction-4.0.0.swagger.json)
  - Declared resources/methods:
    - `partyInteraction`: `GET`, `GET /id`, `POST`, `PATCH`, `DELETE`

> **Conformance rule for multiple versions:** For TMF683, conformance may be asserted to **v5.0.0**, **v4.0.0**, or **both**, as both versions are explicitly declared.

---

## Mandatory Dependent APIs (Conformance Required)

### None
No APIs under `spec.coreFunction.dependentAPIs` are marked `required: true`.  
Therefore, **there are no mandatory dependent APIs** for conformance based on this YAML.

---

## Security Function Requirements (Mandatory by Rule)

The component’s `securityFunction` declares a `canvasSystemRole`:
- `canvasSystemRole: '{{ .Values.security.controllerRole }}'`

**Security conformance requirement:** The Component under test **MUST** either:
1. **Use the APIs listed under the Security Function**, **or**
2. Have a **valid `canvasSystemRole`** as declared (`'{{ .Values.security.controllerRole }}'`).

Additionally, **if TMF669 or TMF672 is present in `securityFunction.exposedAPIs`, it MUST be treated as mandatory for conformance**, regardless of the `required` flag value. This YAML includes both TMF669 and TMF672 under `securityFunction.exposedAPIs`, therefore both are **mandatory**:

### TMF669 — partyrole (Security Function) (**mandatory by rule**)
- **v4.0.0 (OpenAPI)**
  - Swagger: [TMF669 Party Role Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)
  - Declared deployment details (from YAML):
    - `path: /{{.Release.Name}}-{{.Values.component.name}}/tmf-api/partyRoleManagement/v4`
    - `developerUI: /{{.Release.Name}}-{{.Values.component.name}}/tmf-api/partyRoleManagement/v4/docs`
    - `implementation: '{{.Release.Name}}-partyroleapi'`
    - `port: 8080`

### TMF672 — user-role-permission-management-api (Security Function) (**mandatory by rule**)
TMF672 is declared with two versions; the component must conform to **either or both**:

- **v4.0.0 (OpenAPI)**
  - Swagger: [TMF672 User Role Permission v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - Declared deployment details (from YAML):
    - `path: /{{.Release.Name}}-{{.Values.component.name}}/tmf-api/userRolePermissionManagement/v4`
    - `developerUI: /{{.Release.Name}}-{{.Values.component.name}}/tmf-api/userRolePermissionManagement/v4/docs`
    - `implementation: '{{.Release.Name}}-userrolepermissionapi'`
    - `port: 8080`

- **v5.1.0 (OpenAPI)**
  - OAS: [TMF672 User Role Permission v5.1.0 OAS](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)
  - Declared deployment details (from YAML):
    - `path: /{{.Release.Name}}-{{.Values.component.name}}/tmf-api/userRolePermissionManagement/v5`
    - `developerUI: /{{.Release.Name}}-{{.Values.component.name}}/tmf-api/userRolePermissionManagement/v5/docs`
    - `implementation: '{{.Release.Name}}-userrolepermissionapi'`
    - `port: 8080`

> **Conformance rule for multiple versions:** For TMF672, conformance may be asserted to **v4.0.0**, **v5.1.0**, or **both**, as both versions are explicitly declared.

---