const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const addContext = require('mochawesome/addContext');
const config  = require('../ctkconfig.json')
const fs = require('fs')
const Path = require('path')
const {URL} = require('url')
const YAML = require('yaml');
const https = require('https')
const http = require('http')
const mkdirp = require('mkdirp');
const k8s = require('@kubernetes/client-node');
const { exec, execSync } = require('child_process');
const os = require('os');
//const { resolve } = require('path/posix');

chai.use(chaiHttp)

const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath
const COMPONENT = 'Component'
const COMPONENTS = 'components'
const NAMESPACE = config.component_namespace
const HEADER = process.env.HEADER
const TMFORUM_ODA_API_GROUP = 'oda.tmforum.org'
const TMFORUM_ODA_API_VERSION = 'v1beta3'
const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api)
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi)



describe('Step 0: Basic environment connectivity tests', function () {
    this.timeout(150000)
    it('Kubectl configured correctly', async function () {
        addContext(this, 'The purpose of this test is to check if the kubectl is configured correctly')
        addContext(this, 'The configuration must be available and the context must be set to the correct cluster')
        let pods = await k8sCoreApi.listNamespacedPod(NAMESPACE)
        expect(pods, "Kubectl should return pods in " + NAMESPACE + " namespace").to.be.a('object')
    })
})

let gc_manifest, component_manifests, component_object, js_component, componentName, deployment;

