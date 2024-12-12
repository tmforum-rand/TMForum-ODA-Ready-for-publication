const fs = require('fs');

var newman = require('newman');
var Validator = require('jsonschema').Validator;

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
}


config = JSON.parse(fs.readFileSync('../config.json'))

if (!Array.isArray(config.payloads.PaymentMethod.POST.payload)) {
    config.payloads.PaymentMethod.POST.payload = [config.payloads.PaymentMethod.POST.payload]
}


var pmCollection = require('./TMF670-PaymentMethod-v4.0.0.testkit.json');



headers = []
Object.keys(config['headers']).forEach(function (header) {
    h = {
        "key": header,
        "value": config['headers'][header]
    }
    headers.push(h);
});
pmCollection['item'].forEach(function (i, indexi) {
    i['item'].forEach(function (ii, indexii) {
        pmCollection['item'][indexi]['item'][indexii]['request']['header'] = headers
    });
});

exportEnvironment(config['url'])


fs.writeFileSync('pmtest.json', JSON.stringify(pmCollection))



let runCollection = () => {
    newman.run({
        collection: pmCollection,
        environment: require('./TMFENV.json'),
        insecure: true,
        reporters: ['html', 'json'],
        reporter: {
            html: {
                export: `../htmlResults.html`, // If not specified, the file will be written to `newman/` in the current working directory.
                //template: './customTemplate.hbs' // optional, this will be picked up relative to the directory that Newman runs in.
            },
            json: {
                export: `../jsonResults.json`
            }
        }
    }).on('start', function (err, args) {
        console.log('running a collection...');
    }).on('done', function (err, summary) {
        if (err || summary.error) {
            if (err) {
                console.error('collection run encountered an error. ' + err);
                process.exit(2)
            }
            if (summary.error) {
                console.log("Collected run completed but with errors, please check htmlResults.html for details. Your API didn't pass the Conformance Test Kit.");
                process.exit(1)
            }

        } else {
            console.log('...Conformance Test Kit executed all the tests, check htmlResults.html and jsonResults.json for your test results.\n...If you are looking for certification, please contact TM Forum.');
        }
    });

}

Object.keys(config['payloads']).forEach(resource => {
    let payloads = config.payloads[resource].POST.payload
    let custom_types = [
        "BankAccountDebit",
        "BankAccountTransfer",
        "BankCard",
        "Check",
        "DigitalWallet",
        "DirectDebit",
        "TokenizedCard",
        "Voucher",
    ]


    payloads.forEach(payload => {
        let payload_type = payload['@type']
        console.log("Payload type", payload_type)

        var v = new Validator();
        var schema = require('./schemas/' + resource + '.schema.json');

        valid = v.validate(payload, schema);
        if (!valid.valid) {
            console.log("ERROR: Resource " + resource + " on config.json " + valid.errors[0]['message'])
            console.log('Fix your example to continue')
            process.exit(0)
        }

        if (custom_types.includes(payload_type)) {
            let child_schema_path = './schemas/' + resource + '-' + payload_type + '.schema.json'
            console.log("validating schema", child_schema_path)
            child_schema = require(child_schema_path)
            payload_validation = v.validate(payload, child_schema)
            if (!payload_validation.valid) {
                console.log("Payload of type", payload_type, "did not pass schema validation located at:", child_schema_path)
            }
        }

        /*
        if (resource == "PaymentMethod") {
            pmCollection['item'][0]['item'][0]['request']['body']['raw'] = JSON.stringify(payload)
        }

        if (resource == "{apiRoot}paymentMethod (invalid, type missing)") {
            pmCollection['item'][6]['item'][0]['request']['body']['raw'] = JSON.stringify(payload)
        }
        */
    })

});
runCollection()


function exportEnvironment(url) {

    var fs = require('fs');
    var environmentFile = "TMFENV-V4.0.0.postman_environment.json";
    var content = fs.readFileSync(environmentFile, "utf8");
    var envJson = JSON.parse(content);
    envJson.name = "TMForumv4";
    envJson.values.forEach(element => {
        if (element.key == "PaymentMethod") {
            element.value = config['url'];
        }
        if (element.key == "payloads") {
            element.value = JSON.stringify(config.payloads.PaymentMethod.POST.payload)
        }
        if (element.key == "test_index") {
            element.value = 0
        }
    });
    jsonData = JSON.stringify(envJson);
    fs.writeFileSync("TMFENV.json", jsonData);
}

