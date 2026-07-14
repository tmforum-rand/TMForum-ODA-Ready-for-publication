@tmfc022
Feature: Dependent API interaction testing for TMFC022 - Party Privacy Management

  Scenario Outline: Test dependent API interactions with different payloads
    Given the CTK target component "<componentUnderTest>" with exposed API ID "<exposedApiId>" and dependent API ID "<dependentApiId>" has been installed successfully
    And the supporting stub "<dependentComponent>" for API "<dependentAPI>" has been installed successfully
    Given the dependent API stub "<dependentAPI>" is initialized with the payload defined in file "<basePayload>"
    When a "<resourceType>" with "<resourceFieldPath>" on payload defined in file "<targetPayload>" is created in API "<exposedAPI>" expecting "<expectedResponse>"
    Then expected response for operation "<operationID>" should be "<expectedResponse>"

  Examples:
    | componentUnderTest | dependentComponent | resourceType          | exposedApiId | exposedAPI            | dependentApiId | dependentAPI | basePayload                | targetPayload            | resourceFieldPath | operationID                  | expectedResponse |
    | tmfc022            | party              | partyPrivacyAgreement | TMF644       | partyPrivacyAgreement | TMF632         | individual   | party-management-0001.json | privacy-target-0001.json | engagedParty[0]   | createPartyPrivacyAgreement  | success          |
    | tmfc022            | party              | partyPrivacyAgreement | TMF644       | partyPrivacyAgreement | TMF632         | individual   | party-management-0001.json | privacy-target-0002.json | engagedParty[0]   | createPartyPrivacyAgreement  | failure          |
    | tmfc022            | partyRole          | partyPrivacyAgreement | TMF644       | partyPrivacyAgreement | TMF669         | partyRole    | party-role-0001.json       | privacy-target-0003.json | engagedParty[0]   | createPartyPrivacyAgreement  | success          |
    | tmfc022            | partyRole          | partyPrivacyAgreement | TMF644       | partyPrivacyAgreement | TMF669         | partyRole    | party-role-0001.json       | privacy-target-0004.json | engagedParty[0]   | createPartyPrivacyAgreement  | failure          |
