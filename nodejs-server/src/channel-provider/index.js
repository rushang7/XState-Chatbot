const config = require('../envVariables');
const consoleProvider = require('./ConsoleProvider');
const gupShupWhatsAppProvider = require('./GupShupWhatsAppProvider');

if(config.whatsAppProvider == 'GupShup')
    module.exports = gupShupWhatsAppProvider;
else
    module.exports = consoleProvider;
