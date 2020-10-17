class ConsoleProvider {
    reformatIncomingMessage(req) {
        return req.body;
    }

    sendMessageToUser(user, message) {
        console.log(message);
    }
}

module.exports = new ConsoleProvider();