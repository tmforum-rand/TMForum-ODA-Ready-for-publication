# Component Conformance Profile
## Component: ResourceCatalogManagement (TMFC010)

### Overview
This document defines the **API conformance requirements** for the **Resource Catalog Management** component based **solely on the provided Component YAML**.  
Only APIs marked as **required: true** are considered **mandatory for conformance**.

---

## Mandatory Exposed APIs (Conformance Required)

The following **exposed APIs** are marked as **required** and **must be conformant**.  
Where multiple versions of the same API are listed, conformance is defined as **either version** unless explicitly stated otherwise.

### TMF634 – Resource Catalog Management API (Mandatory)

**Conformance requirement:**  
The component **must conform to either or both** of the following API versions.

- **Version v5.0.0 (OpenAPI)**
  - Swagger:  
    [TMF634 Resource Catalog Management v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF634_Resource_Catalog/5.0.0/swagger/TMF634-Resource_Catalog_Management-v5.0.0.oas.yaml)

- **Version v4.1.0 (OpenAPI)**
  - Swagger:  
    [TMF634 Resource Catalog Management v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF634_Resource_Catalog/4.1.0/swagger/TMF634_Resource_Catalog_Management_API_v4.1.0_swagger.json)

---

## Mandatory Dependent APIs (Conformance Required)

✅ **None**

All APIs listed under `coreFunction.dependentAPIs` are marked as `required: false`.  
Therefore, **no dependent APIs are mandatory for conformance** for this component.

---

## Mandatory Security Function APIs

The Component under test **must either**:

- Integrate with the APIs listed under **Security Function**, **or**
- Operate with a **valid `canvasSystemRole`** as defined in the `securityFunction` section.

Because **TMF669** and **TMF672** are explicitly defined under `securityFunction.exposedAPIs`, they are considered **mandatory for conformance unless a valid `canvasSystemRole` is used**.

### TMF669 – Party Role Management API (Mandatory via Security Function)

**Conformance requirement:**  
The component **must conform** to the following version:

- **Version v4.0.0 (OpenAPI)**
  - Swagger:  
    [TMF669 Party Role Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

---

### TMF672 – User Role Permission Management API (Mandatory via Security Function)

**Conformance requirement:**  
The component **must conform to either or both** of the following versions:

- **Version v4.0.0 (OpenAPI)**
  - Swagger:  
    [TMF672 User Role Permission Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **Version v5.1.0 (OpenAPI)**
  - Swagger:  
    [TMF672 User Role Permission Management v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary of Mandatory API Conformance

| Category | API ID | Name | Versions |
|--------|--------|------|----------|
| Exposed | TMF634 | Resource Catalog Management | v5.0.0 **or** v4.1.0 |
| Security | TMF669 | Party Role Management | v4.0.0 |
| Security | TMF672 | User Role Permission Management | v4.0.0 **or** v5.1.0 |

---

✅ This completes the **Component Conformance Profile** derived exclusively from the supplied YAML.
