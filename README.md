# Ready For Publication Repository Assets

This document explains the repository fundamentals such as the component specification, stub and CTK (Component Test Kit).  
Component Specification purpose, attributes, and the key differences between the `oda.tmforum.org/v1beta3` and `oda.tmforum.org/v1beta4` are also going to be handled with in this documentation. 

Please Note :
This repo is intended to house the Component project deliverables before they are committed to the TMForum.org website.

It contains not only the YAML files specifying the Components but also (soon) the means to confirm that the Components specified can be certified as adhering to the Component Specification.

The specifications contained here are derived from content in closed repos, such as the TM Forum API repos and the Component Specification repo. The factory code for producing these assets is contained in private repos ODA CI and ODA Component Conformance.

The releasable assets in this repository are:
- Golden Component definitions for each componets, 
- CTK's (Component Conformance Tests) (will be delivered soon)
- Deployable reference implementation. (Component envelopes, stubs) (will be delivered soon)

---

## Purpose of the Component Specification File

The component specification file serves as a blueprint for defining and describing components within the ODA-CA (Open Digital Architecture Component Accelerator) framework. It ensures a standardized structure for:

- Defining component metadata (e.g., version, publication date, description).
- Specifying the core, management, security, and event notification functions.
- Listing APIs the component depends on or exposes.
- Supporting consistent and reusable integration across different functional blocks.
- Standardizing component structure to be used with the same version of the ODA-CA Canvas ecosystem.
- Executing tests by comparing the actual vendors' or communication service providers' (CSPs) component specifications with this component specification.

---

## Basic Attributes of the Component Specification

### Component Metadata


- **ID**: The unique identifier for the component.
- **Name**: The unique naming for the component.
- **Version**: Version of the specification (e.g., `2.0.0`, `2.1.0`).
- **Functional Block**: The category the component belongs to (e.g., `CoreCommerce`, `PartyManagement`).
- **Description**: Brief description of the component’s functionality.
- **Publication Date**: When the specification was published.
- **Status**: Indicates if the specification is in use, specified, deprecated, or in draft.
- **Owners**: Component owners' information
- **Maintainers**: Contributors' information
- **eTOMs**: Lists the Business Process Framework belong to the component
- **Functional Framework Functions**: Details an organization’s activities from a system point of view


### Core Functions

- **Dependent APIs**: Lists external APIs the component relies on, including ID, type, version, and url specifications.
- **Exposed APIs**: Details APIs exposed by the component, including supported methods (e.g., GET, POST).

### Management Functions

- **Dependent APIs**: Lists external APIs component relies on as a management API, including ID, type, version, and url specification.
- **Exposed APIs**: Details APIs exposed by the component, such as metrics exposed via Prometheus or other mechanisms.


### Security Functions

- **canvasSystemRole**: Specifies the name of the securty role 
- **Secrets Management**: Defines how secrets are managed (e.g., `sideCar` approach).
- **DependentAPIs**: Lists external APIs component relies on as a security API, including ID, type, version, and url specification.
- **Exposed APIs**: Details APIs exposed by the component, such as party role management API or any security APIs exposed via Keycloak, Okta, AWS Cognito, Azure Active Directory B2C, Google Identity Platform or other mechanisms.

### Event Notifications

- **Published Events**: Events the component publishes, including the API type and resources affected.
- **Subscribed Events**: Events the component subscribes to from other components.


---

## Key Differences: v1beta3 vs. v1beta4

### Changes in Attribute Structure:

1. **`componentMetadata`**:
   - Some attributes are moved from `spec` to `spec.componentMetadata`
   - `componentMetadata` is newly created to collect basic attributes of component like `id`, `name`, `version`, `publicationDate`, and `owners`.

2. **Newly Added Listings**:
   - **`eTOMs`** and **`functionalFrameworkFunctions`** fields are introduced with a structured naming convention: `id_name_apiVersion`.

3. **Specifications**:
   - Specifications is a collection which contains more than one specifications. Enhanced format to include details like `url`, `version`.

4. **Owners and Maintainers**:
   - Both fields have 3 attributes : `name`, `email`, `url`.

5. **Renaming controllerRole**:
   - The `controllerRole` attribute of SecurityFunction changed as `canvasSystemRole`.

---

## Example Comparison

### Example Dependent API (v1beta3)

```yaml
- id: TMF633
  version: v4.0.0
  apiType: openapi
  name: service-catalog-management-api
  specification: https://example.com/swagger/TMF633_Service_Catalog_Management_API_v4.0.0_swagger.json
  resources:
  - serviceSpecification:
    - GET
    - GET /id
```

### Example Dependent API (v1beta4)

```yaml
- id: TMF633
  apiType: openapi
  name: service-catalog-management-api
  required: false
  specification:
  - url: https://example.com/swagger/TMF633_Service_Catalog_Management_API_v4.0.0_swagger.json
    version: v4.0.0
  resources:
  - serviceSpecification:
    - GET
    - GET /id
```

### Example Component Metadata (v1beta4)

