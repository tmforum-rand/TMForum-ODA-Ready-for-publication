const Mocha = require('mocha')
const { loadConfiguration, runCucumber } = require('@cucumber/cucumber/api')
const CucuReporter = require('cucumber-html-reporter');
const process = require('process')
const fs = require('fs')
const path = require("path")
const mochaOptions = require('./.mocharc.json')
const Path = require('path')
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const config  = require('./ctkconfig.json')
const YAML = require('yaml');
const exp = require('constants');
const { execSync } = require('child_process');
const { json } = require('stream/consumers');
const { merge } = require('lodash');
const configPath = path.resolve(__dirname, '../CHANGE_ME.json');
const configData = require(configPath);
const resolvedAPIVersions = config.resolvedAPIVersions || {};



const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath
const ODA_COMPONENT_BASE_URL = "https://www.tmforum.org/oda/directory/components-map/core-commerce-management/";


var canvasVersion= "v1beta3";
var kubernetes= "v1";
var canvasCTKPassed= false;
var ctkVersion = "v1.0.0"

class Component {
  constructor(componentInstance){
    this.instance = componentInstance 
  }

  getVersion(){
    return this.instance.spec.componentMetadata.version
  }

  async getCoreFunctionResults(resultsPath){
    let coreExposedApis = this.instance.spec.coreFunction.exposedAPIs
    let apiResultsPath = Path.join(resultsPath, "api-ctk-results")

    let results = coreExposedApis.filter(api => api.required || config.runExposedOptional).map(async api => {
      let resolvedVersion = resolvedAPIVersions[api.id];
      console.log(`Resolved version for ${api.id} is ${resolvedVersion}`);
      let majorApiVersion = null;
      if (resolvedVersion) {
        majorApiVersion = resolvedVersion.replace(/^v/, "");
      } else {
        // fallback to spec (rarely needed)
        const apiVersionFromSpec = api.specification?.[0]?.version || "v0";
        majorApiVersion = apiVersionFromSpec.match(/^v?(\d+)/)?.[1];
      }
      console.log(`📌 Using major API version for ${api.id}: v${majorApiVersion}`)

      let expectedApiRelease = `${api.id}_v${majorApiVersion}`;
      console.log(`apiRelease is now: ${expectedApiRelease}`)    
      let apiOptionalText = api.required ?  "Mandatory" : "Optional" 

      // 4️⃣ Find actual JSON result file for v4 or v5
      let actualJsonPath = await findMatchingVersionByMajor(
        apiResultsPath,
        api.id,
        majorApiVersion
      );

      if (!actualJsonPath) {
          console.warn(`⚠️ Warning: No matching CTK result found for ${api.id} (${majorApiVersion})`);
          //return null; // Skip this API if no matching result exists
          return null
       }

      console.log(`✅ Using file: ${actualJsonPath}`);


      if (api.required || config.runExposedOptional){
      try {
        let reportRaw = await fs.promises.readFile(actualJsonPath, 'utf8')
        let report = JSON.parse(reportRaw)
        const parsed = parseCtkResult(report);

        return {
          apiName: `${api.id} ${api.name.split('-').join(" ")} (v${majorApiVersion}) - ${apiOptionalText}`,
          htmlResultsPath: Path.join(resultsPath, "api-ctk-results", expectedApiRelease + ".html"),
          jsonResultsPath: actualJsonPath,
          htmlUrl: "../results/api-ctk-results/" + expectedApiRelease + ".html",
          hasPassed: parsed.failed === 0
        }
      }
      catch (e) {
        console.log("Error processing api ctk result report ", e)
        return null
      }
    }
    })
    return Promise.all(results)
  }

