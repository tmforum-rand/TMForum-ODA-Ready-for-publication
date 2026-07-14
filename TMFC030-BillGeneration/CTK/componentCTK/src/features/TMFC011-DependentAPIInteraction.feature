@tmfc011
Feature: Dependent API interaction testing for TMFC011 - Resource Order Management

  Scenario Outline: Test dependent API interactions with different payloads
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent   | resourceType  | exposedApiId | exposedAPI    | dependentApiId | dependentAPI          | basePayload                  | targetPayload              | resourceFieldPath                  | operationID         | expectedResponse |
    | tmfc011            | resourceCatalog      | resourceOrder | TMF652       | resourceOrder | TMF634         | resourceSpecification | resource-catalog-0001.json   | resource-target-0001.json  | orderItem[0].resourceSpecification | createResourceOrder | success          |
    | tmfc011            | resourceCatalog      | resourceOrder | TMF652       | resourceOrder | TMF634         | resourceSpecification | resource-catalog-0001.json   | resource-target-0002.json  | orderItem[0].resourceSpecification | createResourceOrder | failure          |
    | tmfc011            | resourceInventory    | resourceOrder | TMF652       | resourceOrder | TMF639         | resource              | resource-inventory-0001.json | resource-target-0003.json  | orderItem[0].resource              | createResourceOrder | success          |
    | tmfc011            | resourceInventory    | resourceOrder | TMF652       | resourceOrder | TMF639         | resource              | resource-inventory-0001.json | resource-target-0004.json  | orderItem[0].resource              | createResourceOrder | failure          |
