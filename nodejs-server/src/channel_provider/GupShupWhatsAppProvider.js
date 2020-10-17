const fetch = require("node-fetch");
var urlSearchParams = require('form-data');
require('url-search-params-polyfill');

class GupShupWhatsAppProvider {

    reformatIncomingMessage(req) {
        let reformattedMessage = {}
        let requestBody = req.body;
        reformattedMessage.message = {
            input: requestBody.payload.payload.text,
            type: "text"
        }
        reformattedMessage.userId = requestBody.payload.sender.phone;

        return reformattedMessage;
    }

    sendMessageToUser(user, message) {
        let phone = user.uuid;

        let url = "https://api.gupshup.io/sm/api/v1/msg";

        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': "81ee6fe7c9854228c2270996a3340c1f"
        }

        var urlSearchParams = new URLSearchParams();
        
        urlSearchParams.append("channel", "whatsapp");
        urlSearchParams.append("source", "917834811114");
        urlSearchParams.append("destination", phone);
        urlSearchParams.append("src.name", "eGovPGRChatbot");
        urlSearchParams.append("message", message);

        var request = {
            method: "POST",
            headers: headers,
            body: urlSearchParams
        }

        fetch(url, request);
    }
}

module.exports = new GupShupWhatsAppProvider();