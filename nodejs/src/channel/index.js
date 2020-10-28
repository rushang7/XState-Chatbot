const config = require('../env-variables');
const consoleProvider = require('./console');
const gupShupWhatsAppProvider = require('./gupshup');

if(config.whatsAppProvider == 'GupShup') {
    console.log('Using GupShup as the channel')
    module.exports = gupShupWhatsAppProvider;
}
else {
    console.log('Using console as the output channel');
    module.exports = consoleProvider;
}
