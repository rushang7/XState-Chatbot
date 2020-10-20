const pgrStateMachine =  require('../machine/pgr'),
    channelProvider = require('../channel'),
    chatStateRepository = require('./repo/postgres-repo');
const { State, interpret } = require('xstate');

class SessionManager {

    async fromUser(reformattedMessage) {
        let userId = reformattedMessage.userId;
        let message = reformattedMessage.message;

        let chatState = await chatStateRepository.getActiveStateForUserId(userId);
        let service;
        if(!chatState) {
            service = this.createNewConversation(userId);
            await chatStateRepository.insertNewState(userId, true, JSON.stringify(service.state));
        } else {
            service = this.getChatServiceFor(chatState);
        }
        
        service.send('USER_MESSAGE', { message: message });

        let active = !service.state.done;
        await chatStateRepository.updateState(userId, active, JSON.stringify(service.state));
    }

    async toUser(user, message) {
        channelProvider.sendMessageToUser(user, message);
    }

    getChatServiceFor(chatStateJson) {
        const context = chatStateJson.context;
        context.chatInterface = this;

        const state = State.create(chatStateJson);
        const resolvedState = pgrStateMachine.withContext(context).resolveState(state);
        const service = interpret(pgrStateMachine).start(resolvedState);

        return service;
    }

    createNewConversation(userId) {
        let service = interpret(pgrStateMachine.withContext ({
            chatInterface: this,
            user: {
                uuid: userId,
                locale: 'en_IN'
            },
            slots: {}
        }))
        service.start();
        return service;
    }

}

module.exports = new SessionManager();