const os = require('os');

const envVariables = {
    serviceId : process.env.name || 'xstate-chatbot-server',
    ver : process.env.version || '0.0.1',

    port: process.env.service_port || 8080,
    contextPath : process.env.contextPath || '/',

    whatsAppProvider: process.env.whatsAppProvider || 'console',

    pgrServiceProvider: process.env.pgrServiceProvider || 'dummyPGR',

    repoProvider: process.env.repoProvider || 'PostgreSQL',

    mdmsHost: process.env.mdmsHost || 'https://egov-micro-dev.egovernments.org/',

    localisationServiceHost: process.env.localisationServiceHost || 'https://egov-micro-dev.egovernments.org/',
    localisationServiceSearchPath: process.env.localisationServiceSearchPath || 'localization/messages/v1/_search',

    rootTenantId: process.env.rootTenantId || 'pb',

    supportedLocales: process.env.supportedLocales || 'en_IN,hi_IN',

    externalHost: process.env.externalHost || 'https://egov-micro-dev.egovernments.org/',

    cityExternalWebpagePath: process.env.cityExternalWebpagePath || 'citizen/openlink/whatsapp/city',
    localityExternalWebpagePath: process.env.localityExternalWebpagePath || 'citizen/openlink/whatsapp/locality',

    whatsAppBusinessNumber : process.env.whatsAppBusinessNumber || '917834811114',

    googleAPIKey: process.env.googleAPIKey || ''
}

module.exports = envVariables;