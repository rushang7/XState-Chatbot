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
            onEntry: assign( (context, event, meta) => {
              let hello = messages.welcome.hello[context.user.locale](context.user.name); // TODO - @Rushang look at this, can you remove the []
              // let welcome = messages.welcome.welcome[context.user.locale];
              let welcome = get_message(messages.welcome.welcome, context.user.locale); // TODO @Rushang this is the pattern to use. Is there someway we can relieve this code from having to specify state "welcome"
              context.chatInterface.toUser(context.user, `${hello}, ${welcome}`);
              console.log(meta); // TODO @Rushang, I  tried to use this to see if I could store message here but no luck - the state is the previous state 
              console.log(meta.message); // undefined
            }),
            always: '#sevamenu',
            meta: {
              message: "hello world"  
            }

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
                  context.message =  event.message.input.trim().toLowerCase();
                }),
                always : [
                  {
                    target: '#pgr',
                    cond: (context, event) => grammer.menu.question.pgr.find((element)=>context.message.includes(element))
                  },
                  {
                    target: '#bills', 
                    cond: (context, event) => grammer.menu.question.bills.find((element)=>context.message.includes(element)) 
                  },
                  {
                    target: '#receipts', 
                    cond: (context, event) => grammer.menu.question.receipts.find((element)=>context.message.includes(element)) 
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

let messages = { // TODO @Rushang - can you mnove this inside the Machine to avoid name clash (maybe meta)? Is this the right pattern
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
      pgr: ['1','complaint'], 
      bills: ['2', 'bill'],
      receipts: ['3','receipt']
    }
  }
}

function get_message(bundle, locale) {
  return (bundle[locale] === 'undefined')? bundle[en_IN] : bundle[locale];
}

module.exports = sevaMachine;
