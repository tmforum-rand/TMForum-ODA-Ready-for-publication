@tmfc054
Feature: Dependent API interaction testing for TMFC054 - Product Test Management

  Scenario Outline: Test dependent API interactions with different payloads
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent | resourceType             | exposedApiId | exposedAPI               | dependentApiId | dependentAPI         | basePayload                 | targetPayload                      | resourceFieldPath              | operationID                    | expectedResponse |
    | tmfc054            | productCatalog     | productTestSpecification | TMF769       | productTestSpecification | TMF620         | productSpecification | product-catalog-0001.json   | product-test-spec-target-0001.json | relatedProductSpecification[0] | createProductTestSpecification | success          |
    | tmfc054            | productCatalog     | productTestSpecification | TMF769       | productTestSpecification | TMF620         | productSpecification | product-catalog-0001.json   | product-test-spec-target-0002.json | relatedProductSpecification[0] | createProductTestSpecification | failure          |
    | tmfc054            | productInventory   | productTest              | TMF769       | productTest              | TMF637         | product              | product-inventory-0001.json | product-test-target-0001.json      | relatedProduct                 | createProductTest              | success          |
    | tmfc054            | productInventory   | productTest              | TMF769       | productTest              | TMF637         | product              | product-inventory-0001.json | product-test-target-0002.json      | relatedProduct                 | createProductTest              | failure          |
