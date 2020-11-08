const os = require('os');

const envVariables = {
    serviceId : process.env.name || 'xstate-chatbot-server',
    ver : process.env.version || '0.0.1',

    port: process.env.service_port || 8080,
    contextPath : process.env.contextPath || '/',

    whatsAppProvider: process.env.whatsAppProvider || 'console',

    pgrServiceProvider: process.env.pgrServiceProvider || 'eGovPGR',

    repoProvider: process.env.repoProvider || 'PostgreSQL',

    mdmsHost: process.env.mdmsHost || '/',

    externalHost: process.env.externalHost || 'https://egov-micro-dev.egovernments.org/',

    cityExternalWebpagePath: process.env.cityExternalWebpagePath || 'citizen/openlink/whatsapp/city',

    localityExternalWebpagePath: process.env.localityExternalWebpagePath || 'citizen/openlink/whatsapp/locality',

    whatsAppBusinessNumber : process.env.whatsAppBusinessNumber || '917834811114',

    googleAPIKey: process.env.googleAPIKey || ''
}

module.exports = envVariables;