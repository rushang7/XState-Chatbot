const JSONPath = require('JSONPath'),
    config = require('../envVariables'),
    chatbotMachine = require('../chat_machine/ChatbotMachine'),
    channelProvider = require('../channel_provider'),
    chatStateRepository = require('../repository/ChatStateRepository');
const { State, interpret } = require('xstate');

class ChatService {

    async receiveMessage(req, res) {
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

        res.sendStatus(200);
    }

    getChatServiceFor(chatStateJson) {
        const context = chatStateJson.context;
        context.chatInterface = channelProvider;

        const state = State.create(chatStateJson);
        const resolvedState = chatbotMachine.withContext(context).resolveState(state);
        const service = interpret(chatbotMachine).start(resolvedState);

        return service;
    }

    createNewConversation(userId) {
        console.log("New User");
        let service = interpret(chatbotMachine.withContext ({  
            chatInterface: channelProvider,
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