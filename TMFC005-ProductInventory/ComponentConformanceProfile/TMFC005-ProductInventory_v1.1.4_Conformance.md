# Component Conformance Profile
## Component: ProductInventory (TMFC005)

### Component Overview
The **Product Inventory** component is responsible for the storage and exposure of products that are assigned to and used by Parties. It supports creation, organization, searching, monitoring, tracking, control, and auditing of product inventory items. A minimum consistency check with Product Catalog information is required on creation or update of inventory items. The component sits within the **CoreCommerce** functional block and aligns with TM Forum eTOM, Functional Framework, and SID mappings as defined in the component metadata.

---

## Mandatory Exposed APIs (Conformance Required)

The following **exposed APIs** are marked as mandatory and **must conform** to at least one of the listed specifications.

### TMF637 – Product Inventory Management API
Conformance is required to **either or both** of the following versions:

- **v5.0.0 (OpenAPI)**  
  [TMF637 Product Inventory v5.0.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/5.0.0/swagger/TMF637-ProductInventory-v5.0.0.oas.yaml)

- **v4.0.0 (OpenAPI)**  
  [TMF637 Product Inventory v4.0.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/4.0.0/swagger/TMF637_Product_Inventory_Management_API_v4.0.0_swagger.json)

---

## Mandatory Dependent APIs (Conformance Required)

The following **dependent APIs** are marked as mandatory and **must conform** to at least one of the listed specifications.

### TMF620 – Product Catalog Management API
Conformance is required to **either or both** of the following versions:

- **v5.0.0 (OpenAPI)**  
  [TMF620 Product Catalog v5.0.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml)

- **v4.1.0 (OpenAPI)**  
  [TMF620 Product Catalog v4.1.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json)

---

## Mandatory Security APIs (Conformance Required)

Because security APIs are explicitly defined under the **Security Function**, the component under test **must either**:
- Use the APIs listed under the Security Function **and conform to them**, **or**
- Operate with a valid `canvasSystemRole` that enforces equivalent authorization and access control policies.

As TM Forum security APIs are present, the following **must be treated as mandatory for conformance**:

### TMF669 – Party Role Management API
- **v4.0.0 (OpenAPI)**  
  [TMF669 Party Role v4.0.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 – User Role Permission Management API
Conformance is required to **either or both** of the following versions:

- **v4.0.0 (OpenAPI)**  
  [TMF672 User Role Permission v4.0.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **v5.1.0 (OpenAPI)**  
  [TMF672 User Role Permission v5.1.0 OpenAPI Specification](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary of Mandatory Conformance Scope

- **Mandatory Exposed APIs**: TMF637  
- **Mandatory Dependent APIs**: TMF620  
- **Mandatory Security APIs**: TMF669, TMF672  

Conformance testing for this component **must validate** adherence to the above APIs and versions, subject to the “either or both” version rules where multiple specifications are provided.