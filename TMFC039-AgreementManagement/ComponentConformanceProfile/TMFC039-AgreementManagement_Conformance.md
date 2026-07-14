# TMFC039 – AgreementManagement – v1.2.0

## Mandatory Exposed APIs (Require Conformance)

- **TMF651 – Agreement Management API**
  Swagger:
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF651_Agreement/4.0.0/swagger/TMF651_Agreement_Management_API_v4.0.0_swagger.json

*(Conformance MUST support one of the specified versions above.)*

## Mandatory Dependent APIs (Require Conformance)

- **TMF632 – Party Management API**
  Swagger:
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF632_Party/5.0.0/swagger/TMF632-Party_Management-v5.0.0.oas.yaml
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF632_Party/4.0.0/swagger/TMF632_Party_Management_API_v4.0.0_swagger.json

*(Conformance MUST support one of the specified versions above.)*

## Security Conformance Requirements

The Component under test must comply with the Security Function requirements defined in the manifest.
Specifically, the component must either expose and use the relevant Security APIs defined under the
`securityFunction`, or provide a valid `canvasSystemRole`.

In this case, **TMF669 (Party Role Management API)** is present under the Security Function and must
therefore be treated as **mandatory for conformance**, regardless of its `required: false` flag as written in
the manifest's `securityFunction` block. **TMF672 (User Role Permission Management API)** is also present
under the Security Function (`required: false`) but is not marked required anywhere else in the spec, so it
is treated as present-but-ignored for conformance purposes and is not promoted to mandatory.

### Mandatory Security API
- **TMF669 – Party Role Management API**
  Swagger:
  - https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/OpenApiTable/TMF669_Party_Role/4.0.0/swagger/TMF669_Party_Role_Management_API_v4.0.0_swagger.json

## Canvas Conformance

### Deployment Conformance
Canvas should be Kubernetes based and it is required to have the component deployment in a Kubernetes based environment. Cluster should be running on a supported Kubernetes version. Ensure that the Kubernetes manifests, deployment configurations, and custom resources are compatible with the targeted Kubernetes API version. Compatibility with 3 previous Kubernetes versions must also be considered for backward compatibility. Only trusted container images from reputable sources must be used.

The component deployment and the Kubernetes cluster must pass the following tests:

#### Step 0: Basic environment connectivity tests
- Kubectl configured correctly
- The configuration must be available and the context must be set to the correct cluster
- Kubectl should return pods in `<namespace of components>` namespace

#### Step 1: Deployment component tests
- Component must be found in the established namespace
- Component must have deployed successfully (status: Complete)
- All exposed APIs must be accessible and return HTTP 200
- All exposed APIs must provide valid URLs
- Security API must return at least one party role with canvas system role defined, unless only `canvasSystemRole` is used
- CTKs for all exposed APIs must execute successfully without errors


### Configuration Conformance

- Helm chart MUST be used for deployment
- Configuration file MUST be in YAML
- Namespace MUST exist for Canvas and Components
- CRDs MUST exist for Components and API definitions
- Canvas operator and versioning webhook MUST be running

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
- All mandatory exposed and dependent APIs must match the standard specification versions
- All swagger URLs must be valid and accessible

## CTK Run Configuration

```json
{
    "releaseName": "am-1",
    "component_to_run": "TMFC039",
    "component_namespace": "components",
    "standardComponentPath": "",
    "ctk_name_mapping": {},
    "runExposedOptional": false,
    "runDependentOptional": false,
    "runSecurityOptional": false,
    "ctk_download_urls": "https://raw.githubusercontent.com/tmforum-rand/TMForum-ODA-Component-Specification/refs/heads/v1.1.0/apiIndex.json",
    "standardComponentDownload": {
        "apiBaseUrl": "https://api.github.com",
        "repoOwner": "tmforum-rand",
        "repoName": "TMForum-ODA-Ready-for-publication",
        "gitUrl": "https://raw.githubusercontent.com/tmforum-rand/TMForum-ODA-Ready-for-publication/refs/heads",
        "gitBranch": "v1.1.0",
        "sslVerify": false
    },
    "ctkconfig": {
        "companyName": "TM FORUM",
        "productName": "REFERENCE EXAMPLE AGREEMENT MANAGEMENT",
        "productUrl": "https://www.tmforum.org",
        "componentUrl": "https://www.tmforum.org/oda/directory/components-map",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        "payloads": {
            "TMF669_v4": {
                "PartyRole": {
                    "POST": {
                        "payload": {
                            "name": "TBD"
                        }
                    }
                }
            }
        },
        "rejectUnauthorized": false
    },
    "dependentStubs": {},
    "bddPayloads": {},
    "retrySettings": {
        "maxRetries": 30,
        "retryInterval": 10000
    }
}
```
