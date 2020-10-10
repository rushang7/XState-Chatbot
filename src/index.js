import { Machine, interpret, assign } from "xstate";
import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>XState Example</h1>
<div>
  Open the <strong>Console</strong> to view the machine output.
</div>
`;

const chatbotMachine = Machine({
  id: "chatbot",
  initial: "start",
  context: {
  },
  states: {
    start: {
      // TODO should we keep this?
      always: [{ target: "menu" }]
    },
    menu : {
      id: "menu",
      initial: "question",
      meta: {
        message:
          "Hi! \n What would you like to do?\n1. File Complaint\n2. Track Complaint"
      },
      states: {
        question: {
          on: {
            RECEIVE_MESSAGE: [{
              target: "processUserRespone"
            }]
          }
        },
        processUserRespone: {
          onEntry: assign((context, event) => {
            console.log("onExit");
            console.log(event);
            context.message = {
              isValid: true,
              messageContent: event.message
            }
          }),
          on: {
            '' : [
              {
                target: "question",
                cond: (context, event) => {
                  // console.log(context);
                  return ! context.message.isValid;
                }
              },
              {
                target: "#city",
                cond: (context, event) => {
                  // console.log(context);
                  return context.message.messageContent == "fileComplaint";
                }
              },
              {
                target: "#trackComplaint",
                cond: (context, event) => { 
                  // console.log(context.lastAnswer); 
                  return  context.message.messageContent == "trackComplaint"; 
                }
              }
            ]
          }
        } 
      }
    },
    city: {
      id: "city",
      initial: "question",
      meta: {
        message: "Please enter name of the city"
      },
      states: {
        question: {
          on: {
            RECEIVE_MESSAGE: [{
              target: "processUserRespone"
            }]
          }
        },
        processUserRespone: {
          onEntry:  assign((context, event) => {
            // console.log("onEntry");
            context.message = {
              isValid: true,
              messageContent: event.message
            }
          }),
          on : {
            '' : [
              {
                target: "question",
                cond: (context, event) => {
                  // console.log(context);
                  return ! context.message.isValid;
                }
              },
              {
                target: "#filedSuccessfully"
              }
            ]
          }
        }
      }
    },
    trackComplaint: {
      id: "trackComplaint",
      type: "final",
      meta: {
        message: "Here are your recent complaints {{details}}"
      },
      onEntry: (context, event) => {
        //make api call
        console.log("Make api call to PGR Service");
        context.messageParams = {
          details: "Complaint Details: No. - 123, ..."
        }
      }
    },
    filedSuccessfully: {
      type: "final",
      id: "filedSuccessfully",
      meta: {
        message: "Complaint has been filed successfully {{number}}"
      },
      onEntry: (context, event) => {
        //make api call
        console.log("Make api call to PGR Service");
        context.messageParams = {
          number: "123"
        }
      }
    }
  }
});


const service = interpret(chatbotMachine).onTransition((state) => {
  console.log(state.value);
});

function printMessageFromChatbot() {
  let nodeName = service.state.toStrings()[0];
  let question = service.state.meta[nodeName].message;
  console.log(question);
}

service.start();
printMessageFromChatbot();


var flowToExecute = "file";

if(flowToExecute == "file") {
  service.send("RECEIVE_MESSAGE", { message: "fileComplaint" });
  printMessageFromChatbot();

  service.send("RECEIVE_MESSAGE", { message: "Bangalore" });
  printMessageFromChatbot();
  console.log(service.state.context.messageParams);

} else {
  service.send("RECEIVE_MESSAGE", { message: "trackComplaint" });
  printMessageFromChatbot();
  console.log(service.state.context.messageParams);
}