describe("Step 1: Deployment component tests", function () {
    this.timeout(150000)
    before(async function() {
        let manifest = await fs.promises.readFile(config.componentFilePath, 'utf8')
        let golden_component = await fs.promises.readFile(GOLDEN_COMPONENT_PATH, 'utf8')
        gc_manifest = YAML.parseDocument(golden_component)
        component_manifests = YAML.parseAllDocuments(manifest)
        component_object = getComponentDocument(component_manifests)
        js_component = component_object.toJSON()

        let componentApiVersion = js_component.apiVersion
        //let apiGroup = componentApiVersion.split("/")[0]
        let apiVersion = componentApiVersion.split("/")[1]

        componentName = js_component.metadata.name
        deployment = await k8sCustomApi.listNamespacedCustomObject(
            TMFORUM_ODA_API_GROUP,
            apiVersion,
            NAMESPACE,
            COMPONENTS,
            undefined,
            undefined,
            'metadata.name=' + componentName
        )

        fs.writeFile('deployment.json', JSON.stringify(deployment, null, 2), function (err) {
            if (err) return console.log(err);
        })
    })

    it('Component can be found in namespace: ' + COMPONENTS, async function() {
        addContext(this, 'The component must be found in the established namespace for components')
        expect(deployment).to.be.a('object')
    })
    
    it('Component has deployed successfully (status: Complete)', async function() {
        addContext(this, 'The component must have deployed successfully and its status must be complete')
        let status = deployment.body.items[0].status
        expect(status["summary/status"].deployment_status).to.be.equal('Complete')
    })

//    it('Test if all exposed api are accessible and return status is 200', async function() {
//        this.timeout(150000)
//        addContext(this, 'All exposed apis defined in the component must provide a valid url')
//        let apis = deployment.body.items[0].status.coreAPIs
//        let api_queries = apis.map(async api => await isValidJSONUrl(api.url))
//        let results = await Promise.all(api_queries)
//        expect(results).to.not.include(false)
//    })

    it('Security api must return at least one partyrole with canvas system role defined in component file', async function() {
        this.timeout(150000)
        addContext(this, 'The security api must return at least one partyrole, unless only canvasSystemRole is defined')
        let security_apis = deployment.body.items[0].status?.securityAPIs || []
        let roleName = js_component.spec.securityFunction?.canvasSystemRole

        if (roleName && security_apis.length === 0) {
            console.log('Only canvasSystemRole is defined, skipping API validation.')
            return
        }
        let api_queries = security_apis.map(async api => await testPartyRole(api.url.endsWith('/') ? api.url : api.url + '/', roleName))
        let results = await Promise.all(api_queries)
        expect(results).to.include(true)
    })

    it('CTKs for exposed apis have been executed successfully', async function () {
        addContext(this, 'This step configures the api ctks. There must be no errors during the process')
        this.timeout(500000) // 2 minute timeout
        let functions = ["coreFunction", "securityFunction"]
        let edges = ["exposedAPIs"]
        let parsed_component = gc_manifest.toJSON()
        let api_configs = []
        

        let ref_to_url = {}
        let body_apis = deployment.body.items[0].spec.coreFunction.exposedAPIs
        body_apis = body_apis.concat(deployment.body.items[0].spec.securityFunction.exposedAPIs)
        body_apis = body_apis.map(api => normalizeExposedApiFromManifest(api));

        let status_apis = deployment.body.items[0].status["coreAPIs"] || []
        status_apis = status_apis.concat(deployment.body.items[0].status["securityAPIs"] || [])

        const resolvedVersions = config.resolvedAPIVersions || {}
        console.log("Resolved API Versions:", resolvedVersions)

        const ctkRoot = Path.join(__dirname, "../../resources/api-ctks")

        const ctkDirEntries = await fs.promises.readdir(ctkRoot, { withFileTypes: true })
        const ctkIndex = {}
        for (const dir of ctkDirEntries) {
            if (!dir.isDirectory()) continue

            const match = dir.name.match(/(TMF\d+)_v(\d+)\.\d+\.\d+/i);
            if (match) {
                const apiId = match[1]
                const majorVersion = "v" + match[2]
                const key = `${apiId}_${majorVersion}`
                ctkIndex[key] = dir.name
            }
        }

        console.log("📦 CTK Index =", ctkIndex);

        for (let body_api of body_apis) {
            const apiId = body_api.id

            const versionToTest = resolvedVersions[apiId]
            if (!versionToTest) {
                console.log(`⚠️ No resolved version found for ${apiId}, skipping.`);
                continue; // No specific version to resolve for this API
            }

            console.log(`\n➡ Resolving runtime URL for ${apiId} (version ${versionToTest})`);

            let specEntry = (body_api.specification || []).find(spec => {
                let major = extractMajorFromSpec(spec)
                console.log(`-- Checking spec entry with major version: ${major}`);
                // Handle both "5" and "v5" formats
                const testMajor = versionToTest.replace(/^v/, "");
                const specMajor = major.replace(/^v/, "");
                return specMajor === testMajor;
                //return major && major.toLowerCase() === versionToTest.toLowerCase();
            })

            if (!specEntry) {
                console.log(`❌ No matching specification found for version ${versionToTest} of API ${apiId}, skipping.`);
                continue;
            }

            const impl = specEntry.implementation
            if (!impl) {
                console.log(`❌ No implementation defined for API ${apiId} version ${versionToTest}, skipping.`);
                continue;
            }

            const path = specEntry.path
            if (!path) {
                console.log(`❌ No path defined for API ${apiId} version ${versionToTest}, skipping.`);
                continue;
            }

            let statusEntry = status_apis.find(api => api.implementation === impl && api.path === path)
            if (!statusEntry) {
                console.log(`❌ No status entry found for implementation ${impl} of API ${apiId}, skipping.`);
                continue;
            }

            let url = statusEntry.url
            if (url[url.length - 1] !== "/"){
                url = url + "/"
            }

            const majorOnly = versionToTest.replace(/^v/, "")
            const apiRef = `${apiId}_v${majorOnly}`
            console.log(`✅ Runtime selected: ${apiRef} → ${url}`)

            ref_to_url[apiRef] = url
        }

        console.log(ref_to_url)

        for (const f of functions) {
            for (const e of edges) {
                const gc_apis = parsed_component.spec[f][e] || []
                const resolvedAPIVersions = config.resolvedAPIVersions || {}

                let includeOptional = false
                if (f === "coreFunction" && e === "exposedAPIs") {
                    includeOptional = config.runExposedOptional
                } else if (f === "securityFunction" && e === "exposedAPIs") {
                    includeOptional = config.runSecurityOptional
                }
                for (const api of gc_apis.filter(a => a.required || includeOptional)) {
                    console.log(`Configuring CTK for ${api.id}`)

                    const versionToTest = resolvedAPIVersions[api.id]
                    if (!versionToTest) {
                        console.log(`⚠️ No resolved version found for ${api.id}, skipping CTK configuration.`)
                        continue // No specific version to resolve for this API
                    }

                    const majorOnly = versionToTest.replace(/^v/, "")
                    const apiRef = `${api.id}_v${majorOnly}`

                    const ctkFolderName = ctkIndex[apiRef]
                    console.log(`Looking for CTK folder for ${apiRef}: ${ctkFolderName}`)
                    //const ctk_location = Path.join(ctkRoot, ctkFolderName)
                    if (!ctkFolderName) {
                        if (!api.required) {
                          console.log(`⚠️ Skipping optional CTK ${apiRef} because folder not found`);
                          continue;
                        }
                        return rejectCTK({
                          api: apiRef,
                          ctkType: "preflight",
                          message: `REQUIRED CTK missing for ${apiRef}: not found in CTK index`,
                          details: { apiRef, ctkIndexKeys: Object.keys(ctkIndex) }
                        });
                    }
                      
                    const ctk_location = Path.join(ctkRoot, ctkFolderName);
                    if (!fs.existsSync(ctk_location)) {
                        if (!api.required) {
                          console.log(`⚠️ Skipping optional CTK ${apiRef} because folder not found`);
                          continue;
                        }
                        return rejectCTK({
                          api: apiRef,
                          ctkType: "preflight",
                          message: `REQUIRED CTK missing for ${apiRef}: expected path ${ctk_location}`,
                          details: { apiRef, ctk_location, ctkFolderName }
                        });
                    }

                    const url = ref_to_url[apiRef]
                    if (!url) {
                        if (!api.required) {
                          console.log(`⚠️ Skipping optional CTK ${apiRef} because runtime URL not found`);
                          continue;
                        }
                        return rejectCTK({
                            api: apiRef,
                            ctkType: "preflight",
                            message: `REQUIRED runtime URL missing for ${apiRef}`,
                            details: { apiRef }
                        })
                    }

                    api_configs.push({
                        path: ctk_location,
                        url: url.replace("localhost", "127.0.0.1"),
                        api_ref: apiRef
                    })
                    console.log(`🔧 Configured CTK for ${apiRef}: ${ctk_location} → ${url}`)
                }
            }
        }

        let ctks_exist = await Promise.all(api_configs.map(async api => await fileExists(api.path)))
        expect(ctks_exist).to.not.include(false)
                
        let configured_ctks = api_configs.map(async api => {
            try {

                const v4File = Path.join(api.path, "config.json")
                const v5File = Path.join(api.path, "CHANGE_ME.json")
        
                let ctk_config_path = null
        
                if (fs.existsSync(v4File)) {
                    ctk_config_path = v4File
                } else if (fs.existsSync(v5File)) {
                    ctk_config_path = v5File
                } else {
                    //throw new Error("No config file found for CTK at " + api.path)
                    return rejectCTK({
                        api: api.api_ref,
                        ctkType: "config",
                        message: `No config file found for CTK at ${api.path}`,
                        details: { ctkPath: api.path }
                    })
                }
        
                let ctk_config = JSON.parse(await loadFile(ctk_config_path))
                ctk_config.url = api.url
                ctk_config.headers = config.headers

                console.log("Configuring: ", ctk_config_path, ctk_config.url, ctk_config.headers)
                let config_data = JSON.stringify(ctk_config, null, 2)
                await writeToFile(ctk_config_path, config_data)
                return true
            }
            catch (error) {
                return rejectCTK({
                    api: api.api_ref,
                    ctkType: "config",
                    message: `Failed configuring CTK config for ${api.api_ref}`,
                    error,
                    details: { ctkPath: api.path }
                });
            }
        })
        //let config_promises = await Promise.all(configured_ctks)
        //expect(config_promises).to.not.include(false)

        const config_settled = await Promise.allSettled(configured_ctks)

        const config_failures = config_settled
            .filter(r => r.status === "rejected")
            .map(r => r.reason);
        if (config_failures.length > 0) {
            config_failures.forEach(e => {
                const msg = e?.details?.message || e?.error?.message || String(e)
                console.log(`${e.api || "unknown-api"} [${e.ctkType || "config"}] ${msg}`);
                if (e.details) console.log("   details:", JSON.stringify(e.details, null, 2));
            })
        }
        expect(config_failures).to.be.empty
        
        let ctk_executions = api_configs.map(async api => {
            try {
                let results = await runAPICTK(api)

                let resultsFolder = Path.join(__dirname, "../../resources/results/api-ctk-results")

                // ---- Detect v4 vs v5 ----
                const v4Html = Path.join(api.path, "reports", "htmlResults.html")
                const v4Json = Path.join(api.path, "reports", "jsonResults.json")

                // TMForum CTK generates reports in DO_NOT_CHANGE/cypress/reports/ or REPORT.HTML at root
                //const v5Html = Path.join(api.path, "DO_NOT_CHANGE", "cypress", "reports", "index.html")
                //const v5Json = Path.join(api.path, "DO_NOT_CHANGE", "cypress", "reports", "index.json")
                const v5Html = Path.join(api.path, "reports", "index.html")
                const v5Json = Path.join(api.path, "reports", "index.json")

                let sourceHtml, sourceJson
                if (fs.existsSync(v4Html) && fs.existsSync(v4Json)) {
                    console.log(`Detected v4 CTK result files for ${api.api_ref}`);
                    sourceHtml = v4Html;
                    sourceJson = v4Json;
                } 
                else if (fs.existsSync(v5Html) && fs.existsSync(v5Json)) {
                    console.log(`Detected v5 CTK result files for ${api.api_ref}`);
                    sourceHtml = v5Html;
                    sourceJson = v5Json;
                } 
                else {
                    //throw new Error(`❌ No result files found for ${api.api_ref} in either v4 or v5 format.`);
                    return rejectCTK({
                        api: api.api_ref,
                        ctkType: "results",
                        message: `No result files found for ${api.api_ref} in either v4 or v5 format`,
                        details: { apiRef: api.api_ref, ctkPath: api.path }
                    })
                }

                let htmlResults = Path.join(resultsFolder, api.api_ref + ".html")
                let jsonResults = Path.join(resultsFolder, api.api_ref + ".json")
                await mkdirp(Path.dirname(htmlResults));
                await mkdirp(Path.dirname(jsonResults));
            
                await copyFile(sourceHtml, htmlResults);
            
                await copyFile(sourceJson, jsonResults);

                return results
            }
            catch (error) {
                return rejectCTK({
                    api: api.api_ref,
                    ctkType: "pipeline",
                    message: `CTK pipeline failed for ${api.api_ref}`,
                    error,
                    details: { ctkPath: api.path }
                });
            }
        })
        //let ctk_results = await Promise.all(ctk_executions)
        //let ctk_errors = ctk_results.filter(result => result.statusCode !== 0)

        const ctk_settled = await Promise.allSettled(ctk_executions)

        const ctk_results = ctk_settled.map(r => {
            if (r.status === "fulfilled") return r.value
            // rejected: return the rejectCTK payload
            return r.reason
        })
        const ctk_errors = ctk_results.filter(r => !r || r.statusCode !== 0)
        //ctk_errors.forEach(error => console.log("Error: " + error.stderr))
        ctk_errors.forEach(e => {
            const msg = e?.details?.message || e?.error?.message || String(e)
            console.log(`${e.api || "unknown-api"} [${e.ctkType || "unknown-type"}] ${msg}`);
            if (e.details) console.log("   details:", JSON.stringify(e.details, null, 2));
        })
        expect(ctk_errors).to.be.empty
    })
})


