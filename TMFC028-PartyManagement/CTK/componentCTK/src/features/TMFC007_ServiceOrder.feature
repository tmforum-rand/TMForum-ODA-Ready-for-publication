@tmfc007
Feature: Dependent API interaction testing for TMFC007 - Service Order

  Scenario Outline: Test dependent API interactions with different payloads  
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent   | resourceType  | exposedApiId  | exposedAPI   | dependentApiId | dependentAPI          | basePayload                | targetPayload             | resourceFieldPath                                      | operationID        | expectedResponse |
    | tmfc007            | serviceCatalog       | serviceOrder  | TMF641        | serviceOrder | TMF633         | serviceSpecification  | service-catalog-0001.json  | service-target-0001.json  | serviceOrderItem[0].service.serviceSpecification       | createServiceOrder | success          |
    | tmfc007            | serviceCatalog       | serviceOrder  | TMF641        | serviceOrder | TMF633         | serviceSpecification  | service-catalog-0001.json  | service-target-0002.json  | serviceOrderItem[0].service.serviceSpecification       | createServiceOrder | failure          |
    | tmfc007            | serviceInventory     | serviceOrder  | TMF641        | serviceOrder | TMF638         | service               | service-inventory-0001.json| service-target-0003.json  | serviceOrderItem[0].service                            | createServiceOrder | success          |
    | tmfc007            | serviceInventory     | serviceOrder  | TMF641        | serviceOrder | TMF638         | service               | service-inventory-0001.json| service-target-0004.json  | serviceOrderItem[0].service                            | createServiceOrder | failure          |