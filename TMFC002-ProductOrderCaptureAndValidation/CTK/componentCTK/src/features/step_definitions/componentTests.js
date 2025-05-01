const { Given, When, Then, Before, After, AfterAll } = require('@cucumber/cucumber');
const assert = require('assert');
const { loadPayload, makeApiRequest, validateSpecificationId } = require('../utils/api');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const { execSync } = require("child_process");
const YAML = require('yaml');

// Load configuration
const path = require('path');
const configPath = path.resolve(__dirname, '../../../CHANGE_ME.json');
const config = require(configPath);
const deploymentJsonPath = path.resolve(__dirname, '../../deployment.json');
const ctkConfigPath  = path.resolve(__dirname, '../../ctkconfig.json');
const stubPath = path.resolve(__dirname, '../../stubs');  
const ctkConfig = require(ctkConfigPath);
const COMPONENTS = 'components';
const NAMESPACE = "components";
const TMFORUM_ODA_API_GROUP = 'oda.tmforum.org';
const retrySettings = config.retrySettings || {};
const DEFAULT_MAX_RETRIES = retrySettings.maxRetries || 30;
const DEFAULT_RETRY_INTERVAL = retrySettings.retryInterval || 10000;

// Declare global variables for dynamic URLs
let EXPOSED_API_BASE_URL = null;
let DEPENDENT_API_BASE_URL = null;
let createdResources = [];
let firstPassDone = false;
let installedStubReleaseName = null;

// K8S variables
let kc = null;
let coreAPI = null;
let customAPI = null;

function getKubeConfig(){
    if (!kc) {
        console.log("Initializing Kubernetes Config...");
        kc = new k8s.KubeConfig();
        kc.loadFromDefault();
    }
    return kc;
}

function getCoreAPI(){
    if (!coreAPI) {
        console.log("Initializing CoreV1API client...");
        coreAPI = getKubeConfig().makeApiClient(k8s.CoreV1Api);
    }
    return coreAPI;
}

function getCustomAPI(){
    if (!customAPI) {
        console.log("Initializing CustomObjectsAPI client...");
        customAPI = getKubeConfig().makeApiClient(k8s.CustomObjectsApi);
    }
    return customAPI;
}

function getDeploymentData() {
    if (!fs.existsSync(deploymentJsonPath)) {
        console.error(`❌ Deployment file not found: ${deploymentJsonPath}`);
        return {exposedApiBaseUrl: null, dependentApiBaseUrl: null};
    }

    try {
        const deploymentData = JSON.parse(fs.readFileSync(deploymentJsonPath, 'utf-8'));
        const items = deploymentData.body.items;

        if (!items || items.length === 0) {
            console.error(`❌ No items found in deployment.json`);
            return {exposedApiBaseUrl: null, dependentApiBaseUrl: null};
        }

        const componentStatus = items[0].status;

        const exposedApiBaseUrl = componentStatus.coreAPIs?.[0]?.url || null;

        const dependentApiBaseUrl = componentStatus.coreDependentAPIs?.[0]?.url || null;
        console.log(`✅ Extracted Exposed API URL: ${exposedApiBaseUrl}`);
        console.log(`✅ Extracted Dependent API URL: ${dependentApiBaseUrl}`);

        return { exposedApiBaseUrl, dependentApiBaseUrl };
    } catch (error) {
        console.error(`❌ Error parsing deployment.json: ${error.message}`);
        return {exposedApiBaseUrl: null, dependentApiBaseUrl: null};
    }
};

function getComponentDocument (inDocumentArray) {
    return inDocumentArray.find(doc => {
        let kind = doc.get('kind') || ''
        return kind.toLowerCase() === 'component'
    })
};