  async getSecurityFunctionResults(resultsPath){
    let securityApis = this.instance.spec.securityFunction.exposedAPIs
    let apiResultsPath = Path.join(resultsPath, "api-ctk-results")

    let results = securityApis.filter(api => api.required).map(async api => {
      
      let resolvedVersion = resolvedAPIVersions[api.id];
      let majorApiVersion = null;
      if (resolvedVersion) {
        majorApiVersion = resolvedVersion.replace(/^v/, "");
      } else {
        // fallback to spec (rarely needed)
        const apiVersionFromSpec = api.specification?.[0]?.version || "v0";
        majorApiVersion = apiVersionFromSpec.match(/^v?(\d+)/)?.[1];
      }
      console.log(`📌 Using major API version for ${api.id}: v${majorApiVersion}`)

      let expectedApiRelease = `${api.id}_v${majorApiVersion}`;
      console.log(`apiRelease is now: ${expectedApiRelease}`)    
      let apiOptionalText = api.required ?  "Mandatory" : "Optional" 

      let actualJsonPath = await findMatchingVersionByMajor(apiResultsPath, api.id, majorApiVersion);

        if (!actualJsonPath) {
            console.warn(`⚠️ Warning: No matching CTK result found for ${api.id} (${majorApiVersion})`);
            return null; // Skip this API if no matching result exists
        }

        console.log(`✅ Using file: ${actualJsonPath}`);


      if (api.required || config.runSecurityOptional){
      try {
        let reportRaw = await fs.promises.readFile(actualJsonPath, "utf8");
        let report = JSON.parse(reportRaw);

        const parsed = parseCtkResult(report); // normalized { total, passed, failed }

        return {
          apiName: `${api.id} ${api.name.split("-").join(" ")} (v${majorApiVersion}) - ${apiOptionalText}`,
          htmlResultsPath: Path.join(resultsPath, "api-ctk-results", expectedApiRelease + ".html"),
          jsonResultsPath: actualJsonPath,
          htmlUrl: `../results/api-ctk-results/${expectedApiRelease}.html`,
          hasPassed: parsed.failed === 0
        }
      }
      catch (e) {
        console.log("Error processing newman report ", e)
      }
    }
    })
    return Promise.all(results)
  }

  async getDependentFunctionResults(resultsPath){
    let dependentApis = this.instance.spec.coreFunction.dependentAPIs
    // No dependent API? → No BDD tests.
    if (!dependentApis || dependentApis.length === 0) {
      console.log("ℹ️ No dependent APIs declared — skipping dependent function results.");
      return [];
    }

    const bddJsonPath = Path.join(resultsPath, "cucumber-bdd", "results.json");
    const bddHtmlPath = Path.join(resultsPath, "cucumber-bdd", "results.html");
    // Return one entry summarising dependent tests (UI uses summary separately)
    return [
      {
          apiName: "Dependent APIs (BDD Tests)",
          jsonResultsPath: bddJsonPath,
          htmlResultsPath: bddHtmlPath,
          htmlUrl: "../results/cucumber-bdd/results.html",
          // Pass/fail is computed later using getBddResultsSummary()
          hasPassed: null  
      }
    ];
  }

  
}

/**
 * Universal CTK result parser (v4 Newman or v5 Cypress)
 */
function parseCtkResult(report) {

  // --- V4 NEWMAN FORMAT ---
  if (report?.run?.stats?.assertions) {
    const failed = report.run.stats.assertions.failed ?? 0;
    const total  = report.run.stats.assertions.total ?? 0;
    const passed = total - failed;

    return { failed, passed, total, format: "v4-newman" };
  }

  // --- V5 CYPRESS FORMAT ---
  if (report?.stats?.tests !== undefined) {
    const failed = report.stats.failures ?? 0;
    const total  = report.stats.tests ?? 0;
    const passed = report.stats.passes ?? total - failed;

    return { failed, passed, total, format: "v5-cypress" };
  }

  // --- UNKNOWN FORMAT ---
  console.warn("⚠️ Unknown CTK result format:", Object.keys(report));
  return { failed: 0, passed: 0, total: 0, format: "unknown" };
}