function copyFile(source, destination) {
    return new Promise((resolve, reject) => {
        fs.copyFile(source, destination, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function runAPICTK(apiData) {
    console.log(`\n==============================`);
    console.log(`🚀 CTK EXECUTION`);
    console.log(`API: ${apiData.api_ref}`);
    console.log(`CTK Path: ${apiData.path}`);
    console.log(`==============================\n`);

    const ctkPath = apiData.path;
    const mode = detectCTKExecutionMode(ctkPath);
    console.log(`🔍 Detected CTK mode: ${mode}`);

    if (mode === "docker-ctk" || mode === "docker-v5") {
        return runDockerCTK(ctkPath, apiData.api_ref);
    }
    
    if (mode === "cypress-v5") {
        return runCypressCTK(ctkPath, apiData.api_ref);
    }

    return rejectCTK({
        api: apiData.api_ref,
        ctkType: "dispatch",
        message: "Unsupported CTK structure",
        details: { ctkPath, detectedMode: mode }
    });
}



function writeToFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err){
                reject(err)
            }
            resolve(true)
        })
    })
}

function loadFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err){
                reject(err)
            }
            resolve(data)
        })
    })
}

function fileExists(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (err.code === "ENOENT") return resolve(false);
                return reject(err); // unexpected filesystem error
            }
            resolve(true);
        })
    })
}


