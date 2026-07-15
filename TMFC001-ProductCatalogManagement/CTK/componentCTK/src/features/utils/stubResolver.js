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
        console.log(`🔍 Checking stub '${stubName}' for release '${releaseName}': Found ${exposedAPIs.length} exposed APIs.`);

        const matchedAPI = exposedAPIs.find(api => {
            // v1.0 location
            const legacyPath = api.get('path');
    
            // v1.1 location — inside specification[]
            const specArray = api.get('specification')?.items || [];
            //const specPaths = specArray
            //    .map(s => s.get('path'))
            //    .filter(p => typeof p === 'string');
            const specPaths = specArray
                .map(s => {
                    // Try YAMLMap first
                    const pathFromMap = s.get?.('path');
                    if (typeof pathFromMap === 'string') return pathFromMap;
            
                    // Then try plain object representation
                    const json = s.toJSON ? s.toJSON() : s;
                    return typeof json?.path === 'string' ? json.path : null;
                })
                .filter(p => typeof p === 'string');
            // Combine both possibilities
            const allPaths = [
                ...(legacyPath ? [legacyPath] : []),
                ...specPaths
            ];
            console.log(`🔍 Checking API with possible paths: `, allPaths);
            //return allPaths.some(p => dependentApiUrl.includes(p));
            const foundPath = allPaths.some(p => dependentApiUrl.includes(p));
            console.log(`🔍 Path match result for API: `, foundPath);
            return foundPath
        })

        //console.log(`🔍 Checking stub '${stubName}' for release '${releaseName}': Matched API -`, matchedAPI ? matchedAPI.toJSON() : 'None');
//        
        if (matchedAPI) {

            // Extract all paths from specification[]
            const specArr = matchedAPI.get('specification')?.items || [];
            const specPaths = specArr
                .map(s => {
                    const p = s.get?.('path');
                    if (typeof p === 'string') return p;
                    const json = s.toJSON ? s.toJSON() : s;
                    return json?.path;
                })
                .filter(p => typeof p === 'string');
        
            // Also consider legacy path (v1.0)
            const legacyPath = matchedAPI.get('path');
            if (legacyPath) specPaths.push(legacyPath);
        
            console.log(`🔍 Final version-correct paths to check:`, specPaths);
        
            // Now test version-correct paths
            const match = specPaths.some(p => dependentApiUrl.includes(p));
        
            console.log(`🔍 Does dependentApiUrl match any spec path?`, match);
        
            if (match) {
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