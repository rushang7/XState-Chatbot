class GupShupWhatsAppProvider {
    sendMessageToUser(user, message) {
        // api call to whatsapp provider
        console.log("GupShup");
        console.log(message);
    }
}

module.exports = new GupShupWhatsAppProvider();