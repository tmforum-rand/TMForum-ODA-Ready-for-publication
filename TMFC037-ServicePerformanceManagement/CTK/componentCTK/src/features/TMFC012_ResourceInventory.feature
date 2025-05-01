@tmfc012
Feature: Dependent API interaction testing for TMFC012 – Resource Inventory

  Scenario Outline: Test dependent API interactions with different payloads  
    Given the CTK target component "<componentUnderTest>" has been installed successfully
    And the supporting stub "<dependentComponent>" with release "<stubReleaseName>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with payload defined in file "<targetPayload>" is created in API "<exposedAPI>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | stubReleaseName | dependentComponent    |resourceType          | exposedAPI            | dependentAPI          | basePayload         | targetPayload       | operationID   | expectedResponse |
    | tmfc012            | s010            | resourcecatalog       |resourceSpecification | resource              | resourceSpecification | catalog-id002.json  | resource-id001.json | createResource| success          |
    | tmfc012            | s010            | resourcecatalog       |resourceSpecification | resource              | resourceSpecification | catalog-id002.json  | resource-id002.json | createResource| failure          |