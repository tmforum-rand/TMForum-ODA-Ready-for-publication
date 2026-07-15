@tmfc002
Feature: Dependent API interaction testing for TMFC002 - Product Order

  Scenario Outline: Test dependent API interactions with different payloads  
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent   | resourceType  | exposedApiId  | exposedAPI   | dependentApiId | dependentAPI          | basePayload                | targetPayload             | resourceFieldPath                                      | operationID        | expectedResponse |
    | tmfc002            | productCatalog       | productOrder  | TMF622        | productOrder | TMF620         | productSpecification  | product-catalog-0001.json  | product-target-0001.json  | productOrderItem[0].product.productSpecification       | createProductOrder | success          |
    | tmfc002            | productCatalog       | productOrder  | TMF622        | productOrder | TMF620         | productSpecification  | product-catalog-0001.json  | product-target-0002.json  | productOrderItem[0].product.productSpecification       | createProductOrder | failure          |
    | tmfc002            | productInventory     | productOrder  | TMF622        | productOrder | TMF637         | product               | product-inventory-0001.json| product-target-0003.json  | productOrderItem[0].product                            | createProductOrder | success          |
    | tmfc002            | productInventory     | productOrder  | TMF622        | productOrder | TMF637         | product               | product-inventory-0001.json| product-target-0004.json  | productOrderItem[0].product                            | createProductOrder | failure          |