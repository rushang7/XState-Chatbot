const config = require('../../env-variables');

if(config.serviceProvider == 'Dummy') {
    module.exports.personService = require('./dummy-person-service');
    module.exports.triageService = require('./dummy-triage-service');
    module.exports.vitalsService = require('./dummy-vitals-service');
} else {
    module.exports.personService = require('./swasth-person-service');
    module.exports.triageService = require('./swasth-triage-service');
    module.exports.vitalsService = require('./swasth-vitals-service');
}
