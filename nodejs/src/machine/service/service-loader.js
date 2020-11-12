const config = require('../../env-variables');
const dummyPGRService = require('./dummy-pgr');
const egovPGRService = require('./egov-pgr');
const dummyBillService = require('./dummy-bill');

if(config.pgrServiceProvider === 'eGovPGR') {
    console.log("Using eGov Services");
    module.exports.pgrService = egovPGRService;
    module.exports.billService = dummyBillService;
}
else {
    console.log("Using Dummy Services");
    module.exports.pgrService = dummyPGRService;
    module.exports.billService = dummyBillService;
}
