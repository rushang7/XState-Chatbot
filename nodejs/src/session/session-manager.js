const sevaStateMachine =  require('../machine/seva'),
    channelProvider = require('../channel'),
    chatStateRepository = require('./repo'),
    telemetry = require('./telemetry'),
    system = require('./system'),
    userService = require('./user-service');
const { State, interpret } = require('xstate');
const dialog = require('../machine/util/dialog.js');

class SessionManager {

    async fromUser(reformattedMessage) {
        let mobileNumber = reformattedMessage.user.mobileNumber;
        let user = await userService.getUserForMobileNumber(mobileNumber, 'pb');
        let userId = user.userId;

        let chatState = await chatStateRepository.getActiveStateForUserId(userId);
        telemetry.log(userId, 'from_user', reformattedMessage);

        // handle reset case
        let intention = dialog.get_intention(grammer.reset, reformattedMessage, true)
        // if (intention == 'reset' && chatState) {
        //     chatStateRepository.updateState(userId, false, JSON.stringify(chatState));
        //     chatState = null; // so downstream code treats this like an inactive state and creates a new machine
        // }

        let service;
        if(!chatState) {
            // come here if virgin dialog, old dialog was inactive, or reset case
            chatState = this.createChatStateFor(user);
            let saveState = JSON.parse(JSON.stringify(chatState));
            saveState = this.removeUserDataFromState(saveState);
            await chatStateRepository.insertNewState(userId, true, JSON.stringify(saveState));
        } 
        
        if(reformattedMessage.extraInfo && reformattedMessage.extraInfo.missedCall==true){
                if(chatState._event.name != 'xstate.init')
                    return;
        }
            
        service = this.getChatServiceFor(chatState, user);
        
        let event = (intention == 'reset')? 'USER_RESET' : 'USER_MESSAGE';
        service.send(event, { message: reformattedMessage.message });
    }
    async toUser(user, outputMessages) {
        channelProvider.sendMessageToUser(user, outputMessages);
        for(let message of outputMessages) {
            telemetry.log(user.uuid, 'to_user', {message : {type: "text", output: message}});
        }
    }

    removeUserDataFromState(state) {
        let userId = state.context.user.userId;
        let locale = state.context.user.locale;
        state.context.user = undefined;
        state.context.user = { locale: locale, userId: userId };
        return state;
    }

    getChatServiceFor(chatStateJson, user) {
        const context = chatStateJson.context;
        context.chatInterface = this;
        let locale = context.user.locale;
        context.user = user;
        context.user.locale = locale;

        const state = State.create(chatStateJson);
        const resolvedState = sevaStateMachine.withContext(context).resolveState(state);
        const service = interpret(sevaStateMachine).start(resolvedState);

        service.onTransition( state => {
            let userId = state.context.user.userId;
            let stateStrings = state.toStrings()
            telemetry.log(userId, 'transition', {destination: stateStrings[stateStrings.length-1]});
            if(state.changed) {
                let active = !state.done && !state.forcedClose;
                let saveState = JSON.parse(JSON.stringify(state));      // deep copy
                saveState = this.removeUserDataFromState(saveState);
                chatStateRepository.updateState(userId, active, JSON.stringify(saveState));
            }
        });

        return service;
    }

    createChatStateFor(user) {
        let service = interpret(sevaStateMachine.withContext ({
            chatInterface: this,
            user: user,
            slots: {pgr: {}, bills: {}, receipts: {}}
        }));
        service.start();
        return service.state;
    }

    system_error(message) {
        system.error(message);
    }
}

let grammer = {
    reset: [
        {intention: 'reset', recognize: ['mseva', 'seva', 'सेवा']},
    ]
}

module.exports = new SessionManager();