async function findMatchingVersionByMajor(apiResultsPath, apiId, majorApiVersion) {
  try {
      let files = await fs.promises.readdir(apiResultsPath);

      // ✅ Find the single matching file (e.g., `TMF620_v4.*.json` or `TMF620_v5.*.json`)
      let matchingFile = files.find(file => file.startsWith(`${apiId}_v${majorApiVersion}`) && file.endsWith(".json"));

      if (!matchingFile) {
          console.warn(`⚠️ No CTK result found for API ${apiId} (Major Version: ${majorApiVersion})`);
          return null;
      }

      return Path.join(apiResultsPath, matchingFile);
  } catch (error) {
      console.error(`❌ Error finding matching version for ${apiId}:`, error.message);
      return null;
  }
}

function configureMochaSuits(){
  const configSuite = new Mocha({
      ...mochaOptions,
      reporterOptions: {
        ...mochaOptions.reporterOptions,
        reportFilename: 'Configuration-report',
        reportTitle: 'Component Configuration Tests Report',
      },
  })
  configSuite.addFile('tests/configuration.js')
  
  const deploymentSuite = new Mocha({
    ...mochaOptions,
    reporterOptions: {
      ...mochaOptions.reporterOptions,
      reportFilename: 'deployment-report',
      reportTitle: 'Component Deployment Tests Report',
    },
  })
  deploymentSuite.addFile('tests/deployment.js')
  
  return [configSuite, deploymentSuite]
}

async function runSuit(suite){
  return new Promise((resolve, reject) => {
    suite.run(function (failures) {
      if (failures) {
        console.log(failures)
        resolve(failures)
      } else {
        resolve()
      }
    })
  })
}

async function configureAPICTKS(){
  let componentCtkConfig = config.payloads
  if (!componentCtkConfig || Object.keys(componentCtkConfig).length === 0) {
    console.log("No payloads defined in component CTK config.")
    return
  }
  let ctks = Path.join(__dirname, "../resources/api-ctks")

  let entries;
  try {
    entries = await fs.promises.readdir(ctks, { withFileTypes: true })
  } catch (e) {
    console.error(`Could not read api-ctks directory at ${ctks}: `, e.message)
    return
  }

  for (let apiRef of Object.keys(componentCtkConfig)){
    const overridePayload = componentCtkConfig[apiRef]
    // 🔥 Extract API ID and Major Version (v4/v5)
    const [apiId, versionSegment] = apiRef.split("_v");  
    const majorVersion = versionSegment;    // "4" or "5"

    // 🔥 Select exact CTK folder based on major version
    const dirEntry =
      entries.find(e =>
        e.isDirectory() && e.name.startsWith(`${apiId}_v${majorVersion}.`)
      )

    if (!dirEntry) {
      console.warn(
        `⚠️ Skipping payload injection for ${apiRef}: no matching CTK folder found under ${ctks}`
      )
      continue
    }

    const ctkFolder = Path.join(ctks, dirEntry.name);
    // Detect CTK type *after* selecting folder
    const v4File = Path.join(ctkFolder, "config.json");
    const v5File = Path.join(ctkFolder, "CHANGE_ME.json");

    if (fs.existsSync(v4File)) {
      await injectPayloadV4(v4File, overridePayload, apiRef);
    } else if (fs.existsSync(v5File)) {
      await injectPayloadV5(v5File, overridePayload, apiRef);
    } else {
      console.warn(
        `⚠️ No config.json or CHANGE_ME.json found in CTK folder for ${apiRef}`
      )
    }
  }
}

