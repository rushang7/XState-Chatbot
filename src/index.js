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
  initial: "menu",
  context: {
  },
  states: {
    menu : {
      id: "menu",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = "Hi! \n What would you like to do?\n1. File Complaint\n2. Track Complaint";
            console.log(message);
          }),
          on: {
            RECEIVE_MESSAGE: [{
              target: "processUserRespone"
            }]
          }
        },
        processUserRespone: {
          onEntry: assign((context, event) => {
            // console.log(event);
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
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = "Please enter name of the city";
            console.log(message);
          }),
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
      onEntry: (context, event) => {
        //make api call
        console.log("Making an api call to PGR Service");
        let message = "Here are your recent complaints {{details}}";
        let details = "No. - 123, ...";
        message = message.replace("{{details}}", details);
        console.log(message);
      }
    },
    filedSuccessfully: {
      type: "final",
      id: "filedSuccessfully",
      onEntry: (context, event) => {
        //make api call
        console.log("Making api call to PGR Service");
        let message = "Complaint has been filed successfully {{number}}";
        let number = "123";
        message = message.replace("{{number}}", number);
        console.log(message);
      }
    }
  }
});


const service = interpret(chatbotMachine);
// service.onTransition((state) => {
//   console.log(state.value);
// });

service.start();

var flowToExecute = "file";

if(flowToExecute == "file") {
  service.send("RECEIVE_MESSAGE", { message: "fileComplaint" });
  service.send("RECEIVE_MESSAGE", { message: "Bangalore" });
} else {
  service.send("RECEIVE_MESSAGE", { message: "trackComplaint" });
}
