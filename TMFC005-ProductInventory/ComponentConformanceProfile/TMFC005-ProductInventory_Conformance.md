# Component Conformance Profile
## Component: **ProductInventory (TMFC005)**

---

## Component Under Test

The **Product Inventory** component is responsible for the storage and exposure of products assigned to and used by Parties. It supports creation and lifecycle management of product inventory items, inventory organization, searching and filtering, monitoring and tracking, control, and auditing. A minimum consistency check against Product Catalog information is required on product creation and update.

---

## Mandatory Exposed APIs (Conformance Required)

The following APIs are **exposed by the component** and marked as **required**, therefore **mandatory for conformance**.

### TMF637 – Product Inventory Management API  
**SDO:** TM Forum  

The component **must conform to at least one of the following versions (either or both):**

- **v5.0.0 (OpenAPI)**  
  - Swagger:  
    [TMF637 Product Inventory v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/5.0.0/swagger/TMF637-ProductInventory-v5.0.0.oas.yaml)
  - Resources:
    - `product`: GET, GET /id, POST, PATCH, DELETE

- **v4.0.0 (OpenAPI)**  
  - Swagger:  
    [TMF637 Product Inventory v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/4.0.0/swagger/TMF637_Product_Inventory_Management_API_v4.0.0_swagger.json)
  - Resources:
    - `product`: GET, GET /id, POST, PATCH, DELETE

---

## Mandatory Dependent APIs (Conformance Required)

The following APIs are **dependencies** and are explicitly marked as **required**, therefore **mandatory for conformance**.

### TMF620 – Product Catalog Management API  
**SDO:** TM Forum  

The component **must conform to at least one of the following versions (either or both):**

- **v5.0.0 (OpenAPI)**  
  - Swagger:  
    [TMF620 Product Catalog v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml)
  - Resources:
    - `productOffering`: GET, GET /id  
    - `productOfferingPrice`: GET, GET /id  
    - `productSpecification`: GET, GET /id  

- **v4.1.0 (OpenAPI)**  
  - Swagger:  
    [TMF620 Product Catalog v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json)
  - Resources:
    - `productSpecification`: GET, GET /id  
    - `productOffering`: GET, GET /id  
    - `productOfferingPrice`: GET, GET /id  

---

## Security and Access Control Conformance

The Component under test **must either**:

- Use the APIs listed under the **Security Function**, **or**
- Be deployed with a valid **`canvasSystemRole`** that enforces equivalent authorization and access control.

Because the following security-related TM Forum APIs are explicitly present in the **securityFunction** section, they are considered **mandatory for conformance**, regardless of their individual `required` flags.

### Mandatory Security APIs

#### TMF669 – Party Role Management API  
- **Version:** v4.0.0  
- **Swagger:**  
  [TMF669 Party Role Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

#### TMF672 – User Role & Permission Management API  
The component **must conform to at least one of the following versions (either or both):**

- **v4.0.0 (OpenAPI)**  
  - Swagger:  
    [TMF672 User Role Permission v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **v5.1.0 (OpenAPI)**  
  - Swagger:  
    [TMF672 User Role Permission v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

If these APIs are not directly used at runtime, the component **must demonstrate equivalent security enforcement** through its declared `canvasSystemRole`.

---

## Summary of Mandatory Conformance Scope

- **Exposed APIs (Mandatory):**
  - TMF637 (v4.0.0 and/or v5.0.0)

- **Dependent APIs (Mandatory):**
  - TMF620 (v4.1.0 and/or v5.0.0)

- **Security APIs (Mandatory due to Security Function):**
  - TMF669 (v4.0.0)
  - TMF672 (v4.0.0 and/or v5.1.0)

---