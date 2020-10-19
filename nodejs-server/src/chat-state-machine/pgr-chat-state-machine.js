const { Machine, assign } = require("xstate");
const egovUtils = require("../app-service-provider/egov-pgr-service-provider")

const PGRChatStateMachine = Machine({
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
          message = welcomeMessageWithName[context.user.locale].replace("{{name}}", context.user.name);
        } else {
          message = welcomeMessage[context.user.locale];
        }
        context.chatInterface.toUser(context.user, message)
      }),
      always: "menu"
    },
    menu : {
      id: "menu",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = {
              "en_IN" : "Please type<br><br>  1 to File New Complaint.<br>  2 to Track Your Complaints",
              "hi_IN": "कृप्या टाइप करे<br><br>  1 यदि आप शिकायत दर्ज करना चाहते हैं<br>  2 यदि आप अपनी शिकायतों की स्थिति देखना चाहते हैं"
            };
            context.chatInterface.toUser(context.user, message[context.user.locale]);
          }),
          on: {
            USER_MESSAGE: [{
              target: "process"
            }]
          }
        },
        process: {
          onEntry: assign((context, event) => {
            // TODO how to handle reset or start over.
            // TODO make more robust. Handle extra characters. Handle case where user types "file complaint" or "file"
            let isValid = event.message.input.trim().localeCompare("1") === 0 || event.message.input.trim().localeCompare("2") === 0; 

            context.message = {
              isValid: isValid,
              messageContent: event.message.input
            }
            if(isValid) {
              context.slots.menu = event.message.input;
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
            let message = "Sorry, I didn't understand";
            context.chatInterface.toUser(context.user, message);
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
            egovUtils.fetchCities().then((cityNames) => {
              var message = "File a new complaint:\n Please enter name of the city";
              for(var i = 0; i < cityNames.length; i++) {
                message += "\n" + (i+1) + ". " + cityNames[i];
              }
              message += "<br><br>Or 0 to start over."
              context.maxValidEntry = cityNames.length;
              // debugger
              context.chatInterface.toUser(context.user, message);
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
            let parsed = parseInt(event.message.input.trim())
            // debugger
            let isValid = !isNaN(parsed) && parsed >=0 && parsed <= context.maxValidEntry;// TODO for some reason this is not working. context no longer contain maxValidEntry
            context.message = {
              isValid: true,
              messageContent: event.message.input.trim()
            }
            if(isValid) { // TODO This does not seem to be the right place for this. It's too early here
              context.slots.city = parsed;
            }
          }),
          always : [
            {
              target: "#start_over",
              cond: (context, event) => {
                return context.message.messageContent.localeCompare("0") === 0;
              },
            },
            {
              target: "error",
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: "#geoLocationSharingInfo"
            }
          ]
        },
        error: {
          onEntry: assign( (context, event) => {
            let message = "Sorry, I didn't understand";
            context.chatInterface.toUser(context.user, message);
          }),
          always : [
            {
              target: "question"
            }
          ]
        }
      }
    },
    geoLocationSharingInfo: {
      id: "geoLocationSharingInfo",
      onEntry: assign( (context, event) => {
        context.chatInterface.toUser(context.user, "<i>Informational Image</i>");
      }),
      always: [ { target: "geoLocation" } ]
    },
    geoLocation: {
      id: "geoLocation",
      initial: "question",
      states : {
        question: {
          onEntry: assign( (context, event) => {
            let message = "File a new complaint:\n Please share your geo-location or type and send \"No\"";
            context.chatInterface.toUser(context.user, message);
          }),
          on: {
            USER_MESSAGE: [ { target: "process" } ]
          }
        },
        process: {
          onEntry: assign( (context, event) => {
            let message = event.message;
            if(message.type === "location") {
              context.slots.geoLocation = message.input;
            } else {

            }
          }),
          always: [
            {
              target: "#fileComplaint",
              cond: (context, event) => {
                if(context.slots.geoLocation)
                  return true;
              }
            },
            {
              target: "#locality"
            }
          ]
        }
      }
    },
    locality: {
      id: "locality",
      initial: "question",
      states: {
        question: {
          onEntry: assign( (context, event) => {
            let message = "File a new complaint:\n Please enter your locality"
            context.chatInterface.toUser(context.user, message);
          }),
          on: {
            USER_MESSAGE: [{target: "process"}]
          }
        },
        process: {
          onEntry: assign((context, event) => {
            context.slots.locality = event.message.input;
          }),
          always: [{target: "#fileComplaint"}]
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
        context.chatInterface.toUser(context.user, message);
      })
    },
    fileComplaint: {
      type: "final",
      id: "fileComplaint",
      onEntry: assign((context, event) => {
        console.log(context.slots);
        //make api call
        console.log("Making api call to PGR Service");
        let message = "File a new complaint:\n Complaint has been filed successfully {{number}}";
        let number = "123";
        message = message.replace("{{number}}", number);
        context.chatInterface.toUser(context.user, message);
      })
    },
    start_over: {
      id: "start_over",
      onEntry: assign((context, event) => {
        context.chatInterface.toUser(context.user, "Ok. Let's start over");
      }),
      always: "menu"
    }
  }
});

module.exports = PGRChatStateMachine;