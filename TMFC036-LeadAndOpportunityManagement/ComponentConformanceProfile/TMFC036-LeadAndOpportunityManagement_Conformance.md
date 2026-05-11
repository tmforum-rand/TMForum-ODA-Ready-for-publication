# Component Conformance Profile
## LeadAndOpportunityManagement (TMFC036)

This document defines the **API conformance requirements** for the **LeadAndOpportunityManagement** component, based **exclusively on the provided Component YAML**.

---

## 1. Mandatory Exposed APIs (Requiring Conformance)

The following **exposed APIs** are marked as `required: true` and **MUST be implemented and conformant**.

### TMF699 – Sales Management API
- **API ID:** TMF699  
- **Name:** sales-management-api  
- **Standard:** TM Forum  
- **Required:** ✅ Yes  
- **Version(s):**  
  - **v4.0.0** (OpenAPI)
- **Swagger / OpenAPI Specification:**  
  - [TMF699 Sales Management API v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF699_Sales/4.0.0/swagger/TMF699_Sales_Management_API_v4.0.0_swagger.json)

---

## 2. Mandatory Dependent APIs (Requiring Conformance)

All APIs listed under `coreFunction.dependentAPIs` are marked as `required: false`.

✅ **Result:**  
- **There are no mandatory dependent APIs** requiring conformance for this component.

Optional dependent APIs (TMF632, TMF669, TMF620, TMF651, TMF648, TMF622, TMF701) **do not impose conformance obligations** unless explicitly mandated by an implementation profile.

---

## 3. API Version Conformance Rules

Where **multiple versions of the same API** are referenced in the component definition:
- **Conformance MAY be achieved by implementing either version or both versions**, unless explicitly stated as mandatory.

This applies, for example, to:
- TMF632 (v4.0.0, v5.0.0)  
- TMF669 (v4.0.0, v5.0.0)  
- TMF620 (v4.1.0, v5.0.0)  
- TMF622 (v4.0.0, v5.0.0)  
- TMF672 (v4.0.0, v5.1.0)

---

## 4. Security Function Conformance Requirements

The **Component Under Test** MUST satisfy **one** of the following security conditions:

1. **Use a valid `canvasSystemRole`** as defined by the ODA Canvas security model  
   **OR**
2. **Implement and conform to the Security Function APIs** defined below

### Mandatory Security APIs

Because the following APIs are explicitly declared under `securityFunction.exposedAPIs`, they are **MANDATORY for conformance**.

#### TMF669 – Party Role Management API
- **API ID:** TMF669  
- **Version:** v4.0.0  
- **Swagger / OpenAPI Specification:**  
  - [TMF669 Party Role Management API v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

#### TMF672 – User Role & Permission Management API
- **API ID:** TMF672  
- **Version(s):**  
  - v4.0.0  
    - [TMF672 User Role Permission API v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - v5.1.0  
    - [TMF672 User Role Permission API v5.1.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

✅ **Conformance Requirement:**  
If the component does **not** rely solely on a valid `canvasSystemRole`, it **MUST implement and conform** to **TMF669** and **TMF672** (any one supported version per API is sufficient).



