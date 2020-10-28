const sevaStateMachine =  require('../machine/seva'),
    channelProvider = require('../channel'),
    chatStateRepository = require('./repo');
const { State, interpret } = require('xstate');
const {get_message, get_intention, INTENTION_UNKOWN} = require('../machine/util/dialog.js');

class SessionManager {

    async fromUser(reformattedMessage) {
        let userId = reformattedMessage.userId;

        let chatState = await chatStateRepository.getActiveStateForUserId(userId);
        let service;
        if(!chatState) {
            service = this.createChatServiceFor(userId);
            await chatStateRepository.insertNewState(userId, true, JSON.stringify(service.state));
        } else {
            service = this.getChatServiceFor(chatState);
        }
        let intention = get_intention(grammer.reset, reformattedMessage, true);
        let event = (intention == 'reset')? 'USER_RESET' : 'USER_MESSAGE';
        service.send(event, { message: reformattedMessage.message });
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

let grammer = {
    reset: [
        {intention: 'reset', recognize: ['seva', 'सेवा']},
      ]
}

module.exports = new SessionManager();