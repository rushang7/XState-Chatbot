const sevaStateMachine =  require('../machine/seva'),
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
            service = this.createChatServiceFor(userId);
            await chatStateRepository.insertNewState(userId, true, JSON.stringify(service.state));
        } else {
            service = this.getChatServiceFor(chatState);
        }
        let event = (message.input == "seva")? 'USER_RESET' : 'USER_MESSAGE';
        service.send(event, { message: message });
    }

    async toUser(user, message) {
        channelProvider.sendMessageToUser(user, message);
    }

    getChatServiceFor(chatStateJson) {
        const context = chatStateJson.context;
        context.chatInterface = this;

        const state = State.create(chatStateJson);
        const resolvedState = sevaStateMachine.withContext(context).resolveState(state);
        const service = interpret(sevaStateMachine).start(resolvedState);

        service.onTransition( state => {
            let userId = state.context.user.uuid;
            if(state.changed) {
                let active = !state.done;
                chatStateRepository.updateState(userId, active, JSON.stringify(state));
            }
        });

        return service;
    }

    createChatServiceFor(userId) {
        let service = interpret(sevaStateMachine.withContext ({
            chatInterface: this,
            user: {
                uuid: userId,
                locale: 'en_IN'
            },
            slots: {}
        }))
        service.start();

        service.onTransition( state => {
            if(state.changed) {
                let active = !state.done;
                chatStateRepository.updateState(userId, active, JSON.stringify(state));
            }
        });

        return service;
    }

}

module.exports = new SessionManager();