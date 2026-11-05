const k8s = require('@kubernetes/client-node');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const deploymentJsonPath = path.resolve(__dirname, '../../deployment.json');
const ctkConfigPath  = path.resolve(__dirname, '../../ctkconfig.json');
const ctkConfig = require(ctkConfigPath);
const resolvedAPIVersions = ctkConfig.resolvedAPIVersions || {};

// K8S variables
let kc = null;
let coreAPI = null;
let customAPI = null;

const COMPONENTS = 'components';
const NAMESPACE = ctkConfig.component_namespace;
const TMFORUM_ODA_API_GROUP = 'oda.tmforum.org';


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

/**
 * --- Helpers: schema normalization (v1.1 preferred, fallback to legacy root fields) ---
 *
 * Legacy CRD:
 *   exposedAPIs[i].implementation, exposedAPIs[i].path at root
 *   exposedAPIs[i].specification[0] only has { url }
 *
 * v1 optionality schema CRD:
 *   exposedAPIs[i].specification[j].implementation, .path, .version ...
 *
 * We normalize to ensure chosen spec entry has impl/path/name/version if available anywhere.
 */
function normalizeApiDefinition(rawApi) {
    if (!rawApi || typeof rawApi !== 'object') return rawApi;
  
    const specArray = Array.isArray(rawApi.specification) ? rawApi.specification : [];
    if (specArray.length === 0) {
      // No specification[] (some legacy manifests) → synthesize one so version selection logic works.
      return {
        ...rawApi,
        specification: [{
          url: rawApi.url || null,
          // prefer v1.1 fields if already present (none here), else inherit legacy
          implementation: rawApi.implementation || null,
          path: rawApi.path || null,
          version: rawApi.version || null,
          name: rawApi.name || null,
        }]
      };
    }
  
    const normalizedSpec = specArray.map(s => {
      const spec = (s && typeof s === 'object') ? { ...s } : {};
      // v1.1 wins; fill only if missing
      if (!spec.implementation && rawApi.implementation) spec.implementation = rawApi.implementation;
      if (!spec.path && rawApi.path) spec.path = rawApi.path;
      if (!spec.version && rawApi.version) spec.version = rawApi.version;
      if (!spec.name && rawApi.name) spec.name = rawApi.name;
      if (!spec.url && rawApi.url) spec.url = rawApi.url;
      return spec;
    });
  
    return { ...rawApi, specification: normalizedSpec };
}
  

/**
 * Extract major version as "v4", "v5", etc.
 * Supports:
 * - spec.version: "v5.0.0", "5.0.0", "5"
 * - URLs with "/v5/" or "v5."
 * - URLs with "4.1.0" (no 'v') e.g. .../4.1.0/swagger/...
 */
