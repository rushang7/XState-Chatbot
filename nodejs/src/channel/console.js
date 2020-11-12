class ConsoleProvider {
    processMessageFromUser(req) {
        return req.body;
    }

    sendMessageToUser(user, message) {
        // console.log(user);
        console.log(message);
    }
}

module.exports = new ConsoleProvider();