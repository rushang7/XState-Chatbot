const os = require('os');

const envVariables = {
    serviceId : process.env.name || 'xstate-chatbot-server',
    ver : process.env.version || '0.0.1',

    port: process.env.service_port || 8080,
    endPoint : process.env.endPoint || '/whatsapp-webhook/messages',

    whatsAppProvider: process.env.whatsAppProvider || 'GupShup'
}

module.exports = envVariables;