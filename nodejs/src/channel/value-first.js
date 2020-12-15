const config = require('../env-variables');
const fetch = require("node-fetch");
require('url-search-params-polyfill');
const urlencode = require('urlencode');

var valueFirstTextMessageRequestBody = "{\"@VER\":\"1.2\",\"USER\":{\"@USERNAME\":\"\",\"@PASSWORD\":\"\",\"@UNIXTIMESTAMP\":\"\"},\"DLR\":{\"@URL\":\"\"},\"SMS\":[{\"@UDH\":\"0\",\"@CODING\":\"1\",\"@TEXT\":\"\",\"@PROPERTY\":\"0\",\"@MSGTYPE\": \"2\",\"@ID\":\"1\",\"ADDRESS\":[{\"@FROM\":\"\",\"@TO\":\"\",\"@SEQ\":\"\",\"@TAG\":\"\"}]}]}";

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

    getTransformedResponse(user, message){
        var requestBody;
        let userMobile = user.mobileNumber;
        let type;

        if(user.type && user.type==="image")
            type="image";
        else
            type="text";

        let fromMobileNumber=config.whatsAppBusinessNumber;

        if(!fromMobileNumber)
            console.error("Receipient number can not be empty");

        if(type==="text"){
            requestBody = JSON.parse(valueFirstTextMessageRequestBody);
            let encodedMessage=urlencode(message,'utf8');
            requestBody["SMS"][0]["@TEXT"]=encodedMessage;
        }

        else if(type==="image"){
            //to do
        }
        
        requestBody["SMS"][0]["ADDRESS"][0]["@FROM"]=fromMobileNumber;
        requestBody["SMS"][0]["ADDRESS"][0]["@TO"]="91"+userMobile;
        requestBody["USER"]["@USERNAME"]=config.valueFirstUsername;
        requestBody["USER"]["@PASSWORD"]=config.valueFirstPassword;

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
        let requestBody = req.body;
        var requestValidation=this.isValid(requestBody);

        if(requestValidation)
            reformattedMessage=this.getTransformedRequest(requestBody);

        return reformattedMessage;
    }

    sendMessageToUser(user, message) {
        let requestBody = {};
        requestBody = this.getTransformedResponse(user, message);
        this.sendMessage(requestBody);       
    }

}

module.exports = new ValueFirstWhatsAppProvider();