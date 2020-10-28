const config = require('../../env-variables');
const dummyPGRService = require('./dummy-pgr');
const egovPGRService = require('./egov-pgr');

if(config.pgrServiceProvider === 'eGovPGR') {
    console.log("Using eGovPGR");
    module.exports = egovPGRService;
}
else {
    console.log("Using Dummy PGR");
    module.exports = dummyPGRService;
}
