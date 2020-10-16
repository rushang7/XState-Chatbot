const JSONPath = require('JSONPath'),
    config = require('../envVariables'),
    chatbotMachine = require('../chat_machine/ChatbotMachine'),
    sendMessageProvider = require('../channel_provider/SendMessage'),
    chatStateRepository = require('../repository/ChatStateRepository');
const { State, interpret } = require('xstate');

class ChatService {

    receiveMessage(req, res) {
        let userId = req.body["userId"];
        let message = {
            type: req.body.type,
            input: req.body.input
        }

        let chatState = chatStateRepository.getActiveStateForUserId(userId);
        let service;
        if(!chatState) {
            service = this.createNewConversation(userId);
        } else {
            service = this.getChatServiceFor(chatState);
        }
        
        service.send("USER_MESSAGE", { message: message });

        chatStateRepository.saveState(userId, JSON.stringify(service.state));

        res.sendStatus(200);
    }

    getChatServiceFor(chatState) {
        const stateDefinition = JSON.parse(chatState);

        const context = stateDefinition.context;
        context.chatInterface = sendMessageProvider;

        const state = State.create(stateDefinition);
        const resolvedState = chatbotMachine.withContext(context).resolveState(state);
        const service = interpret(chatbotMachine).start(resolvedState);

        return service;
    }

    createNewConversation(userId) {
        console.log("New User");
        let service = interpret(chatbotMachine.withContext ({  
            chatInterface: sendMessageProvider,
            user: {
                uuid: userId,
                locale: "en_IN"
            },
            slots: {}
        }));
        // service.onTransition((state) => {
        //     console.log(JSON.stringify(state));
        // });
        service.start();
        return service;
    }

}

module.exports = new ChatService();