async function fetchFromKubernetes() {
    try {
        console.log("🔄 Fetching live values from Kubernetes...");
        const manifest = await fs.promises.readFile(ctkConfig.componentFilePath, 'utf8');
        const component_manifests = YAML.parseAllDocuments(manifest);
        const component_object = getComponentDocument(component_manifests);
        const js_component = component_object.toJSON();
        const componentApiVersion = js_component.apiVersion;
        const apiVersion = componentApiVersion.split("/")[1];
        const componentName = js_component.metadata.name
        const k8sCustomApi = getCustomAPI();
        const deployment = await k8sCustomApi.listNamespacedCustomObject(
            TMFORUM_ODA_API_GROUP,
            apiVersion,
            NAMESPACE,
            COMPONENTS,
            undefined,
            undefined,
            'metadata.name=' + componentName
        );

        if (!deployment.body.items || deployment.body.items.length === 0) {
            console.error(`❌ Component ${componentName} not found in Kubernetes.`);
            return { exposedApiBaseUrl: null, dependentApiBaseUrl: null };
        }

        const componentStatus = deployment.body.items[0].status;

        const exposedApiBaseUrl = componentStatus.coreAPIs?.[0]?.url || null;
        const dependentApiBaseUrl = componentStatus.coreDependentAPIs?.[0]?.url || null;

        console.log(`✅ Extracted Exposed API URL from Kubernetes: ${exposedApiBaseUrl}`);
        console.log(`✅ Extracted Dependent API URL from Kubernetes: ${dependentApiBaseUrl}`);

        return { exposedApiBaseUrl, dependentApiBaseUrl };
    } catch (error) {
        console.error(`❌ Error fetching Kubernetes component: ${error.message}`);
        return { exposedApiBaseUrl: null, dependentApiBaseUrl: null };
    }
};