function extractMajorFromSpec(spec) {
    if (!spec) return null;
  
    // 1) explicit version field
    if (spec.version) {
      const v = String(spec.version).trim();
      // "v5.0.0" / "5.0.0" / "5"
      const m = v.match(/^v?(\d+)(?:\.\d+)?(?:\.\d+)?$/i);
      if (m) return "v" + m[1];
      // if version is null or not in expected format, continue to URL inference
    }
  
    const url = String(spec.url || "").trim();
    if (!url) return null;
  
    // 2) common "…/v5/…" pattern
    let match = url.match(/\/v(\d+)(?:\/|$)/i);
    if (match) return "v" + match[1];
  
    // 3) common "…v5.0.0…" pattern
    match = url.match(/v(\d+)\./i);
    if (match) return "v" + match[1];
  
    // 4) legacy swagger URLs: ".../4.1.0/swagger/..."
    match = url.match(/\/(\d+)\.(\d+)\.(\d+)\//);
    if (match) return "v" + match[1];
  
    // 5) another legacy pattern: "_4.1.0_" or "-4.1.0-"
    match = url.match(/(?:^|[_-])(\d+)\.(\d+)\.(\d+)(?:[_-]|$)/);
    if (match) return "v" + match[1];
  
    return null;
}

/**
 * Exposed API URL resolver
 * - defaults to v1 optionality schema (specification fields) and falls back to legacy root fields via normalization
 * - version preference: resolvedAPIVersions if present else first spec entry
 */
function resolveExposedApiUrl(specApis, statusApis, apiId) {
    const versionOverride = resolvedAPIVersions[apiId];
    const versionMajor = versionOverride ? String(versionOverride).toLowerCase().replace(/^v/, "v") : "v4";
  
    const raw = (specApis || []).find(a => (a.id || "").toUpperCase() === apiId.toUpperCase());
    if (!raw) {
      console.warn(`⚠️ Exposed API ${apiId} not found in spec`);
      return null;
    }
  
    const specApi = normalizeApiDefinition(raw);
    const specArray = specApi.specification || [];
    if (specArray.length === 0) {
      console.warn(`⚠️ Exposed API ${apiId} has empty specification[]`);
      return null;
    }
  
    // Choose spec by override else first entry
    let chosenSpec = null;
    if (versionMajor) {
      chosenSpec = specArray.find(s => {
        const m = extractMajorFromSpec(s);
        return m && m.toLowerCase() === versionMajor.toLowerCase();
      });
    }
    if (!chosenSpec) chosenSpec = specArray[0];
  
    const impl = chosenSpec.implementation || specApi.implementation || null;
    const specPath = chosenSpec.path || specApi.path || null;
  
    const match = (statusApis || []).find(s => {
      if (impl && s.implementation === impl) return true;
      if (specPath && s.path === specPath) return true;
      if (specPath && s.url && s.url.includes(specPath)) return true;
      return false;
    });
  
    if (!match) {
      console.warn(`⚠️ No runtime exposed API match for ${apiId} (${versionOverride || 'auto'})`);
      return null;
    }
  
    return match.url || null;
}

/**
 * Dependent API URL resolver
 * Requirement:
 *  - support version-aware runtime names "*-v4/*-v5"
 *  - fallback to plain "*name*" if version-aware not found
 * Version selection:
 *  - resolvedAPIVersions[specApi.id] if present else first specification[]
 */
function resolveDependentApiUrl(specApiRaw, coreDependentStatus) {
    if (!specApiRaw || typeof specApiRaw !== 'object') {
      console.warn(`❌ Invalid dependent API definition`);
      return null;
    }
  
    const specApi = normalizeApiDefinition(specApiRaw);
    const specArray = Array.isArray(specApi.specification) ? specApi.specification : [];
    if (specArray.length === 0) {
      console.warn(`❌ Dependent API ${specApi.id || '(unknown)'} has empty specification[]`);
      return null;
    }
  
    const apiName = specApi.name; // you confirmed "yes" for older manifests
    if (!apiName) {
      console.warn(`❌ Dependent API ${specApi.id || '(unknown)'} missing 'name' field`);
      return null;
    }
  
    const versionOverride = resolvedAPIVersions[specApi.id];
    const versionMajorOverride = versionOverride ? String(versionOverride).toLowerCase().replace(/^v/, "v") : null;
  
    // choose spec by override else first
    let chosenSpec = null;
    if (versionMajorOverride) {
      chosenSpec = specArray.find(s => {
        const m = extractMajorFromSpec(s);
        return m && m.toLowerCase() === versionMajorOverride.toLowerCase();
      });
    }
    if (!chosenSpec) chosenSpec = specArray[0];
  
    // major for version-aware matching
    let major = null;
    if (versionMajorOverride) {
      major = versionMajorOverride;
    } else {
      major = extractMajorFromSpec(chosenSpec);
    }
  
    // 1) try version-aware name match: "<name>-v4"
    if (major) {
      const expectedSubstr = `${apiName}-${major}`; // e.g. productcatalogmanagement-v4
      const matchV = (coreDependentStatus || []).find(x =>
        typeof x.name === 'string' && x.name.toLowerCase().includes(expectedSubstr.toLowerCase())
      );
      if (matchV) return matchV.url || null;
  
      console.warn(`⚠️ Dependent API version-aware match '${expectedSubstr}' not found; falling back to plain name match.`);
    } else {
      console.warn(`⚠️ Could not infer dependent API major version for '${apiName}' (will fallback to plain name match).`);
    }
  
    // 2) fallback: plain "<name>" match
    const matchPlain = (coreDependentStatus || []).find(x =>
      typeof x.name === 'string' && x.name.toLowerCase().includes(String(apiName).toLowerCase())
    );
    if (!matchPlain) {
      console.warn(`❌ Dependent API matching '${apiName}' not found in runtime status (plain match)`);
      return null;
    }
  
    return matchPlain.url || null;
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

        if (targetExposedApiId && spec?.exposedAPIs && status?.coreAPIs) {
            exposedApiUrl = resolveExposedApiUrl(spec.exposedAPIs, status.coreAPIs, targetExposedApiId);
        }
        if (targetDependentApiId && spec?.dependentAPIs && status?.coreDependentAPIs) {
            const depSpecApi = spec.dependentAPIs.find(api => (api.id || "").toUpperCase() === targetDependentApiId.toUpperCase());
            if (depSpecApi) {
                dependentApiUrl = resolveDependentApiUrl(depSpecApi, status.coreDependentAPIs);
            }
        }
        if (exposedApiUrl) {
            console.log(`✅ Extracted Exposed API URL: ${exposedApiUrl}`);
        } else if (targetExposedApiId) {
            console.warn(`⚠️ Extracted Exposed API URL is null for ${targetExposedApiId}`);
        }
      
        if (dependentApiUrl) {
            console.log(`✅ Extracted Dependent API URL: ${dependentApiUrl}`);
        } else if (targetDependentApiId) {
            console.warn(`⚠️ Extracted Dependent API URL is null for ${targetDependentApiId}`);
        }

        return { exposedApiBaseUrl: exposedApiUrl, dependentApiBaseUrl: dependentApiUrl };
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

        if (targetExposedApiId && spec?.exposedAPIs && status?.coreAPIs) {
            exposedApiUrl = resolveExposedApiUrl(spec.exposedAPIs, status.coreAPIs, targetExposedApiId);
        }
        if (targetDependentApiId && spec?.dependentAPIs && status?.coreDependentAPIs) {
            const depSpecApi = spec.dependentAPIs.find(api => (api.id || "").toUpperCase() === targetDependentApiId.toUpperCase());
            if (depSpecApi) {
                dependentApiUrl = resolveDependentApiUrl(depSpecApi, status.coreDependentAPIs);
            }
        }

        if (exposedApiUrl) {
            console.log(`✅ Extracted Exposed API URL from Kubernetes: ${exposedApiUrl}`);
        } else if (targetExposedApiId) {
            console.warn(`⚠️ Extracted Exposed API URL from Kubernetes is null for ${targetExposedApiId}`);
        }
      
        if (dependentApiUrl) {
            console.log(`✅ Extracted Dependent API URL from Kubernetes: ${dependentApiUrl}`);
        } else if (targetDependentApiId) {
            console.warn(`⚠️ Extracted Dependent API URL from Kubernetes is null for ${targetDependentApiId}`);
        }
      
        return { exposedApiBaseUrl: exposedApiUrl, dependentApiBaseUrl: dependentApiUrl };
    } catch (error) {
        console.error(`❌ Error fetching Kubernetes component: ${error.message}`);
        return { exposedApiBaseUrl: null, dependentApiBaseUrl: null };
    }
};

module.exports = {
    getDeploymentData,
    fetchFromKubernetes
};
