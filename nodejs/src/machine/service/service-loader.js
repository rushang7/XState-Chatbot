const config = require('../../env-variables');
const dummyPGRService = require('./dummy-pgr');
const egovPGRService = require('./egov-pgr');

if(config.pgrServiceProvider === 'eGovPGR') {
    console.log("eGovPGR");
    module.exports = egovPGRService;
}
else {
    console.log("Dummy PGR");
    module.exports = dummyPGRService;
}