```yaml
  componentMetadata:
    id: TMFC001
    name: ProductCatalogManagement
    version: 2.1.0
    description: The Product Catalog Management ODA Component is responsible for organizing
      the collection of Products and Product Offerings specifications that identify
      and define all requirements of a product or a product offering that can be commercialized.
    publicationDate: 2024-11-12 00:00:00
    status: specified
    functionalBlock: CoreCommerce
    owners:
    - email: Redacted
      name: Redacted
      url: Redacted
    maintainers:
    - name: Redacted
      email: components@tmforum.org
      url: Redacted
    eTOMs:
    - 1.2.20_Product_Catalog_Lifecycle_Management_v23.0
    - 1.1.19_Loyalty_Program_Management_v23.0
    functionalFrameworkFunctions:
    - 3_Repository_Entity_Relations_Configuration_v23.0
    - 4_Repository_Entity_Grouping_Configuration_v23.0
```

---

## Published Releases

This branch is the publication record of ODA component releases. It is written only by the
component release workflow of TMForum-ODA-CI: every commit publishes one component release.
Do not edit it by hand; changes made here would be overwritten or rejected.

### Layout

```
components/<component-key>/releases/<version>/   one folder per release, never changed once published
  release-manifest.json                          what was released: source tag and commit, files, checksums
  ReleaseNotes/                                  the component's release notes at the release tag
  Specification/<name>.yaml                      the generated component specification
  <specification documents>                      PDF or DOCX, original names
  ComponentConformanceProfile/                   conformance profiles, original names
  CTK/                                           only for components eligible for a CTK
components/<component-key>/component-index.json  this component's releases (generated)
index/components.json                            every component and release (generated)
Reports/                                         API, functional and metadata reports as CSV (generated)
```

`<component-key>` is the component id and the name in its specification, such as
`TMFC001-ProductCatalogManagement`.

### Finding a release

- The latest release of a component is `latest` in its `component-index.json`, and the latest
  release with a given status is in `latestByStatus`. Versions are compared numerically
  (1.10.0 is later than 1.9.0).
- `index/components.json` lists every component with all its releases.
- Each release is also tagged here with the name of its source tag in
  TMForum-ODA-Component-Specification, such as `TMFC001-ProductCatalogManagement/v2.1.2-specified`.
  The tag points at the commit that published the release, and its message records the source
  repository and commit, the release id and the manifest checksum.

### Other locations

- The `v1.0.0` and `v1.1.0` branches hold the content published before this layout, with one
  folder per component at the top level. They are kept unchanged.
- The ODA website and the S3 bucket `oda-production` hold the files of the current release of
  each component only, and only of the components that are published there. The CTK is
  provided there as zip files.

### Components

