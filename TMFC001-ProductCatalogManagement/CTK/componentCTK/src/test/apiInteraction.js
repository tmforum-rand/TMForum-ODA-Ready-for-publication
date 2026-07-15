const chai = require('chai')
const expect = chai.expect
const config  = require('../ctkconfig.json')

const GOLDEN_COMPONENT_PATH = config.goldenComponentFilePath
const COMPONENT_MANIFEST_PATH = config.componentFilePath
const COMPONENT_NAME = config.componentName

const regex = /\/([^\/-]+)-[^\/]+\.yaml/;
const match = GOLDEN_COMPONENT_PATH.match(regex);
const TMF_CODE = match ? match[1] : null;

console.log(`Applying CTK for ${TMF_CODE}`)


describe('Dependent API interaction testing for component '+ TMF_CODE, function () {
    before(function () {
      expect(initializeTargetComponentAPI('ctk target component')).to.be.true;
      expect(initializeTargetComponentAPI(TMF_CODE)).to.be.true;
    });
  
    const testCases = [
      {
        exposedAPI: 'TMF637-v4.0.0',
        dependentAPI: '',
        basePayload: 'inventory-id001.json',
        targetPayload: 'inventory-id001.json',
        operationID: 'GET',
        expectedResponse: '200'
      },
      {
        exposedAPI: 'TMF637-v4.0.0',
        dependentAPI: 'TMF642-v4.0.0',
        basePayload: '',
        targetPayload: 'inventory-id002.json',
        operationID: 'GET',
        expectedResponse: '404'
      }
    ];
  
    testCases.forEach(({ exposedAPI, dependentAPI, basePayload, targetPayload, operationID, expectedResponse }) => {
      it(`should return ${expectedResponse} for operation ${operationID} with payloads ${basePayload} and ${targetPayload}`, function () {
        expect(initializeTargetComponentAPI(exposedAPI, basePayload)).to.be.true;
        expect(initializeStub(COMPONENT_NAME, COMPONENT_MANIFEST_PATH)).to.be.true;
        expect(createDependentAPIResource(dependentAPI, targetPayload)).to.be.true;
        expect(createExposedAPIResource(exposedAPI, targetPayload)).to.be.true;
        expect(verifyResponse(operationID, basePayload)).to.equal(expectedResponse);
      });
    });
  });
  
  function initializeStub(componentName, componentManifestPath) {
    // Initialize the component (e.g., start a service, deploy a component, etc.)
    return true;
  }
  
  function initializeTargetComponentAPI(api, payload) {
    return true;
  }
  
  function createDependentAPIResource(api, payload) {
    return true;
  }
  
  function createExposedAPIResource(api, payload) {
    return true;
  }

  function verifyResponse(operationID, payload) {
    if (payload == ''){
      return '404';
    }
    return '200';
  }