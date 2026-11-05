@tmfc040
Feature: Dependent API interaction testing for TMFC040 - Product Usage Management

  Scenario Outline: Test dependent API interactions with different payloads
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent | resourceType          | exposedApiId | exposedAPI            | dependentApiId | dependentAPI | basePayload                | targetPayload                       | resourceFieldPath                | operationID                  | expectedResponse |
    | tmfc040            | party              | usage                 | TMF635       | usage                 | TMF632         | individual   | party-management-0001.json | usage-target-0001.json              | relatedParty[0]                  | createUsage                  | success          |
    | tmfc040            | party              | usage                 | TMF635       | usage                 | TMF632         | individual   | party-management-0001.json | usage-target-0002.json              | relatedParty[0]                  | createUsage                  | failure          |
    | tmfc040            | party              | queryUsageConsumption | TMF677       | queryUsageConsumption | TMF632         | individual   | party-management-0001.json | usage-consumption-target-0001.json  | relatedParty[0].partyOrPartyRole | createQueryUsageConsumption  | success          |
    | tmfc040            | party              | queryUsageConsumption | TMF677       | queryUsageConsumption | TMF632         | individual   | party-management-0001.json | usage-consumption-target-0002.json  | relatedParty[0].partyOrPartyRole | createQueryUsageConsumption  | failure          |