| Component | Latest | Releases |
|---|---|---|
| [TMFC001-ProductCatalogManagement](components/TMFC001-ProductCatalogManagement/component-index.json) | [2.1.2](components/TMFC001-ProductCatalogManagement/releases/2.1.2/) | 2.1.2 |
| [TMFC002-ProductOrderCaptureAndValidation](components/TMFC002-ProductOrderCaptureAndValidation/component-index.json) | [2.1.0](components/TMFC002-ProductOrderCaptureAndValidation/releases/2.1.0/) | 2.1.0 |
| [TMFC003-ProductOrderDeliveryOrchestrationAndManagement](components/TMFC003-ProductOrderDeliveryOrchestrationAndManagement/component-index.json) | [1.1.1](components/TMFC003-ProductOrderDeliveryOrchestrationAndManagement/releases/1.1.1/) | 1.1.1 |
| [TMFC005-ProductInventory](components/TMFC005-ProductInventory/component-index.json) | [1.0.4](components/TMFC005-ProductInventory/releases/1.0.4/) | 1.0.4 |
| [TMFC006-ServiceCatalogManagement](components/TMFC006-ServiceCatalogManagement/component-index.json) | [1.2.0](components/TMFC006-ServiceCatalogManagement/releases/1.2.0/) | 1.2.0 |
| [TMFC007-ServiceOrderManagement](components/TMFC007-ServiceOrderManagement/component-index.json) | [2.0.0](components/TMFC007-ServiceOrderManagement/releases/2.0.0/) | 2.0.0 |
| [TMFC008-ServiceInventory](components/TMFC008-ServiceInventory/component-index.json) | [1.2.0](components/TMFC008-ServiceInventory/releases/1.2.0/) | 1.2.0 |
| [TMFC009-ServiceQualificationManagement](components/TMFC009-ServiceQualificationManagement/component-index.json) | [1.1.0](components/TMFC009-ServiceQualificationManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC010-ResourceCatalogManagement](components/TMFC010-ResourceCatalogManagement/component-index.json) | [1.3.2](components/TMFC010-ResourceCatalogManagement/releases/1.3.2/) | 1.3.2 |
| [TMFC011-ResourceOrderManagement](components/TMFC011-ResourceOrderManagement/component-index.json) | [1.2.0](components/TMFC011-ResourceOrderManagement/releases/1.2.0/) | 1.2.0 |
| [TMFC012-ResourceInventory](components/TMFC012-ResourceInventory/component-index.json) | [2.2.0](components/TMFC012-ResourceInventory/releases/2.2.0/) | 2.2.0 |
| [TMFC014-LocationManagement](components/TMFC014-LocationManagement/component-index.json) | [1.2.1](components/TMFC014-LocationManagement/releases/1.2.1/) | 1.2.1 |
| [TMFC020-DigitalIdentityManagement](components/TMFC020-DigitalIdentityManagement/component-index.json) | [1.1.0](components/TMFC020-DigitalIdentityManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC022-PartyPrivacyManagement](components/TMFC022-PartyPrivacyManagement/component-index.json) | [1.1.0](components/TMFC022-PartyPrivacyManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC023-PartyInteractionManagement](components/TMFC023-PartyInteractionManagement/component-index.json) | [1.1.2](components/TMFC023-PartyInteractionManagement/releases/1.1.2/) | 1.1.2 |
| [TMFC024-BillingAccountManagement](components/TMFC024-BillingAccountManagement/component-index.json) | [2.1.1](components/TMFC024-BillingAccountManagement/releases/2.1.1/) | 2.1.1 |
| [TMFC027-ProductConfigurator](components/TMFC027-ProductConfigurator/component-index.json) | [2.1.1](components/TMFC027-ProductConfigurator/releases/2.1.1/) | 2.1.1 |
| [TMFC028-PartyManagement](components/TMFC028-PartyManagement/component-index.json) | [2.1.0](components/TMFC028-PartyManagement/releases/2.1.0/) | 2.1.0 |
| [TMFC029-PaymentManagement](components/TMFC029-PaymentManagement/component-index.json) | [1.2.2](components/TMFC029-PaymentManagement/releases/1.2.2/) | 1.2.2 |
| [TMFC030-BillGenerationManagement](components/TMFC030-BillGenerationManagement/component-index.json) | [2.1.0](components/TMFC030-BillGenerationManagement/releases/2.1.0/) | 2.0.0, 2.1.0 |
| [TMFC031-BillCalculation](components/TMFC031-BillCalculation/component-index.json) | [3.0.0](components/TMFC031-BillCalculation/releases/3.0.0/) | 3.0.0 |
| [TMFC035-PermissionsManagement](components/TMFC035-PermissionsManagement/component-index.json) | [1.1.1](components/TMFC035-PermissionsManagement/releases/1.1.1/) | 1.1.1 |
| [TMFC036-LeadAndOpportunityManagement](components/TMFC036-LeadAndOpportunityManagement/component-index.json) | [1.2.0](components/TMFC036-LeadAndOpportunityManagement/releases/1.2.0/) | 1.2.0 |
| [TMFC037-ServicePerformanceManagement](components/TMFC037-ServicePerformanceManagement/component-index.json) | [1.2.0](components/TMFC037-ServicePerformanceManagement/releases/1.2.0/) | 1.2.0 |
| [TMFC038-ResourcePerformanceManagement](components/TMFC038-ResourcePerformanceManagement/component-index.json) | [1.2.0](components/TMFC038-ResourcePerformanceManagement/releases/1.2.0/) | 1.2.0 |
| [TMFC039-AgreementManagement](components/TMFC039-AgreementManagement/component-index.json) | [1.1.0](components/TMFC039-AgreementManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC040-ProductUsageManagement](components/TMFC040-ProductUsageManagement/component-index.json) | [1.1.0](components/TMFC040-ProductUsageManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC041-AnomalyManagement](components/TMFC041-AnomalyManagement/component-index.json) | [1.1.0](components/TMFC041-AnomalyManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC043-FaultManagement](components/TMFC043-FaultManagement/component-index.json) | [1.0.0](components/TMFC043-FaultManagement/releases/1.0.0/) | 1.0.0 |
| [TMFC046-WorkforceManagement](components/TMFC046-WorkforceManagement/component-index.json) | [1.1.0](components/TMFC046-WorkforceManagement/releases/1.1.0/) | 1.1.0 |
| [TMFC050-ProductRecommendationManagement](components/TMFC050-ProductRecommendationManagement/component-index.json) | [1.0.0](components/TMFC050-ProductRecommendationManagement/releases/1.0.0/) | 1.0.0 |
| [TMFC054-ProductTestManagement](components/TMFC054-ProductTestManagement/component-index.json) | [1.0.0](components/TMFC054-ProductTestManagement/releases/1.0.0/) | 1.0.0 |
| [TMFC055-ServiceTestManagement](components/TMFC055-ServiceTestManagement/component-index.json) | [1.0.0](components/TMFC055-ServiceTestManagement/releases/1.0.0/) | 1.0.0 |
| [TMFC061-WorkOrderManagement](components/TMFC061-WorkOrderManagement/component-index.json) | [1.0.0](components/TMFC061-WorkOrderManagement/releases/1.0.0/) | 1.0.0 |
| [TMFC062-ResourceConfigurationandActivation](components/TMFC062-ResourceConfigurationandActivation/component-index.json) | [1.0.0](components/TMFC062-ResourceConfigurationandActivation/releases/1.0.0/) | 1.0.0 |

---

## How to Contribute

For contributions or questions about this component specification, please send an e-mail to `components@tmforum.org`.
