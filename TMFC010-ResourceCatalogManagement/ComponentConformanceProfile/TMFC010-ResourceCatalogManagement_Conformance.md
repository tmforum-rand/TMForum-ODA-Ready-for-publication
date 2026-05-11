# Component Conformance Profile
## Resource Catalog Management (TMFC010)

## Component Under Test
**Name:** ResourceCatalogManagement  
**Component ID:** TMFC010  
**Version:** 1.4.2  
**Status:** Preview  

The Resource Catalog Management component is responsible for managing and exposing resource catalogs, categories, candidates, and specifications, supporting both customer-facing and technical views, and managing the lifecycle and relationships of resources.

---

## Mandatory Exposed APIs (Requiring Conformance)

The following **exposed APIs are marked as `required: true`** and therefore **MUST conform** to the listed specifications.

### TMF634 – Resource Catalog Management API
**API SDO:** TM Forum  
**Conformance Requirement:** Mandatory  

The Component under test MUST implement conformance to **one or both** of the following versions:

- **Version v5.0.0 (OpenAPI)**
  - Swagger:  
    [TMF634 Resource Catalog Management v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF634_Resource_Catalog/5.0.0/swagger/TMF634-Resource_Catalog_Management-v5.0.0.oas.yaml)

- **Version v4.1.0 (OpenAPI)**
  - Swagger:  
    [TMF634 Resource Catalog Management v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF634_Resource_Catalog/4.1.0/swagger/TMF634_Resource_Catalog_Management_API_v4.1.0_swagger.json)

Conformance may be declared against **either version independently or both versions simultaneously**.

---

## Mandatory Dependent APIs (Requiring Conformance)

All dependent APIs listed under `coreFunction.dependentAPIs` are marked as `required: false`.  
✅ **There are no mandatory dependent APIs requiring conformance** for this component.

---

## Mandatory Security APIs and Security Model

The Component under test **MUST either**:

- Integrate with and conform to the APIs listed under the **Security Function**, **or**
- Operate with a valid `canvasSystemRole`.

Because **TMF669** and **TMF672** are explicitly defined under the `securityFunction.exposedAPIs`, they are considered **mandatory for conformance**.

### TMF669 – Party Role Management API
**Conformance Requirement:** Mandatory  

- **Version v4.0.0 (OpenAPI)**
  - Swagger:  
    [TMF669 Party Role Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

---

### TMF672 – User Role Permission Management API
**Conformance Requirement:** Mandatory  

The Component under test MUST conform to **one or both** of the following versions:

- **Version v4.0.0 (OpenAPI)**
  - Swagger:  
    [TMF672 User Role Permission Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **Version v5.1.0 (OpenAPI)**
  - Swagger:  
    [TMF672 User Role Permission Management v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

Conformance may be declared against **either version independently or both versions simultaneously**.

---

## Summary of Conformance Requirements

| Category | API | Mandatory | Versions |
|-------|-----|-----------|----------|
| Exposed API | TMF634 | ✅ Yes | v5.0.0, v4.1.0 |
| Dependent APIs | — | ❌ No | — |
| Security API | TMF669 | ✅ Yes | v4.0.0 |
| Security API | TMF672 | ✅ Yes | v4.0.0, v5.1.0 |

---