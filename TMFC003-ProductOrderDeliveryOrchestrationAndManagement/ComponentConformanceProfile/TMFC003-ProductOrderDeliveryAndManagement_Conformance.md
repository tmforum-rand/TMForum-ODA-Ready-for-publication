# Component Conformance Profile
**Component Under Test:** ProductOrderDeliveryOrchestrationAndManagement (TMFC003)  
**Version:** 1.2.1  
**Status:** Preview  

---

## Mandatory Exposed APIs (Conformance Required)

The following **exposed APIs** are marked as `required: true` and **must conform**.  
Where multiple versions are listed, conformance may be achieved by implementing **either version** unless stated otherwise.

### TMF622 – Product Ordering Management API
- **Conformance:** Required  
- **Versions:** v5.0.0 **or** v4.0.0  

**Swagger specifications:**
- [TMF622 Product Ordering v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF622_Product_Ordering/5.0.0/swagger/TMF622-ProductOrdering-v5.0.0.oas.yaml)
- [TMF622 Product Ordering v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF622_Product_Ordering/4.0.0/swagger/TMF622_Product_Ordering_Management_API_v4.0.0_swagger.json)

---

## Mandatory Dependent APIs (Conformance Required)

The following **dependent APIs** are marked as `required: true` and **must be supported** by the component under test.  
Where multiple versions are listed, conformance may be achieved by implementing **either version**.

### TMF620 – Product Catalog Management API
- **Conformance:** Required  
- **Versions:** v5.0.0 **or** v4.1.0  

**Swagger specifications:**
- [TMF620 Product Catalog v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml)
- [TMF620 Product Catalog v4.1.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json)

---

### TMF622 – Product Ordering Management API
- **Conformance:** Required  
- **Versions:** v5.0.0 **or** v4.0.0  

**Swagger specifications:**
- [TMF622 Product Ordering v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF622_Product_Ordering/5.0.0/swagger/TMF622-ProductOrdering-v5.0.0.oas.yaml)
- [TMF622 Product Ordering v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF622_Product_Ordering/4.0.0/swagger/TMF622_Product_Ordering_Management_API_v4.0.0_swagger.json)

---

### TMF637 – Product Inventory Management API
- **Conformance:** Required  
- **Versions:** v5.0.0 **or** v4.0.0  

**Swagger specifications:**
- [TMF637 Product Inventory v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/5.0.0/swagger/TMF637-ProductInventory-v5.0.0.oas.yaml)
- [TMF637 Product Inventory v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/4.0.0/swagger/TMF637_Product_Inventory_Management_API_v4.0.0_swagger.json)

---

### TMF641 – Service Ordering Management API
- **Conformance:** Required  
- **Versions:** v4.2.0  

**Swagger specification:**
- [TMF641 Service Ordering v4.2.0 Swagger (Beta)](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/Beta/TMF641_Service_Ordering/4.2.0/swagger/TMF641_Service_Ordering_v4.2.0_beta_swagger.json)

---

## Mandatory Security APIs (Conformance Required)

The component under test **must either**:
- Implement and use the APIs listed under the **Security Function**, **or**
- Be deployed with a valid and correctly configured `canvasSystemRole`.

In this component, **TMF669** and **TMF672** are explicitly defined under the `securityFunction`. As a result, they are considered **mandatory for conformance**.

### TMF669 – Party Role Management API
- **Conformance:** Required  
- **Version:** v4.0.0  

**Swagger specification:**
- [TMF669 Party Role Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

---

### TMF672 – User Role & Permission Management API
- **Conformance:** Required  
- **Versions:** v4.0.0 **or** v5.1.0  

**Swagger specifications:**
- [TMF672 User Role Permission v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
- [TMF672 User Role Permission v5.1.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary

For this component to be considered **conformant**, it must:
- Expose **TMF622** as a mandatory exposed API.
- Depend on and correctly integrate **TMF620**, **TMF622**, **TMF637**, and **TMF641**.
- Enforce security through **TMF669** and **TMF672**, or alternatively operate with a valid `canvasSystemRole` configuration.

Only the APIs and versions listed above are in scope for this conformance profile.