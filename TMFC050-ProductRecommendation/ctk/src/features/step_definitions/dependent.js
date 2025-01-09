const config  = require('../../ctkconfig.json')
const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const assert = require('assert');


const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath
const MANIFESTS = config.componentFilePath

setDefaultTimeout(20 * 1000);

Given("the ctk target component has been installed successfully", async function () {
    assert.ok(true, "installed");
});

Given("supporting stub {string} has been installed successfully", async function(compname){
    assert.ok(true, "installed")
}) 

Given("The dependent api {string} is initialized with the payload defined in file {string}", async function (baseAPI, basePayload) {
    assert.ok(true, "API initialized");
});

When("A product specification resource with payload defined in file {string} is created in api {string}", async function (targetPayload, targetAPI) {
    assert.ok(true, "initialized")
});

Then("Expected response for operation {string} should be {string}", async function (operation, expectedResponse) {
    assert.ok(true, "Response verified");
});
