const { Machine, assign } = require('xstate');
const pgr = require('./pgr');
const bills = require('./bills');
const receipts = require('./receipts');
const {get_message, get_intention, INTENTION_UNKOWN} = require('./util/dialog.js');

const sevaMachine = Machine({
    id: 'mseva',
    initial: 'start',
    on: {
      USER_RESET: {
        target: 'sevamenu',
        actions: assign( (context, event) => context.chatInterface.toUser(context.user, get_message(messages.reset, context.user.locale)))
      }
    },
    states: {
        start: {
            on: {
              // USER_MESSAGE: 'locale'
              USER_MESSAGE: 'welcome'
            }
          },
          locale: {
            id: 'locale',
            initial: 'question',
            states: {
              question: {
                onEntry: assign((context, event) => {
                  context.chatInterface.toUser(context.user, get_message(messages.locale.question, context.user.locale));
                }),
                on: {
                  USER_MESSAGE: 'process'
                }
              },
              process: {
                onEntry: assign((context, event) => {
                  context.user.locale  = get_intention(grammer.locale.question, event, true);
                  if (context.user.locale === INTENTION_UNKOWN) {
                    context.user.locale = 'en_IN';
                    context.chatInterface.toUser(context.user, get_message(messages.error.proceeding, context.user.locale));      
                  }
                }),
                always: '#welcome'
              }
            }
          },
          welcome: {
            id: 'welcome',
            onEntry: assign( (context, event, meta) => {
              let hello = get_message(messages.welcome.hello, context.user.locale)(context.user.name); 
              let welcome = get_message(messages.welcome.welcome, context.user.locale); 
              context.chatInterface.toUser(context.user, `${hello} ${welcome}`);
            }),
            always: '#sevamenu'
          },
          sevamenu : { // TODO rename to menu if you can figure out how to avoid name clash with seva's menu
            id: 'sevamenu',
            initial: 'question',
            states: {
              question: {
                onEntry: assign( (context, event) => {
                    context.chatInterface.toUser(context.user, get_message(messages.sevamenu.question, context.user.locale));
                }),
                on: {
                    USER_MESSAGE: 'process'
                }
              },
              process: {
                onEntry: assign((context, event) => {
                  context.intention = get_intention(grammer.menu.question, event)
                }),
                always : [
                  {
                    target: '#pgr',
                    cond: (context) => context.intention == 'pgr'
                  },
                  {
                    target: '#bills', 
                    cond: (context) => context.intention == 'bills'
                  },
                  {
                    target: '#receipts', 
                    cond: (context) => context.intention == 'receipts'
                  },
                  {
                    target: '#locale', 
                    cond: (context) => context.intention == 'locale'
                  },
                  {
                    target: 'error'
                  }
                ]
              }, // sevamenu.process
              error: {
                onEntry: assign( (context, event) => {
                  context.chatInterface.toUser(context.user, get_message(messages.error.retry, context.user.locale));
                }),
                always : 'question'
              }, // sevamenu.error 
              pgr: pgr,
              bills: bills,
              receipts: receipts
        } // sevamenu.states
      }, // sevamenu
      endstate: {
        id: 'endstate',
        type: 'final', //Make it a final state so session manager kills this machine and creates a new one when user types again
        onEntry: assign((context, event) => {
          context.chatInterface.toUser(context.user, "Goodbye. Say hi to start another conversation");
        })
      }
    }, // states
}); // Machine

let messages = {
  reset: {
    en_IN: 'Ok. Let\'s start over.',
    hi_IN: 'ठीक। फिर से शुरू करते हैं।'
  },
  error: {
    retry: {
      en_IN: 'I am sorry, I didn\'t understand. Let\'s try again.',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर से कोशिश करें।'
    },
    proceeding: {
      en_IN: 'I am sorry, I didn\'t understand. But proceeding nonetheless',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर भी आगे बढ़ें।'
    }
  },
  locale : {
    question: {
      en_IN: "Please choose your preferred language\n1.English\n2. हिंदी",
      hi_IN: "कृपया अपनी पसंदीदा भाषा चुनें\n1.English\n2. हिंदी"
    }
  },
  welcome: {
    hello: {
      en_IN: (name)=>name? `Hello ${name}.\n`: `Hello,\n`,
      hi_IN: (name)=>name? `नमस्ते ${name},\n`: `नमस्ते।\n`
    },
    welcome: {
      en_IN: 'Welcome to the State of Punjab\'s Seva Chatline.\n You may type "seva" at any time to come back to this main menu',
      hi_IN: 'पंजाब राज्य शिकायत चैट लाइन में आपका स्वागत है।\n किसी भी अवस्था में, आप इस मुख्य मेनू पर वापस आने के लिए "सेवा" टाइप कर सकते हैं।',
    }
  },
  sevamenu: {
    question: {
      en_IN : 'Please type\n\n1 for Complaints\n2 for Bills\n3 for Receipts.\n\n5 to Change Language',
      hi_IN: 'कृप्या टाइप करे\n\n1 शिकायतों के लिए\n2 बिलों के लिए\n3 रसीदों के लिए\n\n5 भाषा बदलने के लिए'
    }
  }
}

let grammer = {
  locale: {
    question: [
      {intention: 'en_IN', recognize: ['1', 'english']},
      {intention: 'hi_IN', recognize: ['2', 'hindi']}
    ]
  },
  menu: {
    question: [
      {intention: 'pgr', recognize: ['1','complaint']}, 
      {intention: 'bills', recognize: ['2', 'bill']},
      {intention: 'receipts', recognize: ['3','receipt']},
      {intention: 'locale', recognize: ['5','language', 'english', 'hindi']}
    ]
  }
}

module.exports = sevaMachine;
