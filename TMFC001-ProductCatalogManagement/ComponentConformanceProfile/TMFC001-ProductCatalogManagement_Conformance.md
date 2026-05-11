# Component Conformance Profile
## Component: ProductCatalogManagement (TMFC001)

This document defines the **mandatory API conformance requirements** for the ODA Component under test, based **only** on the supplied Component YAML.

---

## Mandatory Exposed APIs (Conformance Required)

The following APIs are **exposed by the component** and marked as `required: true`. The Component under test **MUST** conform to at least one of the specified versions for each API.

### TMF620 – Product Catalog Management API

**Conformance requirement:**  
The component MUST implement **TMF620** and conform to **either or both** of the following versions.

- **Version v5.0.0 (OpenAPI)**
  - Swagger:  
    [TMF620 Product Catalog Management API v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml)

- **Version v4.1.0 (OpenAPI)**
  - Swagger:  
    [TMF620 Product Catalog Management API v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json)

---

## Mandatory Dependent APIs (Conformance Required)

There are **no mandatory dependent APIs** defined for this component.

All APIs listed under `spec.coreFunction.dependentAPIs` are marked as `required: false` and therefore **do not impose conformance requirements**.

---

## Mandatory Security Function APIs

The Component under test **MUST** either:

- Use the APIs defined under the **Security Function**, **or**
- Be deployed with a valid `canvasSystemRole`.

Because **TMF669** and **TMF672** are explicitly present under `securityFunction.exposedAPIs`, they are considered **mandatory for conformance** unless a valid `canvasSystemRole` is used.

### TMF669 – Party Role Management API

**Conformance requirement:**  
The component MUST conform to the following version:

- **Version v4.0.0 (OpenAPI)**
  - Swagger:  
    [TMF669 Party Role Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

---

### TMF672 – User Role Permission Management API

**Conformance requirement:**  
The component MUST conform to **either or both** of the following versions:

- **Version v4.0.0 (OpenAPI)**
  - Swagger:  
    [TMF672 User Role Permission Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **Version v5.1.0 (OpenAPI)**
  - Swagger:  
    [TMF672 User Role Permission Management API v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Security Conformance Statement

The ProductCatalogManagement Component **must enforce access control** either by integrating with the **Security Function APIs** listed above (TMF669 and TMF672) or by operating under a valid `canvasSystemRole` as defined in the component specification. When TMF669 and/or TMF672 are declared within the Security Function, conformance to those APIs is **mandatory**, ensuring standardized role, permission, and party-role governance in alignment with ODA security principles.

---