@tmfc035
Feature: Dependent API interaction testing for TMFC035 - Permissions Management

  Scenario Outline: Test dependent API interactions with different payloads
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent | resourceType | exposedApiId | exposedAPI | dependentApiId | dependentAPI | basePayload                | targetPayload               | resourceFieldPath | operationID      | expectedResponse |
    | tmfc035            | party              | permission   | TMF672       | permission | TMF632         | individual   | party-individual-0001.json | permission-target-0001.json | user              | createPermission | success          |
    | tmfc035            | party              | permission   | TMF672       | permission | TMF632         | individual   | party-individual-0001.json | permission-target-0002.json | user              | createPermission | failure          |
    | tmfc035            | party              | partyRole    | TMF669       | partyRole  | TMF632         | individual   | party-individual-0001.json | party-role-target-0001.json | engagedParty      | createPartyRole  | success          |
    | tmfc035            | party              | partyRole    | TMF669       | partyRole  | TMF632         | individual   | party-individual-0001.json | party-role-target-0002.json | engagedParty      | createPartyRole  | failure          |
