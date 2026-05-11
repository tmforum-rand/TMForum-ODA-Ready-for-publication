# Component Conformance Profile
## Component: ProductOrderCaptureAndValidation (TMFC002 v2.2.0)

---

## Mandatory **Exposed APIs** (Conformance Required)

The following **exposed APIs** are marked as **mandatory** for conformance based on the component definition.

> **Note:** In this component, no exposed API under `coreFunction.exposedAPIs` is marked with `required: true`.  
> However, **securityFunction exposed APIs** are treated as mandatory (see Security section).

### TMF669 – Party Role Management API (Security Function)
- **Required:** Yes (Security Function)
- **Specification Version:** v4.0.0  
- **Swagger:**  
  - [TMF669 Party Role Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 – User Role Permission Management API (Security Function)
- **Required:** Yes (Security Function)
- **Specification Versions (Either or Both):**
  - **v4.0.0**
    - [TMF672 User Role Permission Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - **v5.1.0**
    - [TMF672 User Role Permission Management API v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Mandatory **Dependent APIs** (Conformance Required)

The following **dependent APIs** are explicitly marked as `required: true` and **must** be implemented by the Component under test.

### TMF620 – Product Catalog Management API
- **Required:** Yes
- **Specification Versions (Either or Both):**
  - **v5.0.0**
    - [TMF620 Product Catalog Management API v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml)
  - **v4.1.0**
    - [TMF620 Product Catalog Management API v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json)

---

### TMF637 – Product Inventory Management API
- **Required:** Yes
- **Specification Versions (Either or Both):**
  - **v5.0.0**
    - [TMF637 Product Inventory Management API v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/5.0.0/swagger/TMF637-ProductInventory-v5.0.0.oas.yaml)
  - **v4.0.0**
    - [TMF637 Product Inventory Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/4.0.0/swagger/TMF637_Product_Inventory_Management_API_v4.0.0_swagger.json)

---

## Security and Access Control Conformance

The **Component under test** must comply with the ODA Security Function requirements.  
It must **either**:
- Integrate with and use the **Security Function APIs** listed above (TMF669 and TMF672), **or**
- Be deployed with a valid and correctly configured **`canvasSystemRole`** that satisfies the authorization and access-control policies defined for the ODA Canvas.

Because **TMF669 (Party Role Management)** and **TMF672 (User Role Permission Management)** are explicitly present under `securityFunction.exposedAPIs`, **conformance to these APIs is mandatory**. The component must demonstrate correct role resolution, permission enforcement, and secure access control aligned with these specifications.

---

## Summary

- **Mandatory Dependent APIs:** TMF620, TMF637  
- **Mandatory Exposed APIs (via Security Function):** TMF669, TMF672  
- **Version Conformance Rule:** Where multiple versions are listed, the component may conform to **either or both** versions.

This defines the minimum API conformance baseline for the **ProductOrderCaptureAndValidation** ODA Component.