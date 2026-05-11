# Component Conformance Profile — ServiceOrderManagement (TMFC007) v2.1.0

## Component Under Test
**Component ID:** TMFC007  
**Name:** ServiceOrderManagement  
**Version:** 2.1.0  
**Status:** preview  
**Publication date:** 2024-02-23  
**Functional Block:** Production  

This component is the entry point to the Production Domain and oversees delivery of Customer-Facing-Service (CFS) resources. It exposes the **ServiceOrder** API and orchestrates CFS delivery, identifying possible RFS using catalog and technical inventory, selecting resources and requesting Resource Order Management (ROM) updates to deliver the CFS.

---

## Mandatory Exposed APIs (Conformance Required)
The following APIs are listed under `spec.coreFunction.exposedAPIs` with `required: true` and **must** be conformed to by the component under test.

### TMF641 — service-ordering-management-api (Required)
- **API ID:** TMF641  
- **Name:** service-ordering-management-api  
- **Required:** true  
- **Conformance target (specification):**
  - **v4.2.0 (openapi)** — [TMF641 Service Ordering v4.2.0 (beta) swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/Beta/TMF641_Service_Ordering/4.2.0/swagger/TMF641_Service_Ordering_v4.2.0_beta_swagger.json)

---

## Mandatory Dependent APIs (Conformance Required)
The following APIs are listed under `spec.coreFunction.dependentAPIs` with `required: true` and **must** be conformed to by the component under test.

### TMF633 — service-catalog-management-api (Required)
- **API ID:** TMF633  
- **Name:** service-catalog-management-api  
- **Required:** true  
- **Conformance target (specification):**
  - **v4.0.0 (openapi)** — [TMF633 Service Catalog Management v4.0.0 swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF633_Service_Catalog/4.0.0/swagger/TMF633_Service_Catalog_Management_API_v4.0.0_swagger.json)

### TMF638 — service-inventory-management-api (Required)
- **API ID:** TMF638  
- **Name:** service-inventory-management-api  
- **Required:** true  
- **Conformance target (specification):**  
  Two versions are declared; conformance may be asserted to **either** version **or both**:
  - **v5.0.0 (openapi)** — [TMF638 Service Inventory v5.0.0 OAS](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF638_Service_Inventory/5.0.0/swagger/TMF638-Service_Inventory_Management-v5.0.0.oas.yaml)
  - **v4.0.0 (openapi)** — [TMF638 Service Inventory v4.0.0 swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF638_Service_Inventory/4.0.0/swagger/TMF638_Service_Inventory_Management_API_v4.0.0_swagger.json)

---

## Security Function Requirements (Mandatory)
The component declares a `securityFunction.canvasSystemRole` and also declares Security Function exposed APIs. The component under test must **either** (a) use the APIs listed under the Security Function **or** (b) have a valid `canvasSystemRole` as declared in the component spec (`{{ .Values.security.controllerRole }}`).

Additionally, because **TMF669** and **TMF672** are present under `spec.securityFunction.exposedAPIs`, they are treated as **mandatory for conformance** (regardless of their `required` flag in the YAML).

### TMF669 — partyrole (Mandatory due to Security Function presence)
- **API ID:** TMF669  
- **Name:** partyrole  
- **Conformance target (specification):**
  - **v4.0.0 (openapi)** — [TMF669 Party Role Management v4.0.0 swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 — user-role-permission-management-api (Mandatory due to Security Function presence)
- **API ID:** TMF672  
- **Name:** user-role-permission-management-api  
- **Conformance target (specification):**  
  Two versions are declared; conformance may be asserted to **either** version **or both**:
  - **v4.0.0 (openapi)** — [TMF672 User Role Permission v4.0.0 swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - **v5.1.0 (openapi)** — [TMF672 User Role Permission v5.1.0 OAS](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary of Mandatory Conformance Targets

### Mandatory Exposed
- **TMF641** — v4.2.0

### Mandatory Dependent
- **TMF633** — v4.0.0  
- **TMF638** — **either** v5.0.0 **or** v4.0.0 (**or both**)

### Mandatory Security (by rule)
- **TMF669** — v4.0.0  
- **TMF672** — **either** v4.0.0 **or** v5.1.0 (**or both**)