const config = require('../env-variables');
const consoleProvider = require('./console-provider');
const gupShupWhatsAppProvider = require('./gupshup-whatsapp-provider');

if(config.whatsAppProvider == 'GupShup')
    module.exports = gupShupWhatsAppProvider;
else
    module.exports = consoleProvider;
