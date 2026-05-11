# Component Conformance Profile
## Component: WorkforceManagement (TMFC046)

### Mandatory Exposed APIs (Core Function)

The following exposed APIs are **mandatory for conformance** because they are marked as `required: true` in the Component definition.

#### TMF646 – Appointment Management API  
The Component under test **MUST conform to at least one** of the following specifications:

- **v4.0.0 (OpenAPI)**  
  - [TMF646 Appointment Management API v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF646_Appointment/4.0.0/swagger/TMF646_Appointment_Management_API_v4.0.0_swagger.json)

---

### Mandatory Dependent APIs (Core Function)

There are **no mandatory dependent APIs** defined for the Core Function.  
All dependent APIs (TMF632, TMF669, TMF701) are marked as `required: false` and therefore **do not require conformance**.

---

### Mandatory Security Function APIs

The Component under test **MUST either**:
- Use the APIs listed under the **Security Function**, **or**
- Have a valid and correctly assigned `canvasSystemRole`.

Because the Security Function explicitly exposes **TMF669** and **TMF672**, these APIs are considered **mandatory for conformance**, regardless of their individual `required` flags.

#### TMF669 – Party Role Management API  
The Component under test **MUST conform to** the following specification:

- **v4.0.0 (OpenAPI)**  
  - [TMF669 Party Role Management API v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json)

#### TMF672 – User Role Permission Management API  
The Component under test **MUST conform to one or both** of the following specifications:

- **v4.0.0 (OpenAPI)**  
  - [TMF672 User Role Permission Management API v4.0.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/4.0.0/swagger/TMF672_User_Role_Permission_Management_API_v4.0.0_swagger.json)

- **v5.1.0 (OpenAPI)**  
  - [TMF672 User Role Permission Management API v5.1.0 Swagger](https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF672_User_Role_Permission/5.1.0/swagger/TMF672-User_Role_Permission_Management_API-v5.1.0.oas.yaml)

---

### Summary

For this Component to be considered conformant:
- **TMF646** is mandatory as a Core Function exposed API.
- **TMF669** and **TMF672** are mandatory due to their presence in the Security Function.
- No Core Function dependent APIs are mandatory.
- The Component must either integrate with the mandatory Security Function APIs or operate under a valid `canvasSystemRole`.