# Component Conformance Profile – ServiceInventory (TMFC008)

## Component Under Test
**Name:** ServiceInventory  
**Component ID:** TMFC008  
**Version:** 1.3.0  
**Status:** Preview  
**Functional Block:** Production  

The Service Inventory component is responsible for the storage, exposure, and lifecycle management of Customer Facing Services (CFS) and Resource Facing Services (RFS), including their relationships to products and resources. It ensures global consistency with the Service Catalog at creation and update time and supports inventory organization, search, monitoring, control, and auditing.

---

## Mandatory Exposed APIs (Requiring Conformance)

The following **exposed APIs** are marked as `required: true` and **must conform** to the referenced specifications.

### TMF638 – Service Inventory Management API
- **API ID:** TMF638  
- **API Name:** service-inventory-management-api  
- **SDO:** TM Forum  
- **Mandatory:** Yes  

**Conformance Requirement:**  
The component **must conform to either or both** of the following API versions.

#### Version v5.0.0
- **Specification:**  
  [TMF638 Service Inventory Management v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF638_Service_Inventory/5.0.0/swagger/TMF638-Service_Inventory_Management-v5.0.0.oas.yaml)

#### Version v4.0.0
- **Specification:**  
  [TMF638 Service Inventory Management v4.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF638_Service_Inventory/4.0.0/swagger/TMF638_Service_Inventory_Management_API_v4.0.0_swagger.json)


---

## Mandatory Dependent APIs (Requiring Conformance)

The following **dependent APIs** are marked as `required: true` and **must conform** to the referenced specifications.

### TMF633 – Service Catalog Management API
- **API ID:** TMF633  
- **API Name:** service-catalog-management-api  
- **SDO:** TM Forum  
- **Mandatory:** Yes  

**Conformance Requirement:**  
The component **must conform** to the following API specification.

#### Version v4.0.0
- **Specification:**  
  [TMF633 Service Catalog Management v4.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF633_Service_Catalog/4.0.0/swagger/TMF633_Service_Catalog_Management_API_v4.0.0_swagger.json)

---

## Security Function Conformance Requirements

The Component Under Test **must either**:
1. Use the APIs listed under the **Security Function**, **or**
2. Be deployed with a valid `canvasSystemRole`.

In this component definition, **TMF669 (Party Role Management API)** and **TMF672 (User Role Permission Management API)** are exposed under the **Security Function**. As security-related APIs are explicitly present, they are treated as **mandatory for conformance**.

### Mandatory Security APIs

#### TMF669 – Party Role Management API
- **Mandatory for Security Conformance**
- **Version v4.0.0**
- **Specification:**  
  [TMF669 Party Role Management v4.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

#### TMF672 – User Role Permission Management API
- **Mandatory for Security Conformance**
- **Conformance may be to either or both versions below**

**Version v4.0.0**
- **Specification:**  
  [TMF672 User Role Permission Management v4.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

**Version v5.1.0**
- **Specification:**  
  [TMF672 User Role Permission Management v5.1.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

If the component does not directly expose or consume these security APIs, it **must** demonstrate that a valid `canvasSystemRole` is configured and enforced to satisfy the ODA security requirements.

---