const os = require('os');

const envVariables = {
    serviceId : process.env.name || 'xstate-chatbot-server',
    ver : process.env.version || '0.0.1',

    port: process.env.service_port || 8080,
    endPoint : process.env.endPoint || '/whatsapp-webhook/messages',

    whatsAppProvider: process.env.whatsAppProvider || 'console',

    pgrServiceProvider: process.env.pgrServiceProvider || 'DummyPGR',

    repoProvider: process.env.repoProvider || 'InMemory',

    mdmsHost: process.env.mdmsHost || 'https://egov-micro-dev.egovernments.org/',

    googleAPIKey: process.env.googleAPIKey || ''
}

module.exports = envVariables;