function findApiUrl(apiPath, component_deployment){
    let functions = ["securityAPIs", "coreAPIs"]
    let api_url = ""
    console.log("Searching api path", apiPath)
    let status = component_deployment.body.items[0].status
    functions.forEach(f => {
        let apis = status[f]
        apis.forEach(api => {
            if (api.path === apiPath) {
                api_url = api.url
                if (f === "securityAPIs") {
                    api_url += "/"
                }
            }
        })
    })

    return api_url
}

async function testPartyRole(url, roleName) {
    try {
        const headers = config.headers || {'Content-Type': 'application/json'}
        let {response, body} = await getUrl(url + "partyRole", headers)
        if (isRedirect(response)) {
            const {hostname, protocol} = new URL(url);
            let redirectURL = protocol + "//" + hostname + response.headers.location;
            return await testPartyRole(redirectURL, roleName)
        }
        if(response.statusCode >= 200 && response.statusCode < 300) {
            let jsonBody = JSON.parse(body)
            return jsonBody.filter(role => role.name === roleName).length > 0
        }
        return false
    }
    catch (error) {
        console.log("Error: " + error)
        return false
    }
}

function isValidJSONUrl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let {response, body} = await getUrl(url)
            if (isRedirect(response)) {
                let location = response.headers.location
                //const {hostname, protocol} = new URL(url);
                let redirectURL = new URL(location, url).toString()
                resolve(await isValidJSONUrl(redirectURL))
            }
            if(response.statusCode >= 200 && response.statusCode < 300) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        }
        catch (error) {
            console.log("Error: " + error)
            reject(error)
        }
    })
}


function isRedirect(res) {
    return res.statusCode >= 300 && res.statusCode < 400 && res.headers.location
}

function getUrl(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http
        const options = {
            headers: headers,
            followRedirect: true,
            rejectUnauthorized: config.rejectUnauthorized
        }
        client.get(url, options ,(response) => {
            let data = [];
            response.on('data', (chunk) => {
                data.push(chunk);
            });

            response.on('end', () => {
                let body = Buffer.concat(data).toString()
                resolve({response, body});
            });            
        }).on('error', (error) => {
            reject(error)
        })
    })
}


function loadYamlFromUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url,{rejectUnauthorized: config.rejectUnauthorized},(response) => {
        let data = '';
  
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        response.on('end', () => {
          try {
            const parsedData = YAML.parseDocument(data).toJSON();
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
  

function getComponentDocument (inDocumentArray) {
    return inDocumentArray.find(doc => {
        let kind = doc.get('kind') || ''
        return kind.toLowerCase() === 'component'
    })
};

function extractMajorFromSpec(spec) {
    // Prefer explicit version field
    if (spec.version) {
        return "v" + spec.version.replace(/^v/, "").split(".")[0];
    }

    // Else infer from URL — supports .../v5/api..., .../v4.1.0/...
    const url = spec.url || "";
    const match = url.match(/\/v(\d+)/i) || url.match(/v(\d+)\./i);
    if (match) {
        return "v" + match[1];
    }

    return null;
};

function normalizeExposedApiFromManifest(api) {
    const cloned = { ...api };
  
    if (!cloned.specification || cloned.specification.length === 0) {
      return cloned; // nothing we can do
    }

    if (cloned.specification && cloned.specification.length > 1) {
        return cloned;
    }
  
    const spec0 = { ...cloned.specification[0] };
  
    // Inherit missing fields from top-level API (v1 → v1.1 normalization)
    spec0.version =
      spec0.version || cloned.version || null;
  
    spec0.implementation =
      spec0.implementation || cloned.implementation || null;
  
    spec0.path =
      spec0.path || cloned.path || null;
  
    spec0.developerUI =
      spec0.developerUI || cloned.developerUI || null;
  
    spec0.port =
      spec0.port || cloned.port || null;
  
    spec0.apiType =
      spec0.apiType || cloned.apiType || "openapi";
  
    spec0.apiSDO =
      spec0.apiSDO || cloned.apiSDO || "tmForum";
  
    spec0.gatewayConfiguration =
      spec0.gatewayConfiguration || cloned.gatewayConfiguration || {};
  
    return {
      ...cloned,
      specification: [spec0],
    };
};

function runCommandDebug(command, cwd, label = "CTK", env = process.env) {
    const logMode = (config.ctkLogging.ctkLogs || "summary").toLowerCase();
    const tailN = Number(config.ctkLogging.ctkLogTailLines || 30);

    const streamLive = logMode === "full";
    const printStart = logMode !== "silent";
    const printSuccess = logMode === "full";
    const printFailure = true;

    if (printStart) {
        console.log("\n==============================");
        console.log(`🛠️ EXEC: ${label}`);
        console.log(`📁 CWD:  ${cwd}`);
        console.log(`💻 CMD:  ${command}`);
        console.log(`🔇 MODE: ${logMode}`);
        console.log("==============================\n");
    }
  
    return new Promise((resolve, reject) => {
      const child = exec(command, { cwd, shell: true, env });
  
      let stdoutBuf = "";
      let stderrBuf = "";
  
      child.stdout.on("data", (data) => {
        const s = data.toString();
        stdoutBuf += s;
        if (streamLive) process.stdout.write(`🟢 [stdout] ${s}`);
      });
  
      child.stderr.on("data", (data) => {
        const s = data.toString();
        stderrBuf += s;
        if (streamLive) process.stderr.write(`🔴 [stderr] ${s}`)
      });
  
      child.on("error", (err) => {
        if (printFailure) {
            console.error(`❌ Spawn error in ${label}:`, err.message || err);
        }
        reject({
          exitCode: null,
          stdout: stdoutBuf,
          stderr: stderrBuf,
          error: err,
        });
      });
  
      child.on("close", (code) => {
        console.log(`\n🔚 Process exited with code: ${code}`);
        if (code !== 0) {
          console.error(`\n❌ ${label} failed (exit=${code})`);
          const outTail = tailLines(stdoutBuf, tailN);
          const errTail = tailLines(stderrBuf, tailN);
          if (outTail) {
            console.error(`\n--- stdout (last ${tailN} lines) ---\n${outTail}`);
          }
          if (errTail) {
            console.error(`\n--- stderr (last ${tailN} lines) ---\n${errTail}`);
          }
  
          reject({
            exitCode: code,
            stdout: stdoutBuf,
            stderr: stderrBuf,
            error: new Error(`Command failed with exit code ${code}`),
          });
        } else {
          if (printSuccess) {
            console.log(`\n✅ ${label} succeeded (exit=0)`);
          }
          resolve({
            exitCode: 0,
            stdout: stdoutBuf,
            stderr: stderrBuf,
            statusCode: 0,
          });
        }
      });
    });
}

function printCTKDiagnostics(v5Folder) {
    console.log("\n==============================");
    console.log("🔍 CTK ENVIRONMENT DIAGNOSTICS");
    console.log("==============================");
  
    const pathsToCheck = [
      "node_modules",
      "node_modules/.bin/cypress",
      "package.json",
      "cypress",
      "cypress/e2e",
      "cypress/e2e/production"
    ];
  
    for (const p of pathsToCheck) {
      const full = Path.join(v5Folder, p);
      console.log(`${fs.existsSync(full) ? "✅" : "❌"} ${p}`);
    }
  
    try {
      console.log("\n📦 Node version:");
      console.log(require("child_process").execSync("node -v").toString());
    } catch {}
  
    try {
      console.log("📦 NPM version:");
      console.log(require("child_process").execSync("npm -v").toString());
    } catch {}
  
    try {
      console.log("📦 Cypress version:");
      console.log(require("child_process").execSync("npx cypress --version", {
        cwd: v5Folder
      }).toString());
    } catch (e) {
      console.log("❌ Cypress version check failed");
    }
  }

function detectCTKExecutionMode(ctkPath) {
    const runSh = Path.join(ctkPath, "run.sh");
    const runBat = Path.join(ctkPath, "run.bat");
    const v5Folder = Path.join(ctkPath, "DO_NOT_CHANGE");
    const dockerCompose = Path.join(ctkPath, "docker-compose.yaml");

    const hasV5Folder = fs.existsSync(v5Folder);
    const hasCompose = fs.existsSync(dockerCompose);
    const hasRunScripts = fs.existsSync(runSh) || fs.existsSync(runBat);

    // v5 family classification
    if (hasV5Folder) {
        if (hasCompose || hasRunScripts) return "docker-v5";
        return "cypress-v5";
    }
    // v4 family classification
    if (hasCompose || hasRunScripts) return "docker-ctk";

    return "unknown";
}

function ensureDockerAvailable(){
    try {
        execSync("docker --version", {stdio: 'ignore'});
    } catch (error) {
        return { ok: false, message: "Docker CLI not found", error };
    }
    try {
        // This fails if Docker daemon/Desktop isn't running or not reachable
        execSync("docker info", { stdio: "ignore" });
    } catch (error) {
        return { ok: false, message: "Docker daemon not running or not reachable", error };
    }

    return { ok: true };
}

async function runDockerCTK(ctkPath, apiRef){
    console.log(`Running Docker CTK for ${apiRef} at ${ctkPath}`);

    const docker = ensureDockerAvailable();
    if (!docker.ok) {
        console.log(`❌ Docker not available: ${docker.message}`);
        return rejectCTK({
          api: apiRef,
          ctkType: "docker",
          message: docker.message,
          error: docker.error,
          details: { ctkPath }
        });
    }
    

    const isWindows = process.platform === "win32";
    const script = isWindows ? "run.bat" : "run.sh";
    const scriptPath = Path.join(ctkPath, script);

    if (!fs.existsSync(scriptPath)) {
        //throw new Error(`Expected Docker CTK script not found: ${scriptPath}`);
        return rejectCTK({
            api: apiRef,
            ctkType: "docker",
            message: `Expected Docker CTK script not found: ${scriptPath}`,
            details: { scriptPath, ctkPath }
        });
    }
    // ✅ PATCH: suppress report auto-open (idempotent + auditable + line endings + perms)
    const patchRes = await patchDockerRunScripts(ctkPath, apiRef);
    if (!patchRes.ok) {
        return rejectCTK({
        api: apiRef,
        ctkType: "docker",
        message: `Failed to patch ${script} for ${apiRef}`,
        details: { ctkPath, scriptPath, patchRes }
        });
    }

    if (!isWindows) {
        try {
            fs.chmodSync(scriptPath, 0o755);
        } catch (err) {
            return rejectCTK({
              api: apiRef,
              ctkType: "docker",
              message: `Failed to chmod +x ${scriptPath}`,
              error: err,
              details: { scriptPath, ctkPath }
            });
        }
    }

    // ✅ Always provide platform env var (required by v5; harmless for v4)
    const platformValue = computeDockerPlatformEnv();
    const env = { ...process.env, platform: process.env.platform || platformValue };

    return runCommandDebug(
        isWindows ? script : `./${script}`,
        ctkPath,
        `${apiRef} (Docker CTK)`,
        env
    ).then(() => ({
        statusCode: 0,
        api: apiRef,
        ctkType: "docker",
        status: "SUCCESS",
        workingDirectory: ctkPath,
        reports: {
            html: Path.join(ctkPath, "reports", "htmlResults.html"),
            json: Path.join(ctkPath, "reports", "jsonResults.json")
        }
    }))
    .catch(err => rejectCTK({
        api: apiRef,
        ctkType: "docker",
        message: `Docker CTK execution failed for ${apiRef}`,
        error: err,
        details: { ctkPath, scriptPath }
    }));
}

async function runCypressCTK(ctkPath, apiRef){
    console.log(`Running Cypress CTK for ${apiRef} at ${ctkPath}`);

    const v5Folder = Path.join(ctkPath, "DO_NOT_CHANGE");
    const changeMe = Path.join(ctkPath, "CHANGE_ME.json");
    const targetConfig = Path.join(v5Folder, "cypress", "fixtures", "config.json");

    if (!fs.existsSync(changeMe)) {
        //throw new Error(`CHANGE_ME.json not found for ${apiRef} CTK at ${changeMe}`);
        return rejectCTK({
            api: apiRef,
            ctkType: "cypress-v5",
            message: `CHANGE_ME.json not found for ${apiRef} CTK at ${changeMe}`,
            details: { changeMe, v5Folder }
        });
    }
    if (!fs.existsSync(v5Folder)) {
        return rejectCTK({
            api: apiRef,
            ctkType: "cypress-v5",
            message: `DO_NOT_CHANGE folder not found at ${v5Folder}`,
            details: { ctkPath, v5Folder }
        });
    }
    

    try {
        fs.copyFileSync(changeMe, targetConfig);
        console.log("Injected CHANGE_ME.json into Cypress config:", targetConfig);
    } catch (err) {
        return rejectCTK({
            api: apiRef,
            ctkType: "cypress-v5",
            message: "Failed to inject CHANGE_ME.json into Cypress config",
            error: err,
            details: { changeMe, targetConfig, ctkPath, v5Folder }
        });
    }

    printCTKDiagnostics(v5Folder);

    try {
        await forceFreshNpmInstall(v5Folder, apiRef);
    } catch (e) {
        return rejectCTK({
          api: apiRef,
          ctkType: "cypress-v5",
          message: `Dependency install failed for ${apiRef}`,
          error: e.error || e,
          details: { ctkPath, v5Folder, stderr: e.stderr, stdout: e.stdout }
        });
    }
    
    const runCmd = "npm start && npm run report";
    try {
        await runCommandDebug(runCmd, v5Folder, `${apiRef} (Cypress CTK)`);
        return {
          statusCode: 0,
          api: apiRef,
          ctkType: "cypress-v5",
          status: "SUCCESS",
          workingDirectory: v5Folder,
          reports: {
            html: Path.join(v5Folder, "cypress", "reports", "index.html"),
            json: Path.join(v5Folder, "cypress", "reports", "index.json")
          }
        };
    } catch (e) {
        return rejectCTK({
          api: apiRef,
          ctkType: "cypress-v5",
          message: `Cypress CTK execution failed for ${apiRef}`,
          error: e.error || e,
          details: { ctkPath, v5Folder, command: runCmd, stderr: e.stderr, stdout: e.stdout }
        });
    }
}

function rejectCTK({ api, ctkType, message, details = {}, error = null }) {
    return Promise.reject({
        status: "FAILED",
        statusCode: 1,
        api,
        ctkType,
        error: error instanceof Error ? error : new Error(message),
        details: { message, ...details }
    });
}

function safeRmRf(targetPath) {
    try {
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
}
  
async function forceFreshNpmInstall(v5Folder, apiRef) {
    const nm = Path.join(v5Folder, "node_modules");
    const cache = Path.join(v5Folder, "node_modules", ".cache");
    const lock = Path.join(v5Folder, "package-lock.json");
  
    const removedNm = safeRmRf(nm);
    // If node_modules removed, cache is gone too, but safe anyway
    safeRmRf(cache);
  
    if (removedNm) {
      console.log(`🧹 Removed downloaded node_modules for ${apiRef}`);
    } else {
      console.log(`ℹ️ node_modules not present (fresh folder) for ${apiRef}`);
    }
  
    const installCmd = fs.existsSync(lock) ? "npm ci" : "npm install";
    console.log(`📦 Installing dependencies (${installCmd}) for ${apiRef}`);
    await runCommandDebug(installCmd, v5Folder, `${apiRef} (${installCmd})`);
}

function tailLines(text, n = 30) {
    if (!text) return "";
    const lines = text.toString().split(/\r?\n/);
    return lines.slice(Math.max(0, lines.length - n)).join("\n");
}

async function patchDockerRunScripts(ctkPath, apiRef) {
    /**
    * Patches run.sh/run.bat to suppress report auto-open (always).
    * - Idempotent via in-file markers
    * - Preserves cleanup/exit codes by only removing the "open" part
    * - Writes a backup once (run.sh.bak / run.bat.bak)
    * - Writes an audit log per CTK folder (ctk-run-script-patch.log)
    * - Preserves line endings; enforces CRLF for .bat
    */
   const isWin = process.platform === "win32";
   const script = isWin ? "run.bat" : "run.sh";
   const scriptPath = Path.join(ctkPath, script);

   if (!fs.existsSync(scriptPath)) {
        return { ok: false, reason: "script-missing", scriptPath };
   }

   const PATCH_ID = "TMF_CTK_SUPPRESS_REPORT_OPEN_V2";
   const BEGIN = isWin
        ? `REM === BEGIN PATCH: ${PATCH_ID} ===`
        : `# === BEGIN PATCH: ${PATCH_ID} ===`;
    const END = isWin
        ? `REM === END PATCH: ${PATCH_ID} ===`
        : `# === END PATCH: ${PATCH_ID} ===`;

    // Read as buffer to avoid accidental newline normalization on Windows
    const rawBuf = fs.readFileSync(scriptPath);
    let content = rawBuf.toString("utf8");

    // Idempotency: if already patched, just ensure permissions and return
    if (content.includes(BEGIN) && content.includes(END)) {
        try {
            if (!isWin) {
                fs.chmodSync(scriptPath, 0o755);
            }
        } catch (err) {
            return { ok: false, reason: "chmod-failed", error: err, scriptPath };
        }
        writePatchAudit(ctkPath, apiRef, script, scriptPath, "SKIPPED_ALREADY_PATCHED");
        return { ok: true, patched: false, scriptPath };
    }

    // Backup for traceability
    const backupPath = scriptPath + ".bak";
    if (!fs.existsSync(backupPath)) {
        try {
            fs.writeFileSync(backupPath, rawBuf);
        } catch (err) {
            return { ok: false, reason: "backup-failed", error: err, scriptPath, backupPath };
        }
    }

    // Patch logic
    let patchedContent;
    if (isWin) {
        patchedContent = patchRunBat(content, BEGIN, END);
        patchedContent = normalizeToCRLF(patchedContent);
    } else {
        patchedContent = patchRunSh(content, BEGIN, END);
        patchedContent = normalizeToLF(patchedContent);
    }

    // Write Back
    fs.writeFileSync(scriptPath, patchedContent, { encoding: "utf8" });

    try {
        if (!isWin) {
            fs.chmodSync(scriptPath, 0o755);
        }
    } catch (err) {
        return { ok: false, reason: "chmod-failed", error: err, scriptPath };
    }
    writePatchAudit(ctkPath, apiRef, script, scriptPath, "PATCHED");
    return { ok: true, patched: true, scriptPath, backupPath };
}

function writePatchAudit(ctkPath, apiRef, scriptName, scriptPath, action) {
    try {
      const auditPath = Path.join(ctkPath, "ctk-run-script-patch.log");
      const ts = new Date().toISOString();
      const line = `${ts} | ${action} | api=${apiRef} | script=${scriptName} | path=${scriptPath}${os.EOL}`;
      fs.appendFileSync(auditPath, line, { encoding: "utf8" });
    } catch (e) {
      // best-effort audit; do not fail the CTK because audit logging failed
    }
}
  
/**
* run.sh patch:
* We DO NOT remove report existence checks, cleanup(), trap, or exit codes.
* We only replace the OS-specific open block with a no-op message.
*/
//function patchRunSh(content, BEGIN, END) {
    // Typical block:
    // if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    //     xdg-open $reportPath
    // elif [[ "$OSTYPE" == "darwin"* ]]; then
    //     open $reportPath
    // else
    //     echo "Unsupported OS. Please open ${reportPath} manually."
    // fi
    //
    // We'll replace that entire if/elif/else/fi with a suppressed message.
//    const openBlockRegex =
//      /if\s+\[\[\s*"\$OSTYPE"\s*==\s*"linux-gnu"\*?\s*\]\];\s*then[\s\S]*?\n\s*xdg-open\s+\$[A-Za-z_][A-Za-z0-9_]*\s*[\s\S]*?elif\s+\[\[\s*"\$OSTYPE"\s*==\s*"darwin"\*?\s*\]\];\s*then[\s\S]*?\n\s*open\s+\$[A-Za-z_][A-Za-z0-9_]*\s*[\s\S]*?else[\s\S]*?fi\s*/m;
//  
//    if (openBlockRegex.test(content)) {
//        const replacement =
//          `${BEGIN}\n` +
//          `echo "📄 Report auto-open suppressed by CTK framework."\n` +
//          `echo "   (If generated) report is under ./reports/ or REPORT.HTML in this CTK folder."\n` +
//          `${END}\n`;
    
//        return content.replace(openBlockRegex, replacement);
//    }
    
    // Fallback: comment out any xdg-open/open line that references reportPath or modifiedReportPath
 //   const safeCommented = content
 //       .replace(/^\s*xdg-open\s+\$[A-Za-z_][A-Za-z0-9_]*\s*$/gm, "# $&  # suppressed by CTK framework")
 //       .replace(/^\s*open\s+\$[A-Za-z_][A-Za-z0-9_]*\s*$/gm, "# $&  # suppressed by CTK framework");
    
 //   return safeCommented + `\n${BEGIN}\n# No OS open-block found; commented out direct open/xdg-open lines.\n${END}\n`;
//}
function patchRunSh(content, BEGIN, END) {
    // Idempotent marker: append markers only once
    const already = content.includes(BEGIN) && content.includes(END);
  
    // Comment out any open commands (works with reportPath, modifiedReportPath, etc.)
    let patched = content
        .replace(/^(\s*)xdg-open(\s+.*)$/gm, '$1: # xdg-open suppressed by CTK framework')
        .replace(/^(\s*)open(\s+.*)$/gm, '$1: # open suppressed by CTK framework');
  
    if (!already) {
        patched += `\n${BEGIN}\n# Suppressed report auto-open by commenting open/xdg-open commands.\n${END}\n`;
    }
  
    return patched;
}  
/**
 * run.bat patch:
* Replace:
*   start "" "%REPORT_PATH%"
* with:
*   REM suppressed message
* Keep cleanup and exit codes unchanged.
*/
function patchRunBat(content, BEGIN, END) {
    // Most CTKs have exactly: start "" "%REPORT_PATH%"
    // We'll replace any "start ... REPORT_PATH" with a suppressed message block.
    const startLineRegex = /^\s*start\s+""\s+"%(REPORT_PATH|modifiedReportPath)%"?\s*$/gmi;
  
    if (startAnyReportRegex.test(content)) {
        const suppressed =
          `${BEGIN}\r\n` +
          `echo Report auto-open suppressed by CTK framework.\r\n` +
          `${END}\r\n`;
    
        return content.replace(startAnyReportRegex, suppressed.trimEnd());
    }
    
    // Fallback: comment out any start that references REPORT_PATH or modifiedReportPath
    const fallback = content.replace(
        /^\s*start\b.*%(REPORT_PATH|modifiedReportPath)%.*$/gmi,
        "REM $&  REM suppressed by CTK framework"
    );
    
    return `${BEGIN}\r\n${fallback}\r\n${END}\r\n`;
}
  
// --- newline helpers ---
function normalizeToCRLF(s) {
    // convert any \r\n or \n to \r\n consistently
    return s.replace(/\r?\n/g, "\r\n");
}
  
function normalizeToLF(s) {
    return s.replace(/\r\n/g, "\n");
}

function computeDockerPlatformEnv() {
    // default to amd64 unless we can confidently infer arm64
    const arch = process.arch; // 'arm64', 'x64', etc.
    const isArm = arch === "arm64";
  
    // Linux images in your CTKs are for linux/*
    // v5 requires this env var named exactly: platform
    return isArm ? "linux/arm64" : "linux/amd64";
}