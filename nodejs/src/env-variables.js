const os = require('os');

const envVariables = {
    serviceId : process.env.name || 'xstate-chatbot-server',
    ver : process.env.version || '0.0.1',

    port: process.env.service_port || 8080,
    contextPath : process.env.contextPath || '/',

    whatsAppProvider: process.env.whatsAppProvider || 'console',

    serviceProvider: process.env.serviceProvider || 'eGov',

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

    userServiceHost: process.env.userServiceHost || 'https://egov-micro-dev.egovernments.org/',
    userServiceOAuthPath: process.env.userServiceOAuthPath || 'user/oauth/token',
    userServiceCreateCitizenPath: process.env.userServiceCreateCitizenPath || 'user/citizen/_create',
    userServiceUpdateProfilePath: process.env.userServiceUpdateProfilePath || 'user/profile/_update',
    userServiceHardCodedPassword: process.env.userServiceHardCodedPassword || '123456',
    userLoginAuthorizationHeader: process.env.userLoginAuthorizationHeader || 'Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0',

    billServiceHost: process.env.billServiceHost || 'https://egov-micro-dev.egovernments.org/',
    billServiceSearchPath: process.env.billServiceSearchPath || 'billing-service/bill/v2/_search',
    googleAPIKey: process.env.googleAPIKey || '',

    valueFirstUsername: process.env.VALUEFIRST_USERNAME || 'demo',
    valueFirstPassword: process.env.VALUEFIRST_PASSWORD || 'demo',
    valueFirstURL: process.env.VALUEFIRST_SEND_MESSAGE_URL || 'https://api.myvaluefirst.com/psms/servlet/psms.JsonEservice'
}

module.exports = envVariables;