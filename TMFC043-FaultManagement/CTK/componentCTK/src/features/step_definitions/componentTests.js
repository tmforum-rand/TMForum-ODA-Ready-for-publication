const { Given, When, Then, Before, After, AfterAll } = require('@cucumber/cucumber');
const assert = require('assert');
const { loadPayload, makeApiRequest, validateSpecificationId } = require('../utils/api');
const { getDeploymentData, fetchFromKubernetes } = require('../utils/kubernetes');
const { resolveStubRelease } = require('../utils/stubResolver');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const { execSync } = require("child_process");
const YAML = require('yaml');
const path = require('path');
const _ = require('lodash');

// Load configuration
const configPath = path.resolve(__dirname, '../../../CHANGE_ME.json');
const config = require(configPath);
const ctkConfigPath  = path.resolve(__dirname, '../../ctkconfig.json');
const ctkConfig = require(ctkConfigPath);

const COMPONENTS = 'components';
const NAMESPACE = ctkConfig.component_namespace;
const TMFORUM_ODA_API_GROUP = 'oda.tmforum.org';
const retrySettings = config.retrySettings || {};
const DEFAULT_MAX_RETRIES = retrySettings.maxRetries || 30;
const DEFAULT_RETRY_INTERVAL = retrySettings.retryInterval || 10000;

// Declare global variables for dynamic URLs
let EXPOSED_API_BASE_URL = null;
let DEPENDENT_API_BASE_URL = null;
let createdResources = [];


//=================Cucumber Hooks=================
Before(function (scenario) {
    const componentToRun = config.component_to_run?.toLowerCase();
    const featureTags = scenario.pickle.tags.map(tag => tag.name);

    console.log(`Feature tags: ${featureTags}`);
    console.log(`Component to run: ${componentToRun}`);
    if (!featureTags.includes(`@${componentToRun}`)) {
        console.log(`Skipping scenario: ${scenario.pickle.name}, as it does not match component_to_run.`);
        return 'skipped'; // Skip the feature
      }
    
      console.log(`Running scenario: ${scenario.pickle.name}`);
});

// Step Definitions
Given("the CTK target component {string} with exposed API ID {string} and dependent API ID {string} has been installed successfully", async function (componentUnderTest, exposedApiId, dependentApiId) {
    let deploymentData = getDeploymentData(exposedApiId, dependentApiId);
    if (!deploymentData.exposedApiBaseUrl || !deploymentData.dependentApiBaseUrl) {
        deploymentData = await fetchFromKubernetes(exposedApiId, dependentApiId);
    }
    // Set global variable values
    EXPOSED_API_BASE_URL = deploymentData.exposedApiBaseUrl;
    DEPENDENT_API_BASE_URL = deploymentData.dependentApiBaseUrl;

    console.log(`Testing component: ${componentUnderTest}`);
    console.log(`Exposed API Base URL: ${EXPOSED_API_BASE_URL}`);
    console.log(`Dependent API Base URL: ${DEPENDENT_API_BASE_URL}`);
});

Given("the supporting stub {string} for API {string} has been installed successfully", async function(dependentComponent, dependentAPI){
    console.log(`🔄 Checking if stub component is installed for dependent API '${dependentComponent}'...`);
    this.dependentComponent = dependentComponent;
    this.dependentAPI = dependentAPI;

    const componentUnderTest = config.component_to_run.toLowerCase();
    const dependentStubMap = config.dependentStubs?.[componentUnderTest];

    if (!dependentStubMap || Object.keys(dependentStubMap).length === 0) {
        throw new Error(`No dependent stub mapping found for '${componentUnderTest}' in CHANGE_ME.json`);
    }

    const resolvedStub = resolveStubRelease(
        componentUnderTest,
        dependentComponent,
        DEPENDENT_API_BASE_URL,
        dependentStubMap,
        ctkConfig.headers,
        NAMESPACE
    );

    if (!resolvedStub) {
        throw new Error(`None of the declared stub releases for '${componentUnderTest}' expose API '${dependentAPI}' at '${DEPENDENT_API_BASE_URL}'`);
    }
    this.stubReleaseName = resolvedStub.releaseName;
    this.stubHeaders = resolvedStub.headers;
});

