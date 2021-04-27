const fetch = require("node-fetch");
require('url-search-params-polyfill');
const config = require('../env-variables');
var geturl = require("url");

class KaleyraWhatsAppProvider {

  constructor() {
    this.url = config.kaleyra.sendMessageUrl;
    this.url = this.url.replace('{{sid}}', config.kaleyra.sid);
  }
  
  processMessageFromUser(req) {
    try {
      let requestBody = geturl.parse(req.url, true).query;
      
      let reformattedMessage = {};
      reformattedMessage.user = { 
        mobileNumber: requestBody.from.slice(2)
      }
      reformattedMessage.extraInfo = {
        whatsAppBusinessNumber: requestBody.wanumber
      }
      
      let type = requestBody.type;
      if(type == 'text') {
        reformattedMessage.message = {
          type: type,
          input: requestBody.body
        };
      } else {
        reformattedMessage.message = {
          type: 'unknown',
          input: ''
        }
      }

      return reformattedMessage;
    } catch(err) {
      console.error('Error while processing message from user: ' + err);
      return undefined;
    }
  }

  async sendMessageToUser(user, outputMessages, extraInfo) {
    for(let message of outputMessages) {
      let phone = user.mobileNumber;

      let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'api-key': config.kaleyra.apikey
      }

      var urlSearchParams = new URLSearchParams();
      
      urlSearchParams.append("channel", "whatsapp");
      urlSearchParams.append("from", extraInfo.whatsAppBusinessNumber);
      urlSearchParams.append("to", '91' + phone);

      if(typeof(message) == 'string') {
        urlSearchParams.append("type", 'text');
        urlSearchParams.append("body", message);
      } else {
        urlSearchParams.append("type", message.type);
        urlSearchParams.append("body", message.output);
      }
      
      var request = {
          method: "POST",
          headers: headers,
          body: urlSearchParams
      }

      await fetch(this.url, request);
    }
  }

}

module.exports = new KaleyraWhatsAppProvider();