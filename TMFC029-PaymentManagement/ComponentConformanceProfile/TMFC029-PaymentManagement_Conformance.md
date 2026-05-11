# Component Conformance Profile
## Component: PaymentManagement (TMFC029)  
**Version:** 1.3.2  
**Status:** Preview  

---

## Mandatory Exposed APIs (Requiring Conformance)

The following exposed APIs are marked as **required: true** in the Component specification and therefore **MUST** be implemented and conformant.

### TMF670 – Payment Method Management API
- **Required:** Yes  
- **Specification Version:** v4.0.0  
- **API Type:** OpenAPI  
- **Swagger:**  
  - [TMF670 Payment Method Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF670_Payment_Method/4.0.0/swagger/TMF670_Payment_Method_Management_API_v4.0.0_swagger.json)

### TMF676 – Payment Management API
- **Required:** Yes  
- **Specification Version:** v4.0.0  
- **API Type:** OpenAPI  
- **Swagger:**  
  - [TMF676 Payment Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF676_Payment/4.0.0/swagger/TMF676_Payment_Management_API_v4.0.0_swagger.json)

---

## Mandatory Dependent APIs (Requiring Conformance)

All dependent APIs listed under the Core Function are marked as **required: false**.  
✅ **There are no mandatory dependent APIs requiring conformance** for this component.

---

## Mandatory Security APIs and Security Conformance

The PaymentManagement component defines a **Security Function** with a `canvasSystemRole`.  
The Component under test **MUST** either:

- Correctly integrate with the security APIs listed below **OR**
- Be deployed with a valid and authorized `canvasSystemRole`.

Because **TMF669** and **TMF672** are explicitly present under `securityFunction.exposedAPIs`, they are considered **mandatory for conformance**, regardless of their `required` flag.

### TMF669 – Party Role Management API
- **Mandatory for Security Conformance**
- **Specification Version:** v4.0.0  
- **API Type:** OpenAPI  
- **Swagger:**  
  - [TMF669 Party Role Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 – User Role Permission Management API
- **Mandatory for Security Conformance**
- **API Type:** OpenAPI  
- **Conformance Versions:** **Either or Both**
  - **v4.0.0**  
    - [TMF672 User Role Permission Management API v4.0.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - **v5.1.0**  
    - [TMF672 User Role Permission Management API v5.1.0](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

## Summary

For conformance, the PaymentManagement component **MUST** implement:
- **TMF670** and **TMF676** as mandatory exposed APIs.
- **TMF669** and **TMF672** as mandatory security APIs **or** operate with a valid `canvasSystemRole`.
- No dependent APIs are mandatory for conformance.

This profile defines the minimum API surface required to claim conformance for the PaymentManagement ODA Component.