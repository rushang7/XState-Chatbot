const config = require('../env-variables');
const fetch = require("node-fetch");
require('url-search-params-polyfill');
const urlencode = require('urlencode');

let valueFirstRequestBody = "{\"@VER\":\"1.2\",\"USER\":{\"@USERNAME\":\"\",\"@PASSWORD\":\"\",\"@UNIXTIMESTAMP\":\"\"},\"DLR\":{\"@URL\":\"\"},\"SMS\":[]}";

let textMessageBody = "{\"@UDH\":\"0\",\"@CODING\":\"1\",\"@TEXT\":\"\",\"@TEMPLATEINFO\":\"\",\"@PROPERTY\":\"0\",\"@ID\":\"\",\"ADDRESS\":[{\"@FROM\":\"\",\"@TO\":\"\",\"@SEQ\":\"\",\"@TAG\":\"\"}]}";

class ValueFirstWhatsAppProvider {

    checkForMissedCallNotification(requestBody){
        //to do
        return false;
    }

    getMissedCallValues(requestBody){
        //to do
    }

    getUserMessage(requestBody){
        let reformattedMessage={};
        let type = requestBody.message.type;
        let input;
        if(type === "location") {
            let location = requestBody.message.location;
            input = '(' + location.latitude + ',' + location.longitude + ')';
        } else {
            input = requestBody.message.input;
        }

        reformattedMessage.message = {
            input: input,
            type: type
        }
        reformattedMessage.user = {
            mobileNumber: requestBody.user.mobileNumber.slice(2)
        };

        return reformattedMessage;

    }

    isValid(requestBody){
        try {
            if(this.checkForMissedCallNotification(requestBody)) // validation for misscall
                return true;
            
            let type = requestBody.message.type;

            if(type==="text" || type==="image")
                return true;

            else if(type || type.length>=1)
                return true;

        } catch (error) {
            console.error("Invalid request");
        }
        return false;
    };

    getTransformedRequest(requestBody){
        var missCall = this.checkForMissedCallNotification(requestBody);
        let reformattedMessage = {};

        if(missCall)
            reformattedMessage=this.getMissedCallValues(requestBody);
        else
            reformattedMessage=this.getUserMessage(requestBody);

        return reformattedMessage;
    }

    getTransformedResponse(user, messages){
        let userMobile = user.mobileNumber;
        let fromMobileNumber=config.whatsAppBusinessNumber;
        if(!fromMobileNumber)
            console.error("Receipient number can not be empty");

        let requestBody = JSON.parse(valueFirstRequestBody);
        requestBody["USER"]["@USERNAME"] = config.valueFirstUsername;
        requestBody["USER"]["@PASSWORD"] = config.valueFirstPassword;

        for(let i = 0; i < messages.length; i++) {
            let message = messages[i];
            let type;
            if(message.type && message.type==="image")
                type="image";
            else    
                type="text";
            
            let messageBody;
            if(type === 'text') {
                messageBody = JSON.parse(textMessageBody);
                let encodedMessage=urlencode(message, 'utf8');
                messageBody['@TEXT'] = encodedMessage;
            } else {
                // TODO for non-textual messages
            }
            messageBody["ADDRESS"][0]["@FROM"] = fromMobileNumber;
            messageBody["ADDRESS"][0]["@TO"] = '91' + userMobile;

            requestBody["SMS"].push(messageBody);
        }
        
        return requestBody;
    }

    async sendMessage(requestBody) {
        let url = config.valueFirstURL;

        let headers = {
            'Content-Type': 'application/json',
        }

        var request = {
            method: "POST",
            headers: headers,
            origin: '*',
            body: JSON.stringify(requestBody)
        }
        let response = await fetch(url,request);
        if(response.status === 200)
            return response
        else {
            console.error('Error in sending message');
            return undefined;
          }
    }    
    
    processMessageFromUser(req) {
        let reformattedMessage = {}
        let requestBody = req.query;
        var requestValidation=this.isValid(requestBody);

        if(requestValidation)
            reformattedMessage=this.getTransformedRequest(requestBody);

        return reformattedMessage;
    }

    sendMessageToUser(user, messages) {
        let requestBody = {};
        requestBody = this.getTransformedResponse(user, messages);
        this.sendMessage(requestBody);       
    }

}

module.exports = new ValueFirstWhatsAppProvider();