const os = require('os');

const envVariables = {
    serviceId: process.env.NAME || 'xstate-chatbot',
    ver: process.env.VERSION || '0.0.1',

    port: process.env.SERVICE_PORT || 8080,
    contextPath: process.env.CONTEXT_PATH || '/xstate-chatbot',

    whatsAppProvider: process.env.WHATSAPP_PROVIDER || 'GupShup',

    serviceProvider: process.env.SERVICE_PROVIDER || 'Dummy',

    repoProvider: process.env.REPO_PROVIDER || 'PostgreSQL',

    whatsAppBusinessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '917834811114',

    rootTenantId: process.env.ROOT_TENANTID || 'pb',

    supportedLocales: process.env.SUPPORTED_LOCALES || 'en_IN,hi_IN',

    googleAPIKey: process.env.GOOGLE_MAPS_API_KEY || '',

    dateFormat: process.env.DATEFORMAT || 'DD/MM/YYYY',
    timeZone: process.env.TIMEZONE || 'Asia/Kolkata',

    postgresConfig: {
        dbHost: process.env.DB_HOST || 'localhost',
        dbPort: process.env.DB_PORT || '5432',
        dbName: process.env.DB_NAME || 'chat',
        dbUsername: process.env.DB_USER || 'postgres',
        dbPassword: process.env.DB_PASSWORD || ''
    },

    hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET || '',
    hasuraUrl: process.env.HASURA_URL || 'https://13.66.223.224.nip.io/hge/v1/graphql',


    kafka: {
        kafkaBootstrapServer: process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092',
        chatbotTelemetryTopic: process.env.CHATBOT_TELEMETRY_TOPIC || 'chatbot-telemetry-v2',

        kafkaConsumerEnabled: process.env.KAFKA_CONSUMER_ENABLED || true,
        kafkaConsumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'xstate-chatbot',
    },

}

module.exports = envVariables;