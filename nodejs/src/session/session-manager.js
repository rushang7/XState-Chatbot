const sevaStateMachine =  require('../machine/seva'),
    channelProvider = require('../channel'),
    chatStateRepository = require('./repo'),
    telemetry = require('./telemetry');
const { State, interpret } = require('xstate');
const {get_message, get_intention, INTENTION_UNKOWN} = require('../machine/util/dialog.js');

class SessionManager {

    async fromUser(reformattedMessage) {
        let userId = reformattedMessage.userId;
        let chatState = await chatStateRepository.getActiveStateForUserId(userId);
        telemetry.log(userId, 'from user', reformattedMessage);

        // handle reset case
        let intention = get_intention(grammer.reset, reformattedMessage, true)
        if (intention == 'reset' && chatState) {
            chatStateRepository.updateState(userId, false, JSON.stringify(chatState));
            chatState = null; // so downstream code treats this like an inactive state and creates a new machine
        }

        let service;
        if(!chatState) {
            // come here if virgin dialog, old dialog was inactive, or reset case
            service = this.createChatServiceFor(userId);
            await chatStateRepository.insertNewState(userId, true, JSON.stringify(service.state));
        } else {
            service = this.getChatServiceFor(chatState);
        }
        
        let event = (intention == 'reset')? 'USER_RESET' : 'USER_MESSAGE';
        service.send(event, { message: reformattedMessage.message });
    }
    async toUser(user, message) {
        channelProvider.sendMessageToUser(user, message);
        telemetry.log(user.uuid, 'to user', message);
    }

    getChatServiceFor(chatStateJson) {
        const context = chatStateJson.context;
        context.chatInterface = this;

        const state = State.create(chatStateJson);
        const resolvedState = sevaStateMachine.withContext(context).resolveState(state);
        const service = interpret(sevaStateMachine).start(resolvedState);

        service.onTransition( state => {
            let userId = state.context.user.uuid;
            telemetry.log(userId, 'transition', `{${state.toStrings()}}`);
            if(state.changed) {
                let active = !state.done && !state.forcedClose;
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
        {intention: 'reset', recognize: ['mseva', 'seva', 'सेवा']},
      ]
}

module.exports = new SessionManager();