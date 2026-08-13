const fs = require('fs');
const axios = require('axios');
const https = require('https');

// Function to load a payload from a file
function loadPayload(filename){
    const payloadpath = `./features/payloads/${filename}`
    return JSON.parse(fs.readFileSync(payloadpath, 'utf-8'));
}

// Function to make API requests
async function makeApiRequest(method, url, payload = null, headers = {'Content-Type': 'application/json'}) {
    try {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
        const options = {method, url, headers, httpsAgent };
        if (payload) options.data = payload;
        console.log(`\n📌 Sending API Request: ${method} ${url} ${options.data ? JSON.stringify(options.data, null, 2) : ''}`);
        console.log(`📌 Headers: ${JSON.stringify(headers, null, 2)}`);
        const response = await axios(options);
        console.log(`\n✅ API Response [${response.status}]:`);
        console.log(JSON.stringify(response.data, null, 2));
        return response;
    } catch (error) {
        if (error.response) {
            return error.response
        } else {
            throw new Error(`Request to ${url} failed: ${error.message}`);
        }
    }
}

// Function to validate Service Specification ID
async function validateSpecificationId(specificationID, dependentURL){
    try {
        const url = `${dependentURL}/${specificationID}`;
        console.log(`Calling to validate ${specificationID} at url ${url}`);
        const response = await makeApiRequest('GET', url);
        if (response.status === 200) {
            console.log(`✅ Specification ID ${specificationID} found in the catalog.`);
            return true;
        } else {
            console.error(`❌ Unexpected response status ${response.status} for Specification ID ${specificationID}.`);
            console.error(`Response Data: ${JSON.stringify(response.data, null, 2)}`);
            return false;
        }
    } catch (error) {
        if (error.response?.status === 404){
            console.warn(`⚠️ Specification ID ${specificationID} not found in the catalog. (Expected Failure)`);
            return false;
        } else {
            console.error(`❌ API Request Failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = {
    loadPayload,
    makeApiRequest,
    validateSpecificationId,
};


