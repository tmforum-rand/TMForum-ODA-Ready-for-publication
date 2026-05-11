# Component Conformance Profile
## Component Under Test: PartyManagement (TMFC028)

### Overview
This Component Conformance Profile defines the mandatory API conformance requirements for the **PartyManagement** component, based **only** on the provided ODA Component YAML. The component is responsible for the capture, validation, and lifecycle management of Parties (Individuals and Organizations) and their related entities.

---

## Mandatory Exposed APIs (Conformance Required)

The following **exposed APIs** are marked as `required: true` and **must conform**.  
Where multiple versions are listed, conformance is **either version or both**, as explicitly supported by the component.

### TMF632 – Party Management API
- **Conformance**: Mandatory  
- **Supported Versions**:
  - **v5.0.0**
    - Swagger:  
      [TMF632 Party Management v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF632_Party/5.0.0/swagger/TMF632-Party_Management-v5.0.0.oas.yaml)
  - **v4.0.0**
    - Swagger:  
      [TMF632 Party Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF632_Party/4.0.0/swagger/TMF632_Party_Management_API_v4.0.0_swagger.json)

Conformance may be demonstrated against **v4.0.0, v5.0.0, or both**.

---

## Mandatory Dependent APIs (Conformance Required)

The following **dependent APIs** are marked as `required: true` and **must conform**.

### TMF669 – Party Role Management API
- **Conformance**: Mandatory  
- **Supported Versions**:
  - **v5.0.0**
    - Swagger:  
      [TMF669 Party Role Management v5.0.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/5.0.0/swagger/TMF669-Party_Role_Management-v5.0.0.oas.yaml)
  - **v4.0.0**
    - Swagger:  
      [TMF669 Party Role Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

Conformance may be demonstrated against **v4.0.0, v5.0.0, or both**.

---

## Mandatory Security Function APIs

The component declares a **Security Function**. The Component under test **must either**:
- Integrate with the APIs listed under the **Security Function**, **or**
- Be deployed with a valid and correctly configured `canvasSystemRole`.

Because **TMF669** and **TMF672** are explicitly present in the Security Function, they are considered **mandatory for conformance** unless a valid `canvasSystemRole` is used.

### TMF669 – Party Role Management API (Security Function)
- **Conformance**: Mandatory (unless covered by valid `canvasSystemRole`)
- **Supported Version**:
  - **v4.0.0**
    - Swagger:  
      [TMF669 Party Role Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

### TMF672 – User Role Permission Management API
- **Conformance**: Mandatory (unless covered by valid `canvasSystemRole`)
- **Supported Versions**:
  - **v4.0.0**
    - Swagger:  
      [TMF672 User Role Permission Management v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)
  - **v5.1.0**
    - Swagger:  
      [TMF672 User Role Permission Management v5.1.0 OpenAPI](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

Conformance may be demonstrated against **v4.0.0, v5.1.0, or both**.

---

## Summary of Mandatory Conformance
- **Exposed API**: TMF632 (Party Management)
- **Dependent API**: TMF669 (Party Role Management)
- **Security APIs**: TMF669 and TMF672 (unless a valid `canvasSystemRole` is used)

Only the APIs explicitly marked as mandatory in the YAML, or required by Security Function rules, are included in this profile.
