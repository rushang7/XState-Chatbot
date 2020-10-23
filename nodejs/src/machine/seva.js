const { Machine, assign } = require('xstate');
const pgr = require('./pgr');

const sevaMachine = Machine({
    id: 'mseva',
    initial: 'start',
    states: {
        start: {
            on: {
              'USER_MESSAGE': 'locale'
            }
          },
          locale: {
            id: 'locale',
            'initial': 'question',
            states: {
              question: {
                onEntry: assign((context, event) => {
                  let message = "Please choose your preferred language\n 1.English 2. हिंदी"
                  context.chatInterface.toUser(context.user, message);
                }),
                on: {
                  USER_MESSAGE: 'process'
                }
              },
              process: {
                onEntry: assign((context, event) => {
                  context.message = {};
                  let choice = event.message.input.trim();
                  if(choice == 1) {
                    context.user.locale = "en_IN";
                    context.message.isValid = true;
                  }
                  else if(choice == 2) {
                    context.user.locale = "hi_IN";
                    context.message.isValid = true;
                  }
                  else {
                    context.message.isValid = false;
                  }
                }),
                always: [
                  {
                    target: 'question',
                    cond: (context, event) => !context.message.isValid
                  },
                  {
                    target: '#welcome'
                  }
                ]
              }
            }
          },
          welcome: {
            id: 'welcome',
            onEntry: assign( (context, event) => {
              let welcomeMessage = {
                'en_IN': 'Hello. Welcome to the State of Punjab\'s Complaint Chatline',
                'hi_IN': 'नमस्ते। पंजाब राज्य शिकायत पत्र में आपका स्वागत है'
              };
              let welcomeMessageWithName = {
                'en_IN': 'Hello {{name}}. Welcome to the State of Punjab\'s Complaint Chatline',
                'hi_IN': 'नमस्ते {{name}}। पंजाब राज्य शिकायत पत्र में आपका स्वागत है'
              }
              var message;
              if(context.user.name) {
                message = welcomeMessageWithName[context.user.locale].replace('{{name}}', context.user.name);
              } else {
                message = welcomeMessage[context.user.locale];
              }
              context.chatInterface.toUser(context.user, message)
            }),
            always: '#pgr'
          },
        pgr: pgr
    }
});

module.exports = sevaMachine;
