import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat } from '@progress/kendo-react-conversational-ui';

import { interpret } from 'xstate';
import chatbotMachine from './ChatbotMachine';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.user = {
            id: 1,
            avatarUrl: "https://via.placeholder.com/24/008000/008000.png"
        };
        this.bot = { id: 0 };
        this.state = {
            messages: [
            ]
        };
        this.chatbotService = interpret(chatbotMachine);
        this.chatbotService.start();
    }

    sendMessageToUser(message) {
        let botMessage = {
            author: {
                id: 0
            },
            text: message
        };
        this.setState(prevState => ({
            messages: [
                ...prevState.messages,
                botMessage
            ]
        }));
    }

    receiveMessageFromUser = (event) => {
        this.setState((prevState) => ({
            messages: [
                ...prevState.messages,
                event.message
            ]
        }));
        let message = event.message.text;
        this.chatbotService.send("USER_MESSAGE", { message: message, chatInterface: this });
    }

    // addNewMessage = (event) => {
    //     console.log(event.message);
    //     let botResponce = Object.assign({}, event.message);
    //     console.log(botResponce);
    //     botResponce.text = this.countReplayLength(event.message.text);
    //     botResponce.author = this.bot;
    //     this.setState((prevState) => ({
    //         messages: [
    //             ...prevState.messages,
    //             event.message
    //         ]
    //     }));
    //     console.log(botResponce);
    //     setTimeout(() => {
    //         this.setState(prevState => ({
    //             messages: [
    //                 ...prevState.messages,
    //                 botResponce
    //             ]
    //         }));
    //     }, 1000);
    // };

    // countReplayLength = (question) => {
    //     let length = question.length;
    //     let answer = question + " contains exactly " + length + " symbols.";
    //     return answer;
    // }

    render() {
        return (
            <div>
                <Chat user={this.user}
                    messages={this.state.messages}
                    onMessageSend={this.receiveMessageFromUser}
                    placeholder={"Type a message..."}
                    width={400}>
                </Chat>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector('my-app')
);
