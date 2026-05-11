# Component Conformance Profile
**Component:** ResourceInventory (TMFC012)  
**Version:** 2.3.0  
**Status:** Preview

---

## Mandatory Exposed APIs (Conformance Required)

The following APIs are exposed by the Component and are marked as **required**, therefore **conformance is mandatory**.

### TMF639 – Resource Inventory Management API
- **API ID:** TMF639  
- **Role:** Exposed API  
- **Required:** Yes  
- **Conformance Versions:**
  - **v4.0.0**
- **Swagger / OpenAPI:**
  - [TMF639 Resource Inventory Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF639_Resource_Inventory/4.0.0/swagger/TMF639_Resource_Inventory_Management_API_v4.0.0_swagger.json)

---

## Mandatory Dependent APIs (Conformance Required)

The following APIs are listed as **dependent** and marked as **required**, therefore **conformance is mandatory**.

### TMF634 – Resource Catalog Management API
- **API ID:** TMF634  
- **Role:** Dependent API  
- **Required:** Yes  
- **Conformance Versions:**  
  Conformance may be achieved by implementing **either or both** of the following versions:
  - **v5.0.0**
    - [TMF634 Resource Catalog Management v5.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF634_Resource_Catalog/5.0.0/swagger/TMF634-Resource_Catalog_Management-v5.0.0.oas.yaml)
  - **v4.1.0**
    - [TMF634 Resource Catalog Management v4.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF634_Resource_Catalog/4.1.0/swagger/TMF634_Resource_Catalog_Management_API_v4.1.0_swagger.json)

---

## Security Function Conformance Requirements

The Component under test **must either**:
1. Integrate with the APIs listed under the **Security Function**, **or**
2. Be deployed with a valid `canvasSystemRole` as defined in the Security Function configuration.

Because **TMF669** and **TMF672** are explicitly present under the Security Function, they are considered **mandatory for conformance**, regardless of their individual `required` flags.

### TMF669 – Party Role Management API
- **API ID:** TMF669  
- **Role:** Security Function API  
- **Mandatory for Conformance:** Yes  
- **Conformance Versions:**
  - **v4.0.0**
- **Swagger / OpenAPI:**
  - [TMF669 Party Role Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 – User Role Permission Management API
- **API ID:** TMF672  
- **Role:** Security Function API  
- **Mandatory for Conformance:** Yes  
- **Conformance Versions:**  
  Conformance may be achieved by implementing **either or both** of the following versions:
  - **v4.0.0**
    - [TMF672 User Role Permission Management v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - **v5.1.0**
    - [TMF672 User Role Permission Management v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary of Mandatory Conformance Scope

- **Mandatory Exposed API**
  - TMF639 (v4.0.0)

- **Mandatory Dependent API**
  - TMF634 (v5.0.0 and/or v4.1.0)

- **Mandatory Security APIs**
  - TMF669 (v4.0.0)
  - TMF672 (v4.0.0 and/or v5.1.0)

Conformance to this Component requires successful validation against all APIs listed above, unless security integration is satisfied exclusively through a valid `canvasSystemRole`.