async function injectPayloadV4(configPath, overridePayload, apiRef) {
  try {
    let raw = await fs.promises.readFile(configPath, "utf8");
    let json = JSON.parse(raw);

    if (!json.payloads) {
      json.payloads = {};
    }

    json.payloads = mergePayloads(json.payloads, overridePayload);

    await fs.promises.writeFile(configPath, JSON.stringify(json, null, 2));

    console.log(`✅ Injected v4 payloads into ${apiRef}`);
  } catch (e) {
    console.error(`❌ Failed injecting payload into v4 CTK ${apiRef}: ${e.message}`);
  }
}

async function injectPayloadV5(configPath, overridePayload, apiRef) {
  try {
    let raw = await fs.promises.readFile(configPath, "utf8");
    let json = JSON.parse(raw);

    if (!json.payloads) {
      json.payloads = {};
    }

    json.payloads = mergePayloads(json.payloads, overridePayload);

    await fs.promises.writeFile(configPath, JSON.stringify(json, null, 2));

    console.log(`✅ Injected v5 payloads into ${apiRef}`);
  } catch (e) {
    console.error(`❌ Failed injecting payload into v5 CTK ${apiRef}: ${e.message}`);
  }
}

function mergePayloads(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object
    ) {
      // Recursive merge for nested objects
      mergePayloads(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

async function runCucumberBDD() {

  // Get component_to_run from config.json
  const componentToRun = configData.component_to_run?.toLowerCase()

  if (!componentToRun) {
    console.error('Error: "component_to_run" is not specified in config.json')
    return false
  }

  // Construct tag for the component
  const tag = `@${componentToRun}`
  console.log(`Running BDD tests for component: ${componentToRun}`)
  console.log(`Using tag filter: ${tag}`)

  const { runConfiguration } = await loadConfiguration()
  let resultsPath = path.normalize("../resources/results/cucumber-bdd/");
  let jsonResultsPath = path.normalize("../resources/results/cucumber-bdd/results.json")
  let htmlResultsPath = path.normalize("../resources/results/cucumber-bdd/results.html")

  let temp = path.normalize("../resources/results/cucumber-bdd/results.json")
  console.log(temp, typeof temp)

  if (!fs.existsSync(resultsPath)) {
    //console.log(`Creating directory: ${resultsPath}`);
    fs.mkdirSync(resultsPath, { recursive: true }); // Create directory recursively if it doesn't exist
  }
  //console.log("Setting format for output")
  //runConfiguration.format = [`json:${jsonResultsPath}`];
  runConfiguration.formats.files[temp] = "json"

  
  // Run Cucumber tests
  const {success} = await runCucumber(runConfiguration)

  // Remove skipped tests from the results
  filterCucumberResults(jsonResultsPath)
  
  var options = {
    theme: 'bootstrap',
    jsonFile: jsonResultsPath,
    output: htmlResultsPath,
    reportSuiteAsScenarios: true,
    scenarioTimestamp: true,
    failedSummaryReport: true,
  };
  CucuReporter.generate(options);

  return success
}

function filterCucumberResults(jsonResultsPath) {
  if (!fs.existsSync(jsonResultsPath)) {
    console.error(`❌ JSON results file not found: ${jsonResultsPath}`)
    return
  }

  try {
    // Read and parse Cucumber Json results
    let rawData = fs.readFileSync(jsonResultsPath, 'utf-8')
    let jsonResults = JSON.parse(rawData)

    // Filter out skipped scenarios
    jsonResults = jsonResults.map(feature => {
      feature.elements = feature.elements.filter(scenario => {
        return scenario.steps.some(step => step.result.status !== "skipped")
      })

      return feature
    }).filter(feature => feature.elements.length > 0)

    fs.writeFileSync(jsonResultsPath, JSON.stringify(jsonResults, null, 2))
    console.log("✅ Filtered JSON results saved successfully.")
  } catch (error) {
    console.error(`❌ Error processing Cucumber results: ${error.message}`)
  }
}


async function main(){
  try{
    await configureAPICTKS() // updates apiCTK config with payloads in ctkconfig.json
    let suits = configureMochaSuits().map(e => runSuit(e))
    let suitResults = await Promise.all(suits)
    let cucumberTests = await runCucumberBDD()
    await generateReport()

  }
  catch(err){
    console.error(err)
    await generateReport()
    return 1
  }

}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((err) => {
    console.error(err)
  })


async function copyDir(src, dest) {
  let entries = await fs.promises.readdir(src, { withFileTypes: true })

  for (let entry of entries) {
    let srcPath = Path.join(src, entry.name)
    let destPath = Path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await fs.promises.mkdir(destPath, { recursive: true })
      await copyDir(srcPath, destPath)
    } else {
      await fs.promises.copyFile(srcPath, destPath)
    }
  }
}

async function compileMustacheTemplate(templatePath, data) {
  let template = await fs.promises.readFile(templatePath, 'utf8')
  const rendering = mustache.render(template, data);
  return rendering
}

async function getNewmanSummary(apiResults){
  if (!apiResults || apiResults.length === 0){
    console.warn("⚠️ Skipping API CTK summary generation: No API results found.")
//    return null
    return {
      cfSummary: {
        total: "N/A",
        failed: "N/A",
        passed: "N/A"
      },
      apiEntries: []
    }
  }
  const entries = apiResults.map(async api => {
    console.log(`api.apiName is ${api.apiName} and results path is ${api.jsonResultsPath}`)
    let jsonResultRaw = await fs.promises.readFile(api.jsonResultsPath, 'utf8')
    let jsonResultSummary = JSON.parse(jsonResultRaw)

    const parsed = parseCtkResult(jsonResultSummary)
    return {
      total: parsed.total,
      failed: parsed.failed,
      passed: parsed.passed,
      name: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + api.apiName
    }
  })
  let apiEntries = await Promise.all(entries)
  let cfSummary = apiEntries
    .map(e => {
      return {
        total: e.total,
        failed: e.failed,
        passed: e.passed
      }
    })
    .reduce((acc, curr) => {
      acc.total += curr.total
      acc.failed += curr.failed
      acc.passed += curr.passed
      return acc
    }, { total: 0, failed: 0, passed: 0 })

  return {
    cfSummary: cfSummary,
    apiEntries: apiEntries
  }
}

async function getMochaSummary(mochaFile) {
  let mochaData = await fs.promises.readFile(mochaFile, 'utf8')
  mochaData = JSON.parse(mochaData)
  return {
    total: mochaData.stats.tests,
    failed: mochaData.stats.failures,
    passed: mochaData.stats.passes,
    skipped: mochaData.stats.skipped,
  }
}

async function getBddResultsSumary(bddResults){
  let report = {
    total: 0,
    failed: 0,
    passed: 0,
    skipped: 0
  }

  let bddJsonResults = await fs.promises.readFile(bddResults)
  bddJsonResults = JSON.parse(bddJsonResults)

  for (let feature of bddJsonResults){
    for (let element of feature.elements){
      for (let step of element.steps) {
        if (step.result.status === "passed"){
          report.passed += 1
        } else if (step.result.status === "skipped"){
         report.skipped +=1
        } else {
          report.failed +=1
        }

        report.total += 1
      } 
    }
  }


  return report
}

function getCtkVersion(){
  const ctkVersion = configData.ctkVersion
  return ctkVersion
}

async function getCanvasVersion(){
  try {
    // Run helm list to get installed Canvas version

    let output = execSync('helm list -n canvas --output json', {encoding: 'utf-8'});
    let releases = JSON.parse(output);

    // Find the Canvas release
    let canvasRelease = releases.find(release => release.name === "canvas");

    if (canvasRelease) {
      let appVersion = canvasRelease.app_version;

      console.log(`Found Canvas App Version: ${appVersion}`);
      return appVersion;
    } else {
      console.warn("⚠️ Canvas release not found in helm.");
      return null;
    }

  } catch (error) {
    console.error("❌ Error retrieving Canvas version:", error.message);
    return null;
  }
}

async function getKubernetesVersion(){
  try {
    // Run helm list to get installed Canvas version

    let output = execSync('kubectl version -o json', {encoding: 'utf-8'});
    let parsedOutput = JSON.parse(output);

    const rawVersion = parsedOutput.serverVersion?.gitVersion || "Unknown";
    const version = rawVersion.split('-')[0]; // remove the patch version
/*    let match = output.match(/Server Version:\s*(v[\d\.]+)/);

    if (match && match[1]) {
      console.log(`Found Kubernetes Version: ${match[1]}`);
      return match[1];
    } else {
      console.warn("⚠️ Kubernetes server version not found.");
      return "Unknown";
    }
*/
    console.log(`Found Kubernetes Version: ${version}`);
    return version;

  } catch (error) {
    console.error("❌ Error retrieving Kubernetes version:", error.message);
    return "Unknown";
  } 
}

function calculateCTKStatus(canvasData, summary){
  let ctkStatus = true
  summary.forEach(s => {
    if (s.failed > 0) {
      ctkStatus = false
    }
  })
  return ctkStatus && canvasData.canvasCTKPassed
}

async function generateReportData(resultsPath) {
  //console.log(`📌 Debug: Checking results path: ${resultsPath}`);
  let componentDocument;
  try {
    componentDocument = await fs.promises.readFile(GOLDEN_COMPONENT_PATH, 'utf8');
    componentDocument = YAML.parse(componentDocument);
  } catch (error) {
    console.error(`❌ Error reading GOLDEN_COMPONENT_PATH: ${error.message}`);
    return {}; // Exit function early if component document cannot be read
  }

  const instance = new Component(componentDocument)

  const coreFunctionResults_ = await instance.getCoreFunctionResults(resultsPath)
  const coreFunctionResults =  coreFunctionResults_.filter(item => item !== undefined && item !== null);

  const dependentFunctionResults_ = await instance.getDependentFunctionResults(resultsPath)
  const dependentFunctionResults =  dependentFunctionResults_.filter(item => item !== undefined);

  const securityFunctionResults_ = await instance.getSecurityFunctionResults(resultsPath)
  const securityFunctionResults =  securityFunctionResults_.filter(item => item !== undefined && item !== null);

  let configurationSummary = await getMochaSummary(Path.join(resultsPath, "baseline-ctk/Configuration-report.json"))
  let deploymentSummary = await getMochaSummary(Path.join(resultsPath, "baseline-ctk/deployment-report.json"))
  if(deploymentSummary.passed==deploymentSummary.total && configurationSummary.passed==configurationSummary.total){
    canvasCTKPassed=true
  }
  console.log("attempting getting core function API CTK results")
  let coreFunctionSummary = await getNewmanSummary(coreFunctionResults)
  console.log("attempting getting security function API CTK results")
  let securityFunctionSummary = await getNewmanSummary(securityFunctionResults)
  //let dependentFunctionSummary = await getNewmanSummary(dependentFunctionResults)
  console.log("Got all API CTK results")
  let bddResults = await getBddResultsSumary(Path.join(resultsPath, "cucumber-bdd/results.json"))
  let exposedApisPassed = coreFunctionSummary.cfSummary.passed
  let exposedApisFailed = coreFunctionSummary.cfSummary.failed
  coreFunctionSummary.cfSummary.total += bddResults.total
  coreFunctionSummary.cfSummary.passed += bddResults.passed
  coreFunctionSummary.cfSummary.failed += bddResults.failed
  if (bddResults.passed === 0 && bddResults.failed === 0){
    bddResults.total = "N/A"
    bddResults.passed = "N/A"
    bddResults.failed = "N/A"
  }

  //console.log(`bddresults total ${bddResults.total}`)
  //console.log(`bddresults passed ${bddResults.passed}`)
  //console.log(`bddresults failed ${bddResults.failed}`)

  const summaryTable = [
    {
      name: "Core Function", 
      ...coreFunctionSummary.cfSummary
    },
    {
      name: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Exposed APIs"
    },
    ...coreFunctionSummary.apiEntries,
    {
      name: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dependent APIs BDD Tests",
      ...bddResults
    },
//    ...dependentFunctionSummary.apiEntries,

    
//    {
//      name: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;BDD Tests",
//      ...bddResults
//    },
    {
      name: "SecurityFunction",
      ...securityFunctionSummary.cfSummary
    },
    {
      name: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Exposed APIs"
    },
    ...securityFunctionSummary.apiEntries,
    {
      name: "Configuration",
      ...configurationSummary
    },
    {
      name: "Deployment",
      ...deploymentSummary
    }
  ]

  canvasVersion = await getCanvasVersion();
  kubernetes = await getKubernetesVersion();
  ctkVersion = getCtkVersion();
  const canvasData = {
    canvasVersion: canvasVersion,
    kubernetes: kubernetes,
    canvasCTKPassed: canvasCTKPassed,
    ctkVersion: ctkVersion
  }
  //console.log("configData component to run: ", configData.component_to_run)
  //const componentName = configData.component_to_run ? configData.component_to_run.toUpperCase() : "Unknown"
  //const componentUrl = `${ODA_COMPONENT_BASE_URL}${componentName}`
  const componentUrl = config.componentUrl
  //console.log("Component Name is: ", componentName)
  //console.log("Component Url is: ", componentUrl)
  let reportData = {
    componentName: config.componentName,
    version: instance.getVersion(),
    componentUrl: componentUrl,
    coreFunctionPassed: coreFunctionSummary.cfSummary.failed === 0,
    coreFunctionResults: coreFunctionResults,
    exposedApiPassed: exposedApisFailed === 0,
//    dependentFunctionPassed: dependentFunctionSummary.cfSummary.failed === 0,
    dependentFunctionPassed: (bddResults.failed === 0 || bddResults.failed === "N/A"),
    dependentFunctionResults: {
      file: "../results/cucumber-bdd/results.html"
    },
    securityFunctionResults: securityFunctionResults,
    securityFunctionPassed: (securityFunctionSummary.cfSummary.failed === 0 || securityFunctionSummary.cfSummary.failed === "N/A"),
//    bddPassed: bddResults.failed === 0,
    configuration: {
      passed: configurationSummary.failed === 0,
      file: "../results/baseline-ctk/Configuration-report.html"
    },
    deployment: {
      passed: deploymentSummary.failed === 0,
      file: "../results/baseline-ctk/deployment-report.html"
    },
//    bdd: {
//      passed: bddResults.failed === 0,
//     file: "../results/cucumber-bdd/results.html"
//    },
    summaryTable: summaryTable,
    company: config.companyName,
    productUrl: config.productUrl,
    productName: config.productName,
    productVersion: config.productVersion,
    ctkPassed: calculateCTKStatus(canvasData, summaryTable),
    ...canvasData
  }
  await fs.promises.writeFile(Path.join(resultsPath, "reportData.json"), JSON.stringify(reportData, null , 4))

  return reportData
}

async function generateReport() {
  const reportPath = Path.join("../resources/reports")
  const resultsPath = Path.join("../resources/results")
  let mustacheTemplate = Path.join("reporting", "index.mustache")
  let mustacheOutput = Path.join(reportPath, "index.html")
  
  await mkdirp(reportPath)
  //await fs.promises.mkdir(reportPath, { recursive: true })
  await copyDir("reporting", reportPath)
  const reportData = await generateReportData(resultsPath)
  let renderedReport = await compileMustacheTemplate(mustacheTemplate, reportData)
  await fs.promises.writeFile(mustacheOutput, renderedReport)
  await fs.promises.unlink(Path.join(reportPath, "index.mustache"))
}