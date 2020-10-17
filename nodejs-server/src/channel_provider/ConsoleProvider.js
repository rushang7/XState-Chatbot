class ConsoleProvider {
    sendMessageToUser(user, message) {
        console.log(message);
    }
}

module.exports = new ConsoleProvider();