Given("the dependent API stub {string} is initialized with the payload defined in file {string}", async function (dependentAPI, basePayload) {
    this.dependentAPI = dependentAPI
    const payload = loadPayload(basePayload);
    console.log(`Initializing dependent API ${dependentAPI} with basePayload`);

    const url = DEPENDENT_API_BASE_URL.endsWith('/') ? `${DEPENDENT_API_BASE_URL}${dependentAPI}` : `${DEPENDENT_API_BASE_URL}/${dependentAPI}`;
    const headers = ctkConfig.headers;

    let resourceId = payload?.id;
    let resourceHref = payload?.href;
    let resourceExists = false;

    // Validate if id and href found in the dependent api
    if (resourceId && resourceHref) {
        const getUrl = `${url}/${resourceId}`;
        console.log(`Attempting GET to validate existing resource: ${getUrl}`);

        try {
            const response = await makeApiRequest('GET', getUrl, null, this.stubHeaders);
            if (response.status === 200) {
                console.log(`Existing resource found in dependent API. ID: ${resourceId}`);
                this.dependentAPI_ID = resourceId;
                this.dependentAPI_HREF = resourceHref;
                resourceExists = true;
            } else {
                console.warn(`GET failed on dependent API (status: ${response.status}), will POST new resource.`);
            }
        } catch (err) {
            console.warn(`Resource with ID '${resourceId}' not found (error: ${err}). Proceeding with POST`);
        }
    }

    // If resource does not exist or id/href missing from payload, POST the payload.
    if (!resourceExists) {
        delete payload.id;
        delete payload.href;

        console.log(`Creating new resource via POST to: ${url}`);
        const headers = this.stubHeaders;
        const postResponse = await makeApiRequest('POST', url, payload, headers);
        console.log(`Response for API POST request: ${JSON.stringify(postResponse.data)}`);
        if (postResponse.status === 201) {
            const returnedID = postResponse.data?.id;
            const returnedHref = postResponse.data?.href;
            if (returnedID) {
                console.log(`✅ Dependent API Initialization successful! Returned ID: ${returnedID}`);
                this.dependentAPI_ID = returnedID;  // Store the ID for validation
                this.dependentAPI_HREF = returnedHref;
                // Store response ID for cleanup
                const createdResourceID = returnedID;
                createdResources.push({ url, id: createdResourceID, headers });
                console.log(`Tracking resource ID for cleanup: ${createdResourceID}`);
            } else {
                console.warn(`⚠️ Warning: No ID returned from dependent API.`);
            }
        } else {
            console.error(`❌ Dependent API initialization failed with status ${postResponse.status}: ${postResponse.data}`);
            throw new Error(`Dependent API stub '${dependentAPI}' failed to initialize.`);
        }
    }

    assert(this.dependentAPI_ID, `Could not resolve depedent API ID for: ${dependentAPI}`);
    console.log(`Dependent API ${dependentAPI} initialized successfully.`);

});


When("a {string} with {string} on payload defined in file {string} is created in API {string} expecting {string}", async function (resourceType, resourceFieldPath, targetPayload, exposedAPI, expectedResponse){

    // Step 1: construct the file path and read the payload
    const payloadPath = path.resolve(__dirname, '../payloads', targetPayload);
    const payload = loadPayload(targetPayload);
    console.log(`Creating resource of type ${resourceType} in API ${exposedAPI} with targetPayload`);

    // Step 2: Update id/href for success scenario
    if (expectedResponse === "success" && this.dependentAPI_ID) {
        // Inject id and href  into dynamic path
        _.set(payload, `${resourceFieldPath}.id`, this.dependentAPI_ID);
        _.set(payload, `${resourceFieldPath}.href`, this.dependentAPI_HREF);
        
        // Write updated payload back to file
        try {
            fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
        } catch (err) {
            console.error(`Failed to write updated payload to ${payloadPath}: `, err.message);
        }
    }

    // Step 3: Proceed with POST to Exposed API
    const url = EXPOSED_API_BASE_URL.endsWith('/') ? `${EXPOSED_API_BASE_URL}${exposedAPI}` : `${EXPOSED_API_BASE_URL}/${exposedAPI}`;
    const headers = ctkConfig.headers;
    this.response = await makeApiRequest('POST', url, payload, headers);
    if (this.response.status === 201) {
        console.log(`POST successful: ${JSON.stringify(this.response.data)}`);

        // Store response ID for cleanup
        const createdResourceID = this.response.data.id;
        createdResources.push({ url, id: createdResourceID, headers });
        console.log(`Tracking resource ID for cleanup: ${createdResourceID}`);
    } else {
        console.error(`❌ POST failed with status ${this.response.status}: ${this.response.data}`);
    }

});

Then("expected response for operation {string} should be {string}", function (operationID, expectedResponse){
    // Step 1: Determine the HTTP status code based on the expected response
    const successStatus = 201;
    const failureStatusCodes = [400, 404, 401, 403, 500, 503]; // common API failure response status codes
    
    const actualStatusCode = this.response?.status;
    console.log(`\n📌 Validating API response for ${operationID}. Expected: ${expectedResponse}, Actual Status: ${actualStatusCode}`);

    // Step 2: Assert that the actual status code matches the expected status code 
    if (expectedResponse === 'success'){
        assert.strictEqual(
            actualStatusCode,
            successStatus,
            `Operation ${operationID} failed: Expected status ${successStatus}, but got ${actualStatusCode}.`
        );
        console.log(`Operation ${operationID} validated successfully with status ${actualStatusCode}`);
    }
    else if (expectedResponse === 'failure'){
        assert.notStrictEqual(
            actualStatusCode,
            successStatus,
            `Operation ${operationID} unexpectedly succeeded: Expected one of [${failureStatusCodes.join(', ')}, etc.], but got ${actualStatusCode}.`
        );
    }
    else {
        throw new Error(`Invalid expectedResponse value: ${expectedResponse}`);
    }
    
});

After({ timeout: 15000 },async function () {
    if (createdResources.length === 0) {
        console.log("No resources to clean up.");
        return 'skipped';
    }

    console.log("Cleaning up created resources...");
    for (const resource of createdResources) {
        try {
            const deleteUrl = `${resource.url}/${resource.id}`;
            console.log(`Deleting resource: ${deleteUrl}`);
            const headers = ctkConfig.headers;
            const response = await makeApiRequest('DELETE', deleteUrl, null, resource.headers);

            if (response.status === 204 || response.status === 200) {
                console.log(`✅ Successfully deleted resource: ${resource.id}`);
            } else {
                console.warn(`⚠️ Failed to delete resource ${resource.id}: Status ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Error deleting resource ${resource.id}: ${error.message}`);
        }
    }
    // Clear tracked resources
    createdResources = [];
});