const { Machine, assign } = require('xstate');
const pgr = require('./pgr');
const bills = require('./bills');
const receipts = require('./receipts');

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
                'en_IN': 'Hello. Welcome to the State of Punjab\'s Seva Chatline',
                'hi_IN': 'नमस्ते। पंजाब राज्य सेवा चैट लाइन में आपका स्वागत है'
              };
              let welcomeMessageWithName = {
                'en_IN': 'Hello {{name}}. Welcome to the State of Punjab\'s Seva Chatline',
                'hi_IN': 'नमस्ते {{name}}। पंजाब राज्य शिकायत चैट लाइन में आपका स्वागत है'
              }
              var message;
              if(context.user.name) {
                message = welcomeMessageWithName[context.user.locale].replace('{{name}}', context.user.name);
              } else {
                message = welcomeMessage[context.user.locale];
              }
              context.chatInterface.toUser(context.user, message)
            }),
            always: '#sevamenu'
          },
          sevamenu : {
            id: 'sevamenu',
            initial: 'question',
            states: {
              question: {
                onEntry: assign( (context, event) => {
                    debugger;
                    let message = {
                    'en_IN' : 'Please type\n\n  1 for Complaints.\n  2 for Bills.\n  3 for Receipts',
                    'hi_IN': 'कृप्या टाइप करे\n\n  1 शिकायतों के लिए\n  2 बिलों के लिए\n  3 रसीदों के लिए'
                    };
                    context.chatInterface.toUser(context.user, message[context.user.locale]);
                }),
                on: {
                    USER_MESSAGE: [{
                      target: 'process'
                    }]
                }
              },
              process: {
                onEntry: assign((context, event) => {
                  // TODO clean this code
                  let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 || event.message.input.trim().localeCompare('3') === 0 ; 
      
                  context.message = {
                    isValid: isValid,
                    messageContent: event.message.input.trim()
                  }
                  if(isValid) {
                    context.slots.sevamenu = event.message.input.trim();
                  }
                }),
                always : [
                  {
                    target: 'error',
                    cond: (context, event) => {
                      return ! context.message.isValid;
                    }
                  },
                  {
                    target: '#pgr',
                    cond: (context, event) => {
                      return context.message.messageContent.localeCompare('1') === 0;
                    }
                  },
                  {
                    target: '#bills', 
                    cond: (context, event) => { 
                      return  context.message.messageContent.localeCompare('2') === 0; 
                    }
                  },
                  {
                    target: '#receipts', 
                    cond: (context, event) => { 
                      return  context.message.messageContent.localeCompare('3') === 0; 
                    }
                  }
                ]
              }, // sevamenu.process
              error: {
                onEntry: assign( (context, event) => {
                  let message = 'Sorry, I didn\'t understand';
                  context.chatInterface.toUser(context.user, message);
                }),
                always : [
                  {
                    target: 'question'
                  }
                ]
              }, // sevamenu.error 
              pgr: pgr,
              bills: bills,
              receipts: receipts
        } // sevamenu.states
      } // sevamenu
    } // states
}); // Machine

module.exports = sevaMachine;
