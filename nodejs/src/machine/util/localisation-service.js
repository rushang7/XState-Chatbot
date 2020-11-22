const config = require('../../env-variables'),
    fetch = require('node-fetch');

class LocalisationService {

    async init() {
        this.messages = {}
        const supportedLocales = config.supportedLocales.split(',');
        supportedLocales.forEach(async (locale, index) => {
            locale = locale.trim();
            var codeToMessages = {};
            var messages = await this.fetchMessagesForLocale(locale, config.rootTenantId);
            messages.forEach((record, index) => {
                const code =  record['code'];
                const message = record['message'];
                codeToMessages[code] = message;
            });
            this.messages[locale] = codeToMessages;
        });
    }

    getMessageForCode(code, locale) {
        return this.messages[locale][code];
    }

    getMessageBundleForCode(code) {
        var messageBundle = {};
        for(var locale in this.messages) {
            messageBundle[locale] = this.messages[locale][code];
        }
        return messageBundle;
    }

    async fetchMessagesForLocale(locale, tenantId) {
        var url = config.localisationServiceHost + config.localisationServiceSearchPath + '?tenantId=' + tenantId + '&locale=' + locale;
        var options = {
            method: 'POST'
        }
        const response = await fetch(url, options);
        const data = await response.json();
        return data['messages'];
    }

}

const localisationService = new LocalisationService();
localisationService.init();

module.exports = localisationService;