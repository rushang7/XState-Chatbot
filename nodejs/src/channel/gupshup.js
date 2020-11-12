const fetch = require("node-fetch");
require('url-search-params-polyfill');

class GupShupWhatsAppProvider {

    processMessageFromUser(req) {
        let reformattedMessage = {}
        let requestBody = req.body;
        
        let type = requestBody.payload.type;
        let input;
        if(type === "location") {
            let location = requestBody.payload.payload;
            input = '(' + location.latitude + ',' + location.longitude + ')';
        } else {
            input = requestBody.payload.payload.text;
        }

        reformattedMessage.message = {
            input: input,
            type: type
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
        urlSearchParams.append("src.name", "mSevaChatbot");
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