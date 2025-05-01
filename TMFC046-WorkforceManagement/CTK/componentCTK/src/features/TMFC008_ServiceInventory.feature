@tmfc008
Feature: Dependent API interaction testing for TMFC008 - Service Inventory

  Scenario Outline: Test dependent API interactions with different payloads  
    Given the CTK target component "<componentUnderTest>" has been installed successfully
    And the supporting stub "<dependentComponent>" with release "<stubReleaseName>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with payload defined in file "<targetPayload>" is created in API "<exposedAPI>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | stubReleaseName | dependentComponent   | resourceType        | exposedAPI            | dependentAPI          | basePayload         | targetPayload       | operationID   | expectedResponse |
    | tmfc008            | s006            | servicecatalog       |serviceSpecification | service               | serviceSpecification  | catalog-id001.json  | service-id001.json  | createService | success          |
    | tmfc008            | s006            | servicecatalog       |serviceSpecification | service               | serviceSpecification  | catalog-id001.json  | service-id002.json  | createService | failure          |