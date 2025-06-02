const { execSync } = require("child_process");
const YAML = require('yaml');

function resolveStubRelease(componentUnderTest, dependentComponent, dependentApiUrl, dependentStubsMap, defaultHeaders, namespace) {
    const stubEntries = Object.entries(dependentStubsMap || {});

    for (const [stubName, stubDetails] of stubEntries) {
        const releaseName = stubDetails.releaseName;
        const headers = stubDetails.headers || {};

        let manifestOutput;
        try {
            manifestOutput = execSync(`helm get manifest ${releaseName} -n ${namespace}`, { encoding: 'utf-8' });
        } catch (err) {
            console.warn(`⚠️ Could not retrieve Helm manifest for release ${releaseName}: ${err.message}`);
            continue;
        }

        const parsedDocuments = YAML.parseAllDocuments(manifestOutput);
        const componentDoc = parsedDocuments.find(doc => doc.get('kind') === 'Component');
        if (!componentDoc) continue;

        const spec = componentDoc.get('spec');
        const exposedAPIs = spec.get('coreFunction')?.get('exposedAPIs')?.items || [];

        const matchedAPI = exposedAPIs.find(api => {
            const path = api.get('path');
            return typeof path === 'string' && dependentApiUrl.includes(path);
        });

        if (matchedAPI) {
            const declaredPath = matchedAPI.get('path');
            if (dependentApiUrl.includes(declaredPath)) {
                return {
                    releaseName,
                    headers: Object.keys(headers).length > 0 ? headers : defaultHeaders
                };
            }
        }
    }

    return null;
}

module.exports = {
    resolveStubRelease
};