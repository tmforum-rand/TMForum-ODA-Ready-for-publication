# Ready For Publication Repository Assets

This document explains the repository fundamentals such as the component specification, stub and CTK (Component Test Kit).  
Component Specification purpose, attributes, and the key differences between the `oda.tmforum.org/v1beta3` and `oda.tmforum.org/v1beta4` are also going to be handled with in this documentation. 

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

## How to Contribute

For contributions or questions about this component specification, please send an e-mail to `components@tmforum.org`.


