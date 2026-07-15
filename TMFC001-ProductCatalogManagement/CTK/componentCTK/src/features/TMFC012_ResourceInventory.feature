@tmfc012
Feature: Dependent API interaction testing for TMFC012 - Resource Inventory

  Scenario Outline: Test dependent API interactions with different payloads  
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent   | resourceType          | exposedApiId  | exposedAPI   | dependentApiId | dependentAPI          | basePayload                | targetPayload             | resourceFieldPath          | operationID        | expectedResponse |
    | tmfc012            | resourceCatalog      | resourceSpecification | TMF639        | resource     | TMF634         | resourceSpecification | resource-catalog-0001.json | resource-target-0001.json | resourceSpecification      | createResource     | success          |
    | tmfc012            | resourceCatalog      | resourceSpecification | TMF639        | resource     | TMF634         | resourceSpecification | resource-catalog-0001.json | resource-target-0002.json | resourceSpecification      | createResource     | failure          |