async function waitForStubReady(installedStubName, stubReleaseName, stubApiVersion, maxRetries = DEFAULT_MAX_RETRIES, retryInterval = DEFAULT_RETRY_INTERVAL) {
    console.log(`Waiting for stub component '${installedStubName}' to be ready...`);

    for (let attempt = 1; attempt <= maxRetries; attempt++ ) {
        try {
            const apiVersion = stubApiVersion.split("/")[1];
            const k8sCustomApi = getCustomAPI();
            const stubDeployment = await k8sCustomApi.listNamespacedCustomObject(
                TMFORUM_ODA_API_GROUP,
                apiVersion,
                NAMESPACE,
                COMPONENTS,
                undefined,
                undefined,
                `metadata.name=${installedStubName}`
            );

            if (stubDeployment.body.items.length > 0) {
                const stubComponentStatus = stubDeployment.body.items[0].status;
                const coreAPI = stubComponentStatus.coreAPIs?.[0];
                const mongoReady = await isMongoReady(stubReleaseName);

                if (coreAPI?.ready && mongoReady) {
                    DEPENDENT_API_BASE_URL = coreAPI?.url || null;
                    console.log(`✅ Stub component '${installedStubName}' is ready!`);
                    console.log(`✅ DEPENDENT_API_BASE_URL updated to: ${DEPENDENT_API_BASE_URL}`);
                    return true;
                } else {
                    console.log(`🔄 Attempt ${attempt}/${maxRetries}: Stub '${installedStubName}' not ready yet... Retrying in ${retryInterval / 1000} seconds`);
                }
            } else {
                console.log(`⚠️ Attempt ${attempt}/${maxRetries}: Stub component '${installedStubName}' not found.`);
            }

            
        } catch (error) {
            console.error(`❌ Error checking readiness for stub '${installedStubName}': ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    console.error(`❌ Timeout! Stub component '${installedStubName}' did not become ready within 5 minutes.`);
    return false;
};

async function isMongoReady(stubReleaseName) {
    const coreAPI = getCoreAPI();
    const labelSelector = `impl=${stubReleaseName}-mongodb`;

    try {
        const res = await coreAPI.listNamespacedPod(NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
        const pods = res.body.items;

        if (!pods.length){
            console.warn(`No mongodb pods found for stub release '${stubReleaseName}'`);
            return false;
        }

        for (const pod of pods){
            const isRunning = pod.status.phase === "Running";
            const allReady = pod.status.containerStatuses?.every(cs => cs.ready);

            if (isRunning && allReady) {
                console.log(`MongoDB pod '${pod.metadata.name}' is running and all containers are ready.`);
                return true;
            } else {
                console.warn(`MongoDB pod '${pod.metadata.name}' not ready. Phase: ${pod.status.phase}`);
            }
        }

        return false;
    } catch (e) {
        console.error(`Error checking MongoDB readiness: ${e.message}`);
        return false;
    }
}

async function getInstalledStubComponentName(stubReleaseName) {
    try {
        console.log(`🔄 Retrieving installed stub component name for release '${stubReleaseName}'...`);

        const manifestOutput = execSync(`helm get manifest ${stubReleaseName} -n ${NAMESPACE}`, { encoding: 'utf-8'});
        const parsedDocument = YAML.parseAllDocuments(manifestOutput);
        for (const doc of parsedDocument) {
            const kind = doc.get("kind");
            if (kind === "Component") {
                const metadata = doc.get("metadata");
                const installedStubName = metadata.get("name");
                const stubApiVersion = doc.get("apiVersion");
                console.log(`✅ Extracted Component Name for '${stubReleaseName}': ${installedStubName}`);
                return { installedStubName, stubApiVersion };
            }
        }

        console.warn(`⚠️ No 'Component' kind found in manifest for '${stubReleaseName}'.`);
        return { installedStubName: null, stubApiVersion: null };
    } catch (error) {
        console.error(`❌ Error retrieving component name for '${stubReleaseName}': ${error.message}`);
        return { installedStubName: null, stubApiVersion: null };
    }
};


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
Given("the CTK target component {string} has been installed successfully", async function (componentUnderTest) {
    let deploymentData = getDeploymentData();
    if (!deploymentData.exposedApiBaseUrl || !deploymentData.dependentApiBaseUrl) {
        deploymentData = await fetchFromKubernetes();
    }
    // Set global variable values
    EXPOSED_API_BASE_URL = deploymentData.exposedApiBaseUrl;
    DEPENDENT_API_BASE_URL = deploymentData.dependentApiBaseUrl;

    console.log(`Testing component: ${componentUnderTest}`);
    console.log(`Exposed API Base URL: ${EXPOSED_API_BASE_URL}`);
    console.log(`Dependent API Base URL: ${DEPENDENT_API_BASE_URL}`);
});

Given("the supporting stub {string} with release {string} has been installed successfully", { timeout: 300000 }, async function(dependentComponent, stubReleaseName){
    console.log(`🔄 Checking if stub component '${stubReleaseName}' is installed for dependent API '${dependentComponent}'...`);
    installedStubReleaseName = stubReleaseName;
    let stubInstalled = false;
    let installedStubName, stubApiVersion;
    ({ installedStubName, stubApiVersion }  = await getInstalledStubComponentName(stubReleaseName));

    console.log(`installed stubname is: ${installedStubName} with release: ${stubReleaseName}`);

    if (!installedStubName) {
        console.log(`⚠️ Stub component '${stubReleaseName}' not found. Installing now...`);
        try {
            const installCommand = `helm install ${stubReleaseName} "${stubPath}/${dependentComponent}" -n ${NAMESPACE}`;
            execSync(installCommand, { stdio: "inherit" });
        
            console.log(`✅ Stub component '${stubReleaseName}' installed successfully.`);

            // Verify installation
            const installResult = execSync(`helm list -n ${NAMESPACE} --output json`, {encoding: "utf-8"});
            const releases = JSON.parse(installResult);
            const matchedRelease = releases.find(release => release.name === stubReleaseName);

            if (matchedRelease) {
                console.log(`✅ Helm verification successful: Stub component '${stubReleaseName}' is now installed.`);
                ({ installedStubName, stubApiVersion } = await getInstalledStubComponentName(stubReleaseName));
            } else {
                throw new Error(`❌ Helm verification failed: '${stubReleaseName}' is not listed in installed releases.`);
            }
        } catch (error) {
            console.error(`❌ Failed to install stub component '${stubReleaseName}': ${error.message}`);
            throw new Error(`Stub installation failed for '${stubReleaseName}'.`);
        }
    }
    // Fetch the exposedAPI of the dependent component stub
    console.log(`🔄 Fetching Exposed API URL for stub '${stubReleaseName}' with name '${installedStubName}'...`);

    const isStubReady = await waitForStubReady(installedStubName, stubReleaseName, stubApiVersion);
    if (!isStubReady) {
        throw new Error(`Stub component '${stubReleaseName}' failed to become ready.`);
    }
    console.log(`✅ Stub '${stubReleaseName}' is fully ready. Proceeding with the test.`);
});

Given("the dependent API stub {string} is initialized with the payload defined in file {string}", async function (dependentAPI, basePayload) {
    this.dependentAPI = dependentAPI
    const payload = loadPayload(basePayload);
    console.log(`Initializing dependent API ${dependentAPI} with basePayload`);

    const url = DEPENDENT_API_BASE_URL.endsWith('/') ? `${DEPENDENT_API_BASE_URL}${dependentAPI}` : `${DEPENDENT_API_BASE_URL}/${dependentAPI}`;
    const headers = ctkConfig.headers;
    const response = await makeApiRequest('POST', url, payload, headers);
    console.log(`Response for API POST request: ${JSON.stringify(response.data)}`);

    if (response.status === 201) {
        const returnedID = response.data?.id;
        if (returnedID) {
            console.log(`✅ API Initialization successful! Returned ID: ${returnedID}`);
            this.dependentAPI_ID = returnedID;  // Store the ID for validation
        } else {
            console.warn(`⚠️ Warning: No ID returned from dependent API.`);
        }
    } else {
        console.error(`❌ Dependent API initialization failed with status ${response.status}: ${response.data}`);
        throw new Error(`Dependent API stub '${dependentAPI}' failed to initialize.`);
    }

    assert.strictEqual(response.status, 201, `Failed to preload dependent API stub: ${response.statusText}`);
    console.log(`Dependent API ${dependentAPI} initialized successfully.`);

});


When("a {string} with payload defined in file {string} is created in API {string}", async function (resourceType, targetPayload, exposedAPI){

    // Step 1: construct the file path and read the payload
    const payload = loadPayload(targetPayload);
    console.log(`Creating resource of type ${resourceType} in API ${exposedAPI} with targetPayload`);

    // Step 2: Extract the serviceSpecification ID from the payload
    let specificationID = payload[resourceType]?.id;
    
    if (!specificationID){
        console.error(`❌ ${resourceType} ID not found in payload.`);
        this.response = { status: 400 };
        return;
    }

    if (!firstPassDone && this.dependentAPI_ID) {
        specificationID = this.dependentAPI_ID;
    }

    const dependentURL = DEPENDENT_API_BASE_URL.endsWith('/') ? `${DEPENDENT_API_BASE_URL}${this.dependentAPI}` : `${DEPENDENT_API_BASE_URL}/${this.dependentAPI}`;
    // Step 3: Check if the specification ID exists in catalog (Dependent API)
    console.log(`Validating Service Specification ID: ${specificationID}`);
    const validationSuccess = await validateSpecificationId(specificationID, dependentURL);

    if (!validationSuccess) {
        console.log(`Expected Failure: Specification ID ${specificationID} not found (404)`);
        this.response = { status: 404 };
        return;
    }


    // Step 4: Proceed with POST to Exposed API
    const url = EXPOSED_API_BASE_URL.endsWith('/') ? `${EXPOSED_API_BASE_URL}${exposedAPI}` : `${EXPOSED_API_BASE_URL}/${exposedAPI}`;
    const headers = ctkConfig.headers;
    this.response = await makeApiRequest('POST', url, payload, headers);
    if (this.response.status === 201) {
        console.log(`POST successful: ${JSON.stringify(this.response.data)}`);

        // Store response ID for cleanup
        const createdResourceID = this.response.data.id;
        createdResources.push({ url, id: createdResourceID });
        console.log(`Tracing resource ID for cleanup: ${createdResourceID}`);
    } else {
        console.error(`❌ POST failed with status ${this.response.status}: ${this.response.data}`);
    }

    firstPassDone = true;
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
        assert(
            failureStatusCodes.includes(actualStatusCode),
            `Operation ${operationID} failed unexpectedly: Expected one of [${failureStatusCodes.join(', ')}], but got ${actualStatusCode}.`
        );
    }
    else {
        throw new Error(`Invalid expectedResponse value: ${expectedResponse}`);
    }
    
});

After(async function () {
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
            const response = await makeApiRequest('DELETE', deleteUrl, null, headers);

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

AfterAll(async function () {
    console.log(`Uninstalling stub: ${installedStubReleaseName}`);
    if (!installedStubReleaseName) {
        console.log("No stub release specified. Skipping final uninstallation.");
        return 'skipped';
    }

    console.log(`Uninstalling stub component '${installedStubReleaseName}' after all scenarios.`)

    try {
        const uninstallCommand = `helm uninstall ${installedStubReleaseName} -n ${NAMESPACE}`;
        execSync(uninstallCommand, { stdio: "inherit" });
        console.log(`✅ Stub component '${installedStubReleaseName}' uninstalled successfully.`);
    } catch (error) {
        console.error(`❌ Failed to uninstall stub component '${installedStubReleaseName}': ${error.message}`);
    }
    installedStubReleaseName = null;
});