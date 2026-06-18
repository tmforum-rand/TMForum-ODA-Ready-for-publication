# TMFC055 – ServiceTestManagement – v1.1.0

## Mandatory Exposed APIs (Require Conformance)

- **TMF653 – Service Test Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF653_Service_Test/4.2.0/swagger/TMF653_Service_Test_Management_API_v4.2.0_swagger.json  


## Mandatory Dependent APIs (Require Conformance)

- **TMF638 – Service Inventory Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF638_Service_Inventory/5.0.0/swagger/TMF638-Service_Inventory_Management-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF638_Service_Inventory/4.0.0/swagger/TMF638_Service_Inventory_Management_API_v4.0.0_swagger.json  

*(Conformance MUST support one of the specified versions above.)*


## Security Conformance Requirements

The Component under test must comply with the Security Function requirements defined in the manifest. Specifically, the component must either use the APIs listed under the `securityFunction` or provide a valid `canvasSystemRole`.

In this case, **TMF669 (Party Role Management API)** is present under the Security Function and must therefore be treated as **mandatory for conformance**. The component must ensure that this API is correctly implemented and accessible, or alternatively ensure that a valid `canvasSystemRole` is configured.

The presence of **TMF672 (User Role Permission Management API)** is ignored for conformance purposes.


---

## Canvas Conformance

### Deployment Conformance
Canvas should be Kubernetes based and it is required to have the component deployment in a Kubernetes based environment. Cluster should be running on a supported Kubernetes version. Ensure that the Kubernetes manifests, deployment configurations, and custom resources are compatible with the targeted Kubernetes API version. Compatibility with 3 previous Kubernetes versions must also be considered for backward compatibility. Only trusted container images from reputable sources must be used. [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

The component deployment and the Kubernetes cluster must pass the following tests:

#### Step 0: Basic environment connectivity tests
Kubectl configured correctly  
The configuration must be available and the context must be set to the correct cluster  
Kubectl should return pods in `<namespace of components>` namespace [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

#### Step1: Deployment component tests
Component can be found in namespace `<namespace of components>`  
The component must be found in the established namespace for components  
Component has deployed successfully (status: Complete)  
Test if all exposed APIs are accessible and return status 200  
All exposed APIs defined in the component must provide a valid URL  
Security API must return at least one partyrole with canvas system role defined in component file  
The security API must return at least one partyrole, unless only `canvasSystemRole` is defined  
CTKs for all exposed APIs must execute successfully without errors [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  


### Configuration Conformance

- Helm chart MUST be used to deploy the ODA Component in a Kubernetes cluster  
- Configuration file MUST be in YAML  
- Namespace MUST exist for Canvas and Components  
- Custom Resource Definitions (CRDs) MUST exist for Components and API definitions  
- Canvas operator and component versioning webhook MUST be running [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

#### Step 0: Component file checks
- Component’s helm manifest file must exist at the configured path  
- File must contain valid YAML [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

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
- All mandatory exposed and dependent APIs must be declared  
- API versions must match allowed versions  
- All swagger URLs must be valid and accessible [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  