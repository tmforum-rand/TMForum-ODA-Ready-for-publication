# Component Conformance Profile — FaultManagement (TMFC043)

## Component Under Test
**Name:** FaultManagement  
**Component ID:** TMFC043  
**Version:** 1.1.0  
**Status:** Preview  
**Functional Block:** Production  

The Fault Management component is responsible for identifying, diagnosing, and resolving issues that prevent communication resources and their overlaying services from functioning correctly. Its scope includes managing active alarms and problem candidates at the ODA Production layer, enhancing alarm data to improve actionability, correlating symptoms versus root causes, and enabling automated or autonomous corrective actions.

---

## Mandatory Exposed APIs (Requiring Conformance)

### TMF642 — Alarm Management API (Mandatory)

The component **MUST** conform to the TMF642 Alarm Management API. Two API versions are declared; conformance is valid for **either or both** versions.

- **TMF642 v5.0.0**
  - **Specification:**  
    [TMF642 Alarm Management v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF642_Alarm/5.0.0/swagger/TMF642_Alarm_v5.0.1.oas.yaml)

- **TMF642 v4.0.0**
  - **Specification:**  
    [TMF642 Alarm Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF642_Alarm/4.0.0/swagger/TMF642_Alarm_Management_API_v4.0.0_swagger.json)

---

## Optional Exposed APIs (Not Requiring Conformance)

The following exposed APIs are declared as optional and **do not require conformance** for this component profile:

- **TMF656 — Service Problem Management API**
  - v5.0.0  
    [TMF656 Service Problem Management v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF656_Service_Problem/5.0.0/swagger/TMF656-Service_Problem_Management-v5.0.0.oas.yaml)
  - v4.0.0  
    [TMF656 Service Problem Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF656_Service_Problem/4.0.0/swagger/TMF656_Service_Problem_Management_API_v4.0.0_swagger.json)

- **TMF701 — Process Flow Management API**
  - v4.1.0  
    [TMF701 Process Flow Management v4.1.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/Beta/TMF701_Process_Flow/4.1.0/swagger/TMF701_Process_Flow_Management_API_v4.1.0_beta_swagger.json)

---

## Mandatory Dependent APIs (Requiring Conformance)

- **None**

No dependent APIs are declared as mandatory in the component specification.

---

## Security Function Conformance Requirements

The Component under test **MUST** either:
- Expose and use the APIs listed under the **Security Function**, **or**
- Operate with a valid `canvasSystemRole` as defined by the `securityFunction.canvasSystemRole` attribute.

In this component, the following Security Function APIs are explicitly declared and therefore **MUST be treated as mandatory for conformance**:

### TMF669 — Party Role Management API
- **Version:** v4.0.0  
- **Specification:**  
  [TMF669 Party Role Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 — User Role Permission Management API
Conformance is valid for **either or both** of the following versions:

- **TMF672 v4.0.0**  
  [TMF672 User Role Permission Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **TMF672 v5.1.0**  
  [TMF672 User Role Permission Management v5.1.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

If the component does not directly expose and consume these security APIs, it **MUST** demonstrate the presence and correct configuration of a valid `canvasSystemRole` that provides equivalent authorization and access control capabilities.

---