const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const addContext = require('mochawesome/addContext');
const config  = require('../ctkconfig.json')
const fs = require('fs')
const Path = require('path')
const YAML = require('yaml');
const https = require('https')
const http = require('http');
const exp = require('constants');
chai.use(chaiHttp)

const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath

describe('Step 0: Component file checks', function () {
    this.timeout(150000)
    let component_manifests;
    let component_object;

    before(async function() {
        console.log("Reading component file", config.componentFilePath)
        let manifest = await fs.promises.readFile(config.componentFilePath, 'utf8')
        component_manifests = YAML.parseAllDocuments(manifest)
        component_object = getComponentDocument(component_manifests)
        //console.log("Found component", component_object)
    })

    it('File exists', async function () {
        addContext(this, 'File must exist at the path specified in ctkconfig.json')
        let fileExists = fs.existsSync(config.componentFilePath)
        expect(fileExists).to.be.true
    })

    it('File contains valid YAML', async function () {
        addContext(this, 'File must contain valid YAML')
        addContext(this, "Component manifest must be valid YAML")
        expect(component_manifests).to.not.be.null
        expect(component_manifests).to.be.an("array")
        expect(component_manifests.length).to.be.greaterThan(0)

        component_manifests.forEach((doc, i) => {
            expect(doc.errors.length, `Found YAML errors in document ${i}: `).to.be.equal(0)
        })
    })
})


describe('Step 1: Component manifest checks',  function() {
    this.timeout(150000)
    let component_manifests;
    let component_object;
    let gc_manifest;
    let js_component;

    before(async function() {
        let manifest = await fs.promises.readFile(config.componentFilePath, 'utf8')
        let golden_component = await fs.promises.readFile(GOLDEN_COMPONENT_PATH, 'utf8')
        gc_manifest = YAML.parseDocument(golden_component)
        component_manifests = YAML.parseAllDocuments(manifest)
        component_object = getComponentDocument(component_manifests)
        js_component = component_object.toJSON()
    })

    it("Document of kind  'Component' is found", async function() {
        addContext(this, 'Component manifest must contain a document of kind: Component')
        expect(component_object).to.not.be.null
    })

    it('Component api version is within supported versions', async function () {
        addContext(this, 'Component manifest must contain a supported apiVersion')
        const supportedVersions = ['oda.tmforum.org/v1', 'oda.tmforum.org/v1beta4', 'oda.tmforum.org/v1beta3']
        let apiVersion = component_object.get('apiVersion')
        expect(apiVersion).to.not.be.null
        expect(apiVersion).to.be.a('string')
        expect(supportedVersions.includes(apiVersion)).to.be.true
    })

    it ('Component has metadata field', async function () {
        addContext(this, 'Component manifest must contain a metadata field')
        let metadata = component_object.get('metadata')
        expect(metadata).to.not.be.null
        expect(metadata).to.be.an('object')
    })

    it ('Component metadata has name and labels', async function () {
        addContext(this, 'Component metadata must contain name and labels fields')
        let metadata = component_object.get('metadata')
        expect(metadata.get("name")).to.not.be.null
        expect(metadata.get("labels")).to.not.be.null
        expect(metadata.get("name")).to.be.a('string')
        expect(metadata.get("labels")).to.be.an('object')
    })

    it ('Component has spec field', async function () {
        addContext(this, 'Component manifest must contain a spec field')
        let spec = component_object.get('spec')
        expect(spec).to.not.be.null
        expect(spec).to.be.an('object')
    })

    it('Spec has coreFunction with exposed and dependent APIs', async function () {
        addContext(this, 'Component spec must contain a coreFunction field with exposedAPIs and dependentAPIs')
        let coreFunction = component_object.get('spec').get('coreFunction')
        expect(coreFunction).to.not.be.null
        expect(coreFunction).to.be.an('object')
        expect(coreFunction.get('exposedAPIs')).to.not.be.null
        expect(coreFunction.get('dependentAPIs')).to.not.be.null
        expect(coreFunction.get('exposedAPIs').items).to.be.an('array')
        expect(coreFunction.get('dependentAPIs').items).to.be.an('array')
    })

    it('Spec has security function', async function () {
        addContext(this, 'Component spec must contain a security field')
        let security = component_object.get('spec').get('securityFunction')
        expect(security).to.not.be.null
        expect(security).to.be.an('object')
    })

    it('Security function has canvas system role or exposed apis', async function () {
        addContext(this, 'Security function must contain a canvas system role (string) or expose a partyRole API')
        let security = component_object.get('spec').get('securityFunction')
        const canvasSystemRole = security.get('canvasSystemRole')
        const securityAPIs = security.get('exposedAPIs')?.items || []

        const hasCanvasSystemRole = typeof canvasSystemRole === 'string' && canvasSystemRole.trim() !== ''
        const hasPartyRoleAPI = securityAPIs.some(api => api.get('id')?.includes('TMF669'))

        expect(
            hasCanvasSystemRole || hasPartyRoleAPI,
            `Expected at least one of canvasSystemRole or partyRole API\n` +
            `canvasSystemRole found: ${hasCanvasSystemRole ? `"${canvasSystemRole}"` : 'not found'}\n` +
            `partyRole API found: ${hasPartyRoleAPI ? 'present' : 'not present'}`
        ).to.be.true
    })

    it('All resources are labelled with the component name', async function () {
        addContext(this, 'All resources in the component manifest must be labelled with the component name')
        //Add Kind in supportedKind Array to check lable Test Case
        const supportedKind = ['PersistentVolumeClaim','Deployment']

        let metadata = component_object.get('metadata')
        let name = metadata.get("labels").get('oda.tmforum.org/componentName')
        component_manifests.forEach(manifest => {
            if (supportedKind.includes(manifest.get('kind'))){
                let labels = manifest.get('metadata').get('labels')
                expect(labels.get('oda.tmforum.org/componentName')).to.be.equal(name)
            }
            
        })
    })

    it('Standard component specification exists in ctk', async function () {
        addContext(this, 'Standard component specification must exist in the resources folder')
        expect(fs.existsSync(GOLDEN_COMPONENT_PATH)).to.be.true
    })

    it("Component ID from the manifest of component under test matches the standard specification", async function () {
        addContext(this, 'Component manifest ID must match the ID in the standard component specification')
    
        const gc_id = gc_manifest.get("spec")?.get("componentMetadata")?.get("id")
        const deployed_id = component_object.get("spec")?.get("componentMetadata")?.get("id")
    
        expect(gc_id, "Component ID not found in standard specification").to.exist
        expect(deployed_id, "Component ID not found in component manifest").to.exist

        const deployedLower = deployed_id.toLowerCase()
        const gcIdLower = gc_id.toLowerCase()

        expect(deployedLower.includes(gcIdLower), `Mismatch between deployed component ID (${deployed_id}) and standard specification ID (${gc_id})`).to.be.true
    })

    it('Exposed Apis defined in standard component specification must be specified in component manifest', async function () {
        addContext(this, 'All mandatory Exposed APIs defined in the standard component specification must be specified in the component manifest')
        let gc_apis = gc_manifest.get("spec").get("coreFunction").get("exposedAPIs").items
        let comp_api = component_object.get("spec").get("coreFunction").get("exposedAPIs").items

//        const normalizeName = name => name.toLowerCase().replace(/-api$/, '').replace(/-/g, '')
//        let gc_api_names = gc_apis.filter(api => api.get("required")).map(api => normalizeName(api.get("name")))
//        let comp_api_names = comp_api.map(api => normalizeName(api.get("name")))

        let gc_api_ids = gc_apis.filter(api => api.get("required")).map(api => api.get("id"))
        let comp_api_ids = comp_api.map(api => api.get("id"))

//        gc_api_names.forEach(api => {
//            expect(comp_api_names).to.include(api)
//        })

        gc_api_ids.forEach(api => {
            expect(comp_api_ids).to.include(api, `Missing required ExposedAPI ID: ${api} in component manifest`)
        })
    })

    it('Dependent APIs defined in the standard component specification must be specified in the component manifest', async function () {
        addContext(this, 'All mandatory Dependent APIs in the standard component specification must also be declared in the component manifest')
    
        const gc_dependent_apis = gc_manifest.get("spec").get("coreFunction").get("dependentAPIs")?.items || []
        const comp_dependent_apis = component_object.get("spec").get("coreFunction").get("dependentAPIs")?.items || []
    
        const gc_dependent_ids = gc_dependent_apis.filter(api => api.get("required")).map(api => api.get("id"))
        
        const comp_dependent_ids = comp_dependent_apis.map(api => api.get("id"))
    
        gc_dependent_ids.forEach(api_id => {
            expect(comp_dependent_ids).to.include(
                api_id,
                `Missing required dependent API ID: ${api_id} in component manifest`
            )
        })
    })

    it('All swagger urls must be valid and accessible and version fields ', async function () {
        addContext(this, 'All swagger urls must be valid and accessible')
        let functions = ["coreFunction", "securityFunction"]
        let edges = ["exposedAPIs", "dependentAPIs"]

        let url_queries = []

        functions.forEach(f => {
            edges.forEach(e => {
                let apis = js_component.spec[f][e] || []
                let spec_tests = apis.map(async api => {
                    let specObj = api.specification?.[0] 
                    let spec = specObj?.url || ""
                    if (!spec) {
                        console.log(`No specification found for ${api.name}`)
                    }
                    if (typeof spec !== "string"){
                        spec = spec[0] || ""
                    }
                    return await testApiSpecLink(spec)
                })

                url_queries.push(...spec_tests)
            })
        })

        let results = await Promise.all(url_queries)
        results.forEach(result => {
            expect(result).to.be.true
        })
    })

})

function testApiSpecLink(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject("No url provided in specification field")
        }
        const client = url.startsWith('https') ? https : http
        client.get(url,{rejectUnauthorized: config.rejectUnauthorized}, (response) => {
            let data = ''
            response.on('data', chunk => {
                data += chunk
            })

            response.on('end', () => {
                try {
                    document = YAML.parseDocument(data).toJSON()
                    //console.log(document)
                    expect(document.info.version).to.not.be.undefined
                    //expect(document.info["x-api-id"]).to.not.be.undefined

                    resolve(true)
                }
                catch (e) {
                    console.log(e)
                    reject(e)
                }
            })



        }).on('error', (err) => {
            console.log(err)
            resolve(false)
        })

    })
}

function getComponentDocument (inDocumentArray) {
    return inDocumentArray.find(doc => {
        let kind = doc.get('kind') || ''
        return kind.toLowerCase() === 'component'
    })
};
  