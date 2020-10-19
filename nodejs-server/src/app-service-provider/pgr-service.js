const config = require('../env-variables');
const dummyPGRService = require('./dummy-pgr-service-provider');
const egovPGRService = require('./egov-pgr-service-provider');

if(config.pgrServiceProvider === 'eGovPGR') {
    console.log("eGovPGR");
    module.exports = egovPGRService;
}
else {
    console.log("Dummy PGR");
    module.exports = dummyPGRService;
}
