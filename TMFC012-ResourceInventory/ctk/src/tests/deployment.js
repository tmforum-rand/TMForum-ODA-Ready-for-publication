const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const addContext = require('mochawesome/addContext');
const config  = require('../ctkconfig.json')
const fs = require('fs')
const Path = require('path')
const url = require('url')
const YAML = require('yaml');
const https = require('https')
const http = require('http')
const mkdirp = require('mkdirp');
const k8s = require('@kubernetes/client-node');
const { exec } = require('child_process');

chai.use(chaiHttp)

const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath
const COMPONENT = 'Component'
const COMPONENTS = 'components'
const NAMESPACE = "components"
const HEADER = process.env.HEADER
const TMFORUM_ODA_API_GROUP = 'oda.tmforum.org'
const TMFORUM_ODA_API_VERSION = 'v1beta3'
const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api)
const k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi)



describe('Step 0: Basic environment connectivity tests', function () {
    it('Kubectl configured correctly', async function () {
        addContext(this, 'The pourpose of this test is to check if the kubectl is configured correctly')
        addContext(this, 'The configuration must be available and the context must be set to the correct cluster')
        let pods = await k8sCoreApi.listNamespacedPod(NAMESPACE)
        expect(pods, "Kubectl should return pods in " + NAMESPACE + " namespace").to.be.a('object')
    })
})

describe("Step 1: Deployment component tests", function () {
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

    it('Test if all exposed api are accessible and return status is 200', async function() {
        addContext(this, 'All exposed apis defined in the component must provide a valid url')
        let apis = deployment.body.items[0].status.coreAPIs
        let api_queries = apis.map(async api => await isValidJSONUrl(api.url))
        let results = await Promise.all(api_queries)
        expect(results).to.not.include(false)
    })

    it('Security api must return at least one partyrole with controller role defined in component file', async function() {
        addContext(this, 'The security api must return at least one partyrole')
        let security_apis = deployment.body.items[0].status.securityAPIs
        let roleName = js_component.spec.securityFunction.controllerRole
        let api_queries = security_apis.map(async api => await testPartyRole(api.url + "/", roleName))
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

        let status_apis = deployment.body.items[0].status["coreAPIs"] || []
        status_apis = status_apis.concat(deployment.body.items[0].status["securityAPIs"] || [])
        for (api of status_apis) {
            let impl = api.implementation
            let url = api.url
            if (url[url.length - 1] !== "/"){
                url = url + "/"
            }
            for (body_api of body_apis) {
                if (body_api.implementation === impl) {
                    let spec = body_api.specification
                    if (typeof spec !== "string"){
                        spec = spec[0]
                    }
                    let swagger = await loadYamlFromUrl(spec)
                    let api_ref = swagger.info["x-api-id"] + "_v" + swagger.info.version
                    ref_to_url[api_ref] = url
                }
            }
        }

        //console.log(ref_to_url)

        functions.forEach(f => {
            edges.forEach(e => {
                let gc_apis = parsed_component.spec[f][e] || []
                //let apis = js_component.spec[f][e] || []
                
                gc_apis.filter(api => api.required).forEach(api => {
                    console.log(`Configuring CTK for ${api.name}`)
                    api_ref = api.id + "_" + api.version
                    ctk_location = Path.join("../resources/api-ctks", api_ref)
                    api_configs.push({
                        path: ctk_location,
                        url: ref_to_url[api_ref],
                        api_ref: api_ref
                    })
                })
            })
        })

        let ctks_exist = await Promise.all(api_configs.map(async api => await fileExists(api.path)))
        expect(ctks_exist).to.not.include(false)
        
        let configured_ctks = api_configs.map(async api => {
            try {

                let ctk_config_path = Path.join(api.path, "config.json")
                let ctk_config = JSON.parse(await loadFile(ctk_config_path))
                ctk_config.url = api.url
                //console.log("Configuring headers", config.headers)
                ctk_config.headers = config.headers
                let config_data = JSON.stringify(ctk_config, null, 2)
                await writeToFile(ctk_config_path, config_data)
                return true
            }
            catch (error) {
                console.log("Error: " + error)
            }
            return false
        })
        let config_promises = await Promise.all(configured_ctks)
        expect(config_promises).to.not.include(false)
        
        let ctk_executions = api_configs.map(async api => {
            try {
                let results = await runAPICTK(api)

                let resultsFolder = Path.normalize("../resources/results/api-ctk-results")
                let htmlResultsFile = Path.join(api.path, "htmlResults.html")
                let jsonResultsFile = Path.join(api.path, "jsonResults.json")

                let htmlResults = Path.join(resultsFolder, api.api_ref + ".html")
                let jsonResults = Path.join(resultsFolder, api.api_ref + ".json")
                await mkdirp(Path.dirname(htmlResults));
                await mkdirp(Path.dirname(jsonResults));
            
                await copyFile(htmlResultsFile, htmlResults);
            
                await copyFile(jsonResultsFile, jsonResults);

                return results
            }
            catch (error) {
                console.log("Error: " + error)
                return error
            }
        })
        let ctk_results = await Promise.all(ctk_executions)
        let ctk_erros = ctk_results.filter(result => result.statusCode !== 0)
        ctk_erros.forEach(error => console.log("Error: " + error.stderr))
        expect(ctk_erros).to.be.empty
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
    let ctkPath = apiData.path
    let command = "npm install && npm start"
    console.log("Running command", Path.join(ctkPath, "ctk"))
    let command_options = {
        cwd: Path.join(ctkPath, "ctk")
    }

    return new Promise((resolve, reject) => {
        exec(command, command_options,(error, stdout, stderr) => {
            if (error) {
              reject({
                    error: error,
                    stdout: stdout,
                    stderr: stderr,
                    statusCode: error.code
              })
            }
            resolve({
                stdout: stdout,
                stderr: stderr,
                statusCode: 0
            })
          
        });
    })
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
            if (err){
                reject(err)
            }
            resolve(true)
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

        let {response, body} = await getUrl(url + "partyRole")
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
                const {hostname, protocol} = new URL(url);
                let redirectURL = protocol + "//" + hostname + response.headers.location;
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

function getUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http
        client.get(url, {followRedirect: true},(response) => {
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
      https.get(url, (response) => {
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
  