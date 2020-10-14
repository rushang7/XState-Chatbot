import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat } from '@progress/kendo-react-conversational-ui';

import { interpret } from 'xstate';
import chatbotMachine from './ChatbotMachine';

import * as marked from 'marked';

function MessageTemplate(props) {
    let message = props.item;
    let parser = marked.setOptions({});
    var parsedMessage = parser.parse(message.text);
    let htmlToinsert = { __html: parsedMessage };
    return (
        <div className="k-bubble">
            <div dangerouslySetInnerHTML={htmlToinsert} />
        </div>
    );
}

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
    }

    componentDidMount() {
        this.chatbotService = interpret(chatbotMachine.withContext ({  
            chatInterface: this,
            user: {
                name: "Madhavan",
                mobileNumber: "9284726483",
                uuid: "81528b1a-5795-43a7-a6e2-8c64ff145c3d",
                locale: "en_IN"
            }
        }));
        this.chatbotService.start();
    }

    sendMessageToUser = (message) => {
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
        this.chatbotService.send("USER_MESSAGE", { message: message });
    }

    render() {
        return (
            <div>
                <Chat user={this.user}
                    messages={this.state.messages}
                    onMessageSend={this.receiveMessageFromUser}
                    placeholder={"Type a message..."}
                    messageTemplate={MessageTemplate}
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
