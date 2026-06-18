# TMFC002 – ProductOrderCaptureAndValidation – v3.0.0

## Mandatory Exposed APIs (Require Conformance)

- **TMF663 – Shopping Cart Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF663_Shopping_Cart/5.0.0/swagger/TMF663-Shopping_Cart-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF663_Shopping_Cart/4.0.0/swagger/TMF663_Shopping_Cart_Management_API_v4.0.0_swagger.json  

*(Conformance MUST support one of the specified versions above.)*


## Mandatory Dependent APIs (Require Conformance)

- **TMF620 – Product Catalog Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/5.0.0/swagger/TMF620-Product_Catalog_Management-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF620_Product_Catalog/4.1.0/swagger/TMF620_Product_Catalog_Management_API_v4.1.0_swagger.json  

- **TMF637 – Product Inventory Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/5.0.0/swagger/TMF637-ProductInventory-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF637_Product_Inventory/4.0.0/swagger/TMF637_Product_Inventory_Management_API_v4.0.0_swagger.json  

*(Conformance MUST support one of the specified versions for each API above.)*


## Security Conformance Requirements

The Component under test must comply with the Security Function requirements defined in the manifest. Specifically, the component must either expose and use the Security APIs defined under the `securityFunction`, or provide a valid `canvasSystemRole`.

In this case, **TMF669 (Party Role Management API)** is present under the Security Function and must therefore be treated as **mandatory for conformance**. The component must ensure that this API is correctly implemented and accessible, or alternatively ensure that a valid `canvasSystemRole` is configured.

The presence of **TMF672 (User Role Permission Management API)** is ignored for conformance purposes.


### Mandatory Security API

- **TMF669 – Party Role Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json  


---

## Canvas Conformance

### Deployment Conformance
Canvas should be Kubernetes based and it is required to have the component deployment in a Kubernetes based environment. Cluster should be running on a supported Kubernetes version. Ensure that the Kubernetes manifests, deployment configurations, and custom resources are compatible with the targeted Kubernetes API version. Compatibility with 3 previous Kubernetes versions must also be considered for backward compatibility. Only trusted container images from reputable sources must be used.   

The component deployment and the Kubernetes cluster must pass the following tests:

#### Step 0: Basic environment connectivity tests
- Kubectl configured correctly  
- The configuration must be available and the context must be set to the correct cluster  
- Kubectl should return pods in `<namespace of components>` namespace   

#### Step1: Deployment component tests
- Component must be found in the established namespace  
- Component must have deployed successfully (status: Complete)  
- All exposed APIs defined in the component must be accessible and return HTTP 200  
- All exposed APIs must provide valid URLs  
- Security API must return at least one partyrole with canvas system role defined, unless only `canvasSystemRole` is provided  
- CTKs for all exposed APIs must execute successfully without errors   


### Configuration Conformance

- Helm chart MUST be used to deploy the ODA Component  
- Configuration file MUST be in YAML  
- Namespace MUST exist for Canvas and Components  
- Custom Resource Definitions (CRDs) MUST exist for Components and API definitions  
- Canvas operator and component versioning webhook MUST be running   

#### Step 0: Component file checks
- Helm manifest file must exist at the configured path  
- File must contain valid YAML   

#### Step 1: Component manifest checks
- Must contain a document of kind `Component`  
- API version must be supported (`oda.tmforum.org/v1`)  
- Must include `metadata` with name and labels  
- Must include `spec`  
- `coreFunction` must include exposed and dependent APIs  
- Must include a `security` function  
- Must include either `canvasSystemRole` or a partyRole API  
- All resources must be labelled with the component name  
- Component ID must match the standard specification  
- All mandatory exposed and dependent APIs must be declared in the component manifest  
- API versions must match allowed versions in the standard specification  
- All swagger URLs must be valid and accessible   
```
