const k8s = require('@kubernetes/client-node');
const path = require('path');
const fs = require('fs');
const deploymentJsonPath = path.resolve(__dirname, '../../deployment.json');
const ctkConfigPath  = path.resolve(__dirname, '../../ctkconfig.json');
const ctkConfig = require(ctkConfigPath);

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

function getCustomAPI(){
    if (!customAPI) {
        console.log("Initializing CustomObjectsAPI client...");
        customAPI = getKubeConfig().makeApiClient(k8s.CustomObjectsApi);
    }
    return customAPI;
}

function findApiUrlById(apiListSpec, apiListStatus, apiId, isDependent = false) {
    let matchSpecIndex = -1;

    if (isDependent) {
        matchSpecIndex = apiListSpec.findIndex(api => {
            const specArray = api?.specification || [];
            return specArray.some(spec => {
                const url = spec?.url || '';
                return typeof url === 'string' && url.toUpperCase().includes(apiId.toUpperCase());
            });
        });

        if (matchSpecIndex === -1 || matchSpecIndex >= apiListStatus.length) {
            console.warn(`Could not match dependent API ID ${apiId} in spec or status`);
            return null;
        }

        return apiListStatus[matchSpecIndex]?.url || null;
    } else {
        const matchSpec = apiListSpec.find(api => api.id?.toUpperCase() === apiId.toUpperCase());
        if (!matchSpec) return null;

        const matchStatus = apiListStatus.find(api => 
            api.path === matchSpec.path || api.implementation === matchSpec.implementation
        );

        return matchStatus?.url || null;
    }
}

function getDeploymentData(targetExposedApiId = null, targetDependentApiId = null) {
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
        
        const spec = items[0].spec?.coreFunction;
        const status = items[0].status;

        let exposedApiUrl = null;
        let dependentApiUrl = null;

        if (targetExposedApiId && spec.exposedAPIs && status.coreAPIs) {
            exposedApiUrl = findApiUrlById(spec.exposedAPIs, status.coreAPIs, targetExposedApiId, false);
        }
        if (targetDependentApiId && spec.dependentAPIs && status.coreDependentAPIs) {
            dependentApiUrl = findApiUrlById(spec.dependentAPIs, status.coreDependentAPIs, targetDependentApiId, true);
        }

        const exposedApiBaseUrl = exposedApiUrl;
        const dependentApiBaseUrl = dependentApiUrl;

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

async function fetchFromKubernetes(targetExposedApiId = null, targetDependentApiId = null) {
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

        const spec = deployment.body.items[0].spec?.coreFunction;
        const status = deployment.body.items[0].status;

        let exposedApiUrl = null;
        let dependentApiUrl = null;

        if (targetExposedApiId && spec.exposedAPIs && status.coreAPIs) {
            exposedApiUrl = findApiUrlById(spec.exposedAPIs, status.coreAPIs, targetExposedApiId, false);
        }
        if (targetDependentApiId && spec.dependentAPIs && status.coreDependentAPIs) {
            dependentApiUrl = findApiUrlById(spec.dependentAPIs, status.coreDependentAPIs, targetDependentApiId, true);
        }

        const exposedApiBaseUrl = exposedApiUrl;
        const dependentApiBaseUrl = dependentApiUrl;
        console.log(`✅ Extracted Exposed API URL from Kubernetes: ${exposedApiBaseUrl}`);
        console.log(`✅ Extracted Dependent API URL from Kubernetes: ${dependentApiBaseUrl}`);

        return { exposedApiBaseUrl, dependentApiBaseUrl };
    } catch (error) {
        console.error(`❌ Error fetching Kubernetes component: ${error.message}`);
        return { exposedApiBaseUrl: null, dependentApiBaseUrl: null };
    }
};

module.exports = {
    getDeploymentData,
    fetchFromKubernetes
};
