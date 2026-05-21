
# Component Conformance Profile  
## Component Under Test: ProductCatalogManagement (TMFC001 v2.2.2)

---

## Mandatory **Exposed APIs** (Conformance Required)

The following exposed APIs are marked as **required: true** and **MUST** be implemented by the component under test. Where multiple versions of the same API are listed, conformance MAY be demonstrated against **either or both** versions.

### TMF620 – Product Catalog Management API (Mandatory)

**Conformance Requirement:**  
The component **MUST conform** to TMF620.

**Accepted Versions for Conformance:**
- **v5.0.0**  
  Swagger:  
  [TMF620 Product Catalog Management API v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml)

- **v4.1.0**  
  Swagger:  
  [TMF620 Product Catalog Management API v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json)

Conformance may be claimed against **v5.0.0, v4.1.0, or both**.

---

## Mandatory **Dependent APIs** (Conformance Required)

There are **no dependent APIs** marked as **required: true** in the Core Function of this component.

✅ **Result:**  
No dependent APIs are mandatory for conformance.

---

## Mandatory **Security Function APIs** (Conformance Required)

The Component Under Test **MUST** either:
- integrate with the APIs defined under the **Security Function**, **or**
- operate with a valid and correctly configured **`canvasSystemRole`**.

Because TMF security APIs are explicitly present under `securityFunction.exposedAPIs`, they are considered **mandatory for conformance** unless a valid `canvasSystemRole` is used instead.

### TMF669 – Party Role Management API (Mandatory for Security)

**Accepted Version for Conformance:**
- **v4.0.0**  
  Swagger:  
  [TMF669 Party Role Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

---

### TMF672 – User Role & Permission Management API (Mandatory for Security)

**Accepted Versions for Conformance:**
- **v4.0.0**  
  Swagger:  
  [TMF672 User Role Permission Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **v5.1.0**  
  Swagger:  
  [TMF672 User Role Permission Management API v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

Conformance may be claimed against **v4.0.0, v5.1.0, or both**.

---

## Security Conformance Statement

The ProductCatalogManagement component **MUST** enforce access control and authorization either by consuming the **TMF669 Party Role Management API** and the **TMF672 User Role & Permission Management API** as defined in the Security Function, **or** by operating with a valid `canvasSystemRole` that provides equivalent security enforcement within the Canvas platform.  
If TMF669 and/or TMF672 are present in the Security Function definition, they are considered **mandatory for conformance** unless explicitly replaced by a compliant `canvasSystemRole` configuration.

---
