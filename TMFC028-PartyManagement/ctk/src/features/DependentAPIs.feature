Feature: Dependent api interaction testing for component TMFC001 and TMFC005
    Background:
        Given a successfull installed component
        And supporting stub "TMFC005" has been installed successfully

    Scenario Outline: Test dependent apis with different payloads:
        Given The dependent api "<baseAPI>" is initialized with the payload defined in file "<basePayload>"
        When A product specification resource with payload defined in file "<targetPayload>" is created in api "<targetAPI>"
        Then Expected response for operation "<OperationID>" should be "<expectedResponse>"

    Examples:
    | baseAPI                | targetAPI             | basePayload            | targetPayload       | OperationID               | expectedResponse  |
    | tmfc005-tmf005-v4.0.0  | tmfc001-tmf622-v4.0.0 | inventory-id001.json   | product-id001.json  | createProductSpecification | success           |
    | tmfc005-tmf005-v4.0.0  | tmfc001-tmf622-v4.0.0 | inventory-id002.json   | product-id002.json  | createProductSpecification | failure           |
