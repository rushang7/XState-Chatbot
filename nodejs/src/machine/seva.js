const { Machine, assign } = require('xstate');
const pgr = require('./pgr');
const bills = require('./bills');
const receipts = require('./receipts');

const sevaMachine = Machine({
    id: 'mseva',
    initial: 'start',
    on: {
      USER_RESET: {
        target: 'sevamenu',
        actions: (context, event) => context.chatInterface.toUser(context.user, "BIG RESET. Let us start over.") // TODO @Rushang This is getting printed too late
      }
    },
    states: {
        start: {
            on: {
              USER_MESSAGE: 'locale'
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
              let hello = messages.welcome.hello[context.user.locale](context.user.name); // TODO - @Rushang look at this, can you remove the []
              let welcome = messages.welcome.welcome[context.user.locale]
              context.chatInterface.toUser(context.user, `${hello}, ${welcome}`);
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
                  context.message =  event.message.input.trim()
                }),
                always : [
                  {
                    target: '#pgr',
                    cond: (context, event) => grammer.menu.question.pgr.includes(context.message)
                  },
                  {
                    target: '#bills', 
                    cond: (context, event) => grammer.menu.question.bills.includes(context.message)   
                  },
                  {
                    target: '#receipts', 
                    cond: (context, event) => grammer.menu.question.receipts.includes(context.message)  
                  },
                  {
                    target: 'error'
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
    }, // states
}); // Machine

let messages = { // TODO @Rushang - can you mnove this inside the Machine. Name clash
  welcome: {
    hello: {
      en_IN: (name)=>name? `Hello ${name}`: `Hello`,
      hi_IN: (name)=>name? `नमस्ते ${name}`: `नमस्ते`
    },
    welcome: {
      en_IN: 'Welcome to the State of Punjab\'s Seva Chatline.',
      hi_IN: 'पंजाब राज्य शिकायत चैट लाइन में आपका स्वागत है.',
    }
  }
}

let grammer = {
  menu: {
    question: {
      pgr: ['1','complaint','complaints'], 
      bills: ['2', 'bill', 'bills'],
      receipts: ['3','receipt', 'receipts']
    }
  }

}

module.exports = sevaMachine;
