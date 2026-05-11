# Component Conformance Profile
## TMFC006 – Service Catalog Management Component

---

## Component Under Test

**Component ID:** TMFC006  
**Name:** ServiceCatalogManagement  
**Version:** 1.3.0  
**Status:** Preview  

This Component is responsible for managing service catalogs and service specifications, supporting both customer-facing and resource-facing service definitions, lifecycle management, and integration with related TM Forum Open APIs.

---

## Mandatory Exposed APIs (Conformance Required)

The following **exposed APIs** are marked as `required: true` and **MUST** be implemented by the Component under test. Conformance is required against the listed OpenAPI specifications.

### TMF633 – Service Catalog Management API
- **API ID:** TMF633  
- **Required:** Yes  
- **Conformance Version(s):**
  - **v4.0.0**
- **Specification (Swagger/OpenAPI):**
  - [TMF633 Service Catalog Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF633_Service_Catalog/4.0.0/swagger/TMF633_Service_Catalog_Management_API_v4.0.0_swagger.json)

---

### TMF657 – Service Quality Management API
- **API ID:** TMF657  
- **Required:** Yes  
- **Conformance Version(s):**
  - **v4.0.0**
- **Specification (Swagger/OpenAPI):**
  - [TMF657 Service Quality Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF657_Service_Quality_Management/4.0.0/swagger/TMF657_Service_Quality_Management_Management_API_v4.0.0_swagger.json)

---

## Mandatory Dependent APIs

All **dependent APIs** listed in the Core Function are marked as `required: false`.  
✅ **There are no mandatory dependent APIs for conformance** under the Core Function for this Component.

---

## Security Function – Mandatory Security Conformance

The Component under test **MUST** either:

1. **Use the APIs listed under the Security Function**, **or**
2. **Operate with a valid `canvasSystemRole`**, as defined by the ODA Canvas security model.

Because the following APIs are explicitly defined under the **Security Function**, they are considered **mandatory for conformance** unless a valid `canvasSystemRole` is used.

### TMF669 – Party Role Management API
- **API ID:** TMF669  
- **Required (Security):** Yes  
- **Conformance Version(s):**
  - **v4.0.0**
- **Specification (Swagger/OpenAPI):**
  - [TMF669 Party Role Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

---

### TMF672 – User Role Permission Management API
- **API ID:** TMF672  
- **Required (Security):** Yes  
- **Conformance Version(s):**
  - **v4.0.0**, **v5.1.0**  
- **Conformance Rule:**  
  - Conformance may be achieved against **either version or both versions**.
- **Specification (Swagger/OpenAPI):**
  - [TMF672 User Role Permission Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - [TMF672 User Role Permission Management v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary of Mandatory Conformance Scope

| Category | API ID | Version(s) | Mandatory |
|-------|--------|------------|-----------|
| Exposed API | TMF633 | v4.0.0 | ✅ |
| Exposed API | TMF657 | v4.0.0 | ✅ |
| Security API | TMF669 | v4.0.0 | ✅ |
| Security API | TMF672 | v4.0.0 or v5.1.0 | ✅ |
| Dependent APIs | — | — | ❌ |

---

**Note:** If the Component does not directly expose or integrate with the Security Function APIs listed above, it **MUST** declare and operate with a valid `canvasSystemRole` to remain conformant with ODA security requirements.