const pgrChatStateMachine = require('../chat_state_machine/PGRChatStateMachine'),
    channelProvider = require('../channel_provider'),
    chatStateRepository = require('../repository/ChatStateRepository');
const { State, interpret } = require('xstate');

class ChatService {

    async receiveMessage(req) {
        let userId = req.body["userId"];
        let message = {
            type: req.body.type,
            input: req.body.input
        }

        let chatState = await chatStateRepository.getActiveStateForUserId(userId);
        let service;
        if(!chatState) {
            service = this.createNewConversation(userId);
            await chatStateRepository.insertNewState(userId, true, JSON.stringify(service.state));
        } else {
            service = this.getChatServiceFor(chatState);
        }
        
        service.send("USER_MESSAGE", { message: message });

        let active = !service.state.done;
        await chatStateRepository.updateState(userId, active, JSON.stringify(service.state));
    }

    getChatServiceFor(chatStateJson) {
        const context = chatStateJson.context;
        context.chatInterface = channelProvider;

        const state = State.create(chatStateJson);
        const resolvedState = pgrChatStateMachine.withContext(context).resolveState(state);
        const service = interpret(pgrChatStateMachine).start(resolvedState);

        return service;
    }

    createNewConversation(userId) {
        console.log("New User");
        let service = interpret(pgrChatStateMachine.withContext ({  
            chatInterface: channelProvider,
            user: {
                uuid: userId,
                locale: "en_IN"
            },
            slots: {}
        }))
        service.start();
        return service;
    }

}

module.exports = new ChatService();