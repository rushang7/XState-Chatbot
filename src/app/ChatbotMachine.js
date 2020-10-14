import { Machine, assign } from "xstate";
import fetchCities from './egovutils'

const chatbotMachine = Machine({
  id: "chatbot",
  initial: "start",
  context: {
  },
  states: {
    start: {
      onEntry: assign( (context, event) => {
        let welcomeMessage = {
          "en_IN": "Hello. Welcome to the State of Punjab's Complaint Chatline",
          "hi_IN": "नमस्ते। पंजाब राज्य शिकायत पत्र में आपका स्वागत है"
        };
        let welcomeMessageWithName = {
          "en_IN": "Hello {{name}}. Welcome to the State of Punjab's Complaint Chatline",
          "hi_IN": "नमस्ते {{name}}। पंजाब राज्य शिकायत पत्र में आपका स्वागत है"
        }
        var message;
        if(context.user.name) {
          message = welcomeMessageWithName[context.user.locale];
          message = message.replace("{{name}}", context.user.name);
        } else {
          message = welcomeMessage[context.user.locale];
        }
        context.chatInterface.sendMessageToUser(message)
      }),
      on: {
        USER_MESSAGE: [{
          target: "menu"
        }]
      }
    },
    menu : {
      id: "menu",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = {
              "en_IN" : "Hi! \nWhat would you like to do?\n1. File Complaint\n2. Track Complaint",
              "hi_IN": "आप क्या करना पसंद करेंगे\n1. शिकायत दर्ज करें\n2. हाल की शिकायत दिखाएं"
            };
            context.chatInterface.sendMessageToUser(message[context.user.locale]);
          }),
          on: {
            USER_MESSAGE: [{
              target: "process"
            }]
          }
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = {
              isValid: event.message.localeCompare("1") === 0 || event.message.localeCompare("2") === 0,
              messageContent: event.message
            }
          }),
          always : [
            {
              target: "error",
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: "#city",
              cond: (context, event) => {
                return context.message.messageContent.localeCompare("1") === 0;
              }
            },
            {
              target: "#trackComplaint",
              cond: (context, event) => { 
                return  context.message.messageContent.localeCompare("2") === 0; 
              }
            }
          ]
        },
        error: {
          onEntry: assign( (context, event) => {
            let message = "Invalid entry";
            context.chatInterface.sendMessageToUser(message);
          }),
          always : [
            {
              target: "question"
            }
          ]
        } 
      }
    },
    city: {
      id: "city",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            fetchCities().then((cityNames) => {
              var message = "Please enter name of the city";
              for(var i = 0; i < cityNames.length; i++) {
                message += "\n" + (i+1) + ". " + cityNames[i];
              }
              context.validValues = cityNames;
              context.chatInterface.sendMessageToUser(message);
            });
          }),
          on: {
            USER_MESSAGE: [{
              target: "process"
            }]
          }
        },
        process: {
          onEntry:  assign((context, event) => {
            context.message = {
              isValid: true,
              messageContent: event.message
            }
          }),
          always : [
            {
              target: "question",
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: "#filedSuccessfully"
            }
          ]
        }
      }
    },
    trackComplaint: {
      id: "trackComplaint",
      type: "final",
      onEntry: assign( (context, event) => {
        //make api call
        console.log("Making an api call to PGR Service");
        let message = "Here are your recent complaints {{details}}";
        let details = "No. - 123, ...";
        message = message.replace("{{details}}", details);
        context.chatInterface.sendMessageToUser(message);
      })
    },
    filedSuccessfully: {
      type: "final",
      id: "filedSuccessfully",
      onEntry: assign((context, event) => {
        //make api call
        console.log("Making api call to PGR Service");
        let message = "Complaint has been filed successfully {{number}}";
        let number = "123";
        message = message.replace("{{number}}", number);
        context.chatInterface.sendMessageToUser(message);
      })
    }
  }
});

export default chatbotMachine;