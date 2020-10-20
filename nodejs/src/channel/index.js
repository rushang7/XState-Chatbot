const config = require('../env-variables');
const consoleProvider = require('./console');
const gupShupWhatsAppProvider = require('./gupshup');

if(config.whatsAppProvider == 'GupShup')
    module.exports = gupShupWhatsAppProvider;
else
    module.exports = consoleProvider;
