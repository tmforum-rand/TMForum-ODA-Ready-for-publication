# TMFC030 – BillGenerationManagement – v2.1.0

## Mandatory Exposed APIs (Require Conformance)

- **TMF678 – Customer Bill Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF678_Customer_Bill/5.0.0/swagger/TMF678-CustomerBill-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF678_Customer_Bill/4.0.0/swagger/TMF678_Customer_Bill_Management_API_v4.0.0_swagger.json  

*(Conformance MUST support one of the specified versions above.)*


## Mandatory Dependent APIs (Require Conformance)

- **TMF666 – Account Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF666_Account/5.0.0/swagger/TMF666-Account_Management-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF666_Account/4.0.0/swagger/TMF666_Account_Management_API_v4.0.0_swagger.json  

- **TMF632 – Party Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF632_Party/5.0.0/swagger/TMF632-Party_Management-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF632_Party/4.0.0/swagger/TMF632_Party_Management_API_v4.0.0_swagger.json  

- **TMF669 – Party Role Management API**  
  Swagger:  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/5.0.0/swagger/TMF669-Party_Role_Management-v5.0.0.oas.yaml  
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json  

*(Conformance MUST support one of the specified versions for each API above.)*


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
The purpose of this test is to check if the kubectl is configured correctly. The configuration must be available and the context must be set to the correct cluster  
Kubectl should return pods in `<namespace of components>` namespace [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

#### Step1: Deployment component tests
Component can be found in namespace: `<namespace of components>`  
The component must be found in the established namespace for components  
Component has deployed successfully (status: Complete)  
The component must have deployed successfully and its status must be complete  
Test if all exposed api are accessible and return status is 200  
All exposed apis defined in the component must provide a valid url  
Security api must return at least one partyrole with canvas system role defined in component file  
The security api must return at least one partyrole, unless only canvasSystemRole is defined  
CTKs for all exposed apis have been executed successfully  
This step configures the api ctks. There must be no errors during the process [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

### Configuration Conformance

Helm chart MUST be used to deploy the ODA Component in a Kubernetes cluster and should contain all necessary resources.  
Configuration file MUST in YAML.  
Namespace MUST exist for Canvas and Components.  
Custom resource Definition (CRD) MUST exist for Components and API definitions.  
Canvas operator and Canvas component versioning webhook MUST be running. [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

The deployed component must pass the following configuration checks:

#### Step 0: Component file checks
Component’s helm manifest file must exist at the path specified in ctkconfig.json – as retrieved from Kubernetes  
File contains valid YAML  
Component manifest must be valid YAML [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  

#### Step 1: Component manifest checks
Document of kind ‘Component’ is found  
Component manifest must contain a document of kind: Component  
Component api version is within supported versions  
Component manifest must contain a supported api version (oda.tmforum.org/v1)  
Component has metadata field  
Component manifest must contain a metadata field  
Component metadata has name and labels  
Component metadata must contain name and label fields  
Component has spec field  
Component manifest must contain a spec field  
Spec has coreFunction with exposed and dependent APIs  
Component spec must contain a coreFunction field with exposedAPIs and dependentAPIs  
Spec has security function  
Component spec must contain a security field  
Security function has canvas system role or exposed apis  
Security function must contain a canvas system role (string) or expose a partyRole API  
All resources are labelled with the component name  
All resources in the component manifest must be labelled with the component name  
Standard component specification exists in the component ctk  
Component ID from the manifest of component under test matches the standard specification  
Component manifest ID must match the ID in the standard component specification  
Exposed Apis defined in standard component specification must be specified in component manifest  
All mandatory Exposed APIs defined in the standard component specification must be specified in the component manifest  
Exposed API versions in component manifest must match one of the allowed versions in standard specification  
For each exposed API, the deployed version must exist in the standard component specification  
Dependent APIs defined in the standard component specification must be specified in component manifest  
All mandatory Dependent APIs in the standard component specification must also be declared in the component manifest  
Dependent API versions in component manifest must match one of the allowed versions in standard specification  
For each dependent API, the deployed version must exist in the standard component specification  
All swagger urls must be valid and accessible and version fields  
All swagger urls must be valid and accessible [1](https://tmf365-my.sharepoint.com/personal/hvaughan_tmforum_org1/Documents/ODA%20Component%20and%20Canvas/ODA%20Conformance/TMForum_ODA_Component_Conformance/Conformance%20Profiles/Static%20content%2020260618.txt)  