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
    "dummy": "asd"
  },
  states: {
    start: {
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
              target: "evaluateAnswer"
            }]
          }    
        },
        evaluateAnswer: {
          onEntry: (context, event) => {
            // console.log("onEntry");
            context.message = {
              isValid: true,
              messageContent: event.message
            }
          },
          on: {
            TRAVERSE : [
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
        message: "Please enter name of your city"
      },
      states: {
        question: {
          on: {
            RECEIVE_MESSAGE: [{
              target: "evaluateAnswer"
            }]
          }
        },
        evaluateAnswer: {
          onEntry: (context, event) => {
            // console.log("onEntry");
            context.message = {
              isValid: true,
              messageContent: event.message
            }
          },
          on : {
            TRAVERSE : [
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

// Edit your service(s) here
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


var flowToExecute = "track";

if(flowToExecute == "file") {
  service.send("RECEIVE_MESSAGE", { message: "fileComplaint" });
  service.send("TRAVERSE");
  printMessageFromChatbot();

  service.send("RECEIVE_MESSAGE", { message: "Bangalore" });
  service.send("TRAVERSE");
  printMessageFromChatbot();
  console.log(service.state.context.messageParams);

} else {
  service.send("RECEIVE_MESSAGE", { message: "trackComplaint" });
  service.send("TRAVERSE");
  printMessageFromChatbot();
  console.log(service.state.context.messageParams);
}
