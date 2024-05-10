const Mocha = require('mocha')
const process = require('process')
const fs = require('fs')
const mochaOptions = require('./.mocharc.json')
const Path = require('path')
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const config  = require('./ctkconfig.json')
const YAML = require('yaml');


const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath

class Component {
  constructor(componentInstance){
    this.instance = componentInstance 
  }

  getVersion(){
    return this.instance.spec.version
  }

  async getCoreFunctionResults(resultsPath){
    let coreExposedApis = this.instance.spec.coreFunction.exposedAPIs
    let results = coreExposedApis.map(async api => {
      let apiRelease = api.id + "_" + api.version
      let apiOptionalText = api.optional ? "Optional" : "Mandatory"
      let jsonResultsPath = Path.join(resultsPath, "api-ctk-results", apiRelease + ".json")
      try {
        let report = await fs.promises.readFile(jsonResultsPath, 'utf8')
        report = JSON.parse(report)
        let hasPassed = report.run.stats.scripts.failed === 0
        return {
          apiName: api.id + " " + api.name.split('-').join(" ") + " - " + apiOptionalText,
          htmlResultsPath: Path.join(resultsPath, "api-ctk-results", apiRelease + ".html"),
          jsonResultsPath: jsonResultsPath,
          htmlUrl: "../results/api-ctk-results/" + apiRelease + ".html",
          hasPassed: hasPassed
        }
      }
      catch (e) {
        console.log("Error processing newman report ", e)
      }
    })
    return Promise.all(results)
  }

  async getSecurityFunctionResults(resultsPath){
    let securityApis = this.instance.spec.securityFunction.exposedAPIs
    let results = securityApis.map(async api => {
      let apiRelease = api.id + "_" + api.version
      let apiOptionalText = api.optional ? "Optional" : "Mandatory"
      let jsonResultsPath = Path.join(resultsPath, "api-ctk-results", apiRelease + ".json")
      try {
        let report = await fs.promises.readFile(jsonResultsPath, 'utf8')
        report = JSON.parse(report)
        let hasPassed = report.run.stats.scripts.failed === 0
        return {
          apiName: api.id + " " + api.name.split('-').join(" ") + " - " + apiOptionalText,
          htmlResultsPath: Path.join(resultsPath, "api-ctk-results", apiRelease + ".html"),
          jsonResultsPath: jsonResultsPath,
          htmlUrl: "../results/api-ctk-results/" + apiRelease + ".html",
          hasPassed: hasPassed
        }
      }
      catch (e) {
        console.log("Error processing newman report", e)
        return {
          apiName: api.id + " " + api.name.split('-').join(" ") + " - " + apiOptionalText,
          htmlResultsPath: Path.join(resultsPath, "api-ctk-results", apiRelease + ".html"),
          jsonResultsPath: jsonResultsPath,
          htmlUrl: "../results/api-ctk-results/" + apiRelease + ".html",
          hasPassed: false
        }
      }
    })
    return Promise.all(results)
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

async function main(){
  try{
    let suits = configureMochaSuits().map(e => runSuit(e))
    let suitResults = await Promise.all(suits)
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
  const entries = apiResults.map(async api => {
    let jsonResultSummary = await fs.promises.readFile(api.jsonResultsPath, 'utf8')
    jsonResultSummary = JSON.parse(jsonResultSummary)

    let totalFailed = jsonResultSummary.run.stats.assertions.failed
    let total = jsonResultSummary.run.stats.assertions.total
    let passed = total - totalFailed
    return {
      total: total,
      failed: totalFailed,
      passed: passed,
      skipped: (totalFailed + passed) - total,
    }
  })
  return (await Promise.all(entries)).reduce((acc, curr) => {
    acc.totalTests += curr.totalTests
    acc.failedTests += curr.failedTests
    acc.errors += curr.errors
    return acc
  })
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
  let componentDocument = await fs.promises.readFile(GOLDEN_COMPONENT_PATH, 'utf8')
  componentDocument = YAML.parse(componentDocument)
  const instance = new Component(componentDocument)

  const coreFunctionResults = await instance.getCoreFunctionResults(resultsPath)
  const securityFunctionResults = await instance.getSecurityFunctionResults(resultsPath)
  
  let configurationSummary = await getMochaSummary(Path.join(resultsPath, "baseline-ctk/Configuration-report.json"))
  let deploymentSummary = await getMochaSummary(Path.join(resultsPath, "baseline-ctk/deployment-report.json"))
  let coreFunctionSummary = await getNewmanSummary(coreFunctionResults)
  let securityFunctionSummary = await getNewmanSummary(securityFunctionResults)

  const summaryTable = [
    {
      name: "coreFunction", 
      ...coreFunctionSummary
    },
    {
      name: "securityFunction",
      ...securityFunctionSummary
    },
    {
      name: "configuration",
      ...configurationSummary
    },
    {
      name: "deployment",
      ...deploymentSummary
    }
  ]

  const canvasData = {
    canvasVersion: "v1beta2",
    kubernetes: "v1",
    canvasCTKPassed: true
  }


  let reportData = {
    componentName: config.componentName,
    version: instance.getVersion(),
    componentUrl: config.componentUrl,
    coreFunctionPassed: coreFunctionSummary.failed === 0,
    coreFunctionResults: coreFunctionResults,
    securityFunctionResults: securityFunctionResults,
    securityFunctionPassed: securityFunctionSummary.failed === 0,
    configuration: {
      passed: configurationSummary.failed === 0,
      file: "../results/baseline-ctk/Configuration-report.html"
    },
    deployment: {
      passed: deploymentSummary.failed === 0,
      file: "../results/baseline-ctk/deployment-report.html"
    },
    summaryTable: summaryTable,
    company: config.companyName,
    productUrl: config.productUrl,
    productName: config.productName,
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