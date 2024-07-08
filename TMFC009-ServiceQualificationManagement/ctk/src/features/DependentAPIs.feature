Feature: Dependent api interaction testing for component TMFC001 and TMFC005
    Background:
        Given the ctk target component has been installed successfully
        And supporting stub "TMFC001" has been installed successfully

    Scenario Outline: Test dependent scenarios apis with different payloads:
        Given The dependent api "<exposedAPI>" is initialized with the payload defined in file "<basePayload>"
        When A product specification resource with payload defined in file "<targetPayload>" is created in api "<dependentAPI>"
        Then Expected response for operation "<OperationID>" should be "<expectedResponse>"

    Examples:
    | exposedAPI             | dependentAPI          | basePayload          | targetPayload         | OperationID   | expectedResponse  |
    | tmfc001-tmf622-v4.0.0  | tmfc005-tmf005-v4.0.0 | product-id001.json   | inventory-id001.json  | createProduct | success           |
    | tmfc001-tmf622-v4.0.0  | tmfc005-tmf005-v4.0.0 | product-id002.json   | inventory-id002.json  | createProduct | failure           |
