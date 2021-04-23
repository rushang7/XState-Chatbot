const config = require('../../env-variables');

if(config.serviceProvider == 'Dummmy') {
    module.exports.personService = require('./dummy-person-service');
    module.exports.triageService = require('./dummy-triage-service');
    module.exports.selfCareService = require('./dummy-self-care-service');
} else {
    module.exports.personService = require('./swasth-person-service');
    module.exports.triageService = require('./swasth-triage-service');
    module.exports.selfCareService = require('./swasth-self-care-service');
}
