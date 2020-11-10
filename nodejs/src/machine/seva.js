const { Machine, assign } = require('xstate');
const pgr = require('./pgr');
const bills = require('./bills');
const receipts = require('./receipts');
const dialog = require('./util/dialog.js');

const sevaMachine = Machine({
    id: 'mseva',
    initial: 'start',
    on: {
      USER_RESET: {
        target: 'sevamenu',
        actions: assign( (context, event) => context.chatInterface.toUser(context.user, dialog.get_message(messages.reset, context.user.locale)))
      }
    },
    states: {
      start: {
        on: {
          USER_MESSAGE: [
            {
              cond: (context) => context.user.locale,
              target: '#welcome'
            },
            {
              target: '#onboardingWelcome'
            }
          ]
        }
      },
      onboardingWelcome: {
        id: 'onboardingWelcome',
        onEntry: assign((context, event) => {
          let message = 'Welcome to mSeva Punjab. Now you can file a complaint and track it’s status, you can also Pay your bills through whatsapp. \n\nmSeva पंजाब में आपका स्वागत🙏🏻 है। अब आप WhatsApp द्वारा कई सुविधाओं का लाभ ले सकते है जैसे शिकायत दर्ज करना, बिल का भुगतान करना।\n\nAt any stage type and send “mseva” to go to the main menu options.\n\nकिसी भी पड़ाव से main मेन्यू में वापस आने के लिए mSeva टाईप कर और भेजे।';
          context.chatInterface.toUser(context.user, message);
        }),
        always: '#onboardingLocale'
      },
      onboardingLocale: {
        id: 'onboardingLocale',
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              let message = 'Please Select the Language of your choice from the list given below:\n\nनीचे दिए गए पर्याय में से आपकी पसंदीदा भाषा का चयन करें।\n\n1. English\n2. हिंदी';
              context.grammer = grammer.locale.question;
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
              console.log(context.intention);
              if(context.intention != dialog.INTENTION_UNKOWN) {
                context.user.locale = context.intention;
              } else {
                context.user.locale = 'en_IN';
              }
            }),
            always: '#onboardingName'
          }
        }
      },
      onboardingName: {
        id: 'onboardingName',
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.onboardingName, context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let name = event.message.input.trim();
              if(name.toLowerCase() != 'no') {
                context.user.name = name;
              }
            }),
            always: [
              {
                cond: (context) => context.user.name,
                target: '#onboardingThankYou'
              },
              {
                target: '#welcome'
              }
            ]
          }
        }
      },
      onboardingThankYou: {
        id: 'onboardingThankYou',
        onEntry: assign((context, event) => {
          var message = dialog.get_message(messages.onboardingThankYou, context.user.locale);
          message = message.replace('{{name}}', context.user.name);
          context.chatInterface.toUser(context.user, message);
        }),
        always: '#welcome'
      },
      welcome: {
        id: 'welcome',
        onEntry: assign((context, event) => {
          var message = dialog.get_message(messages.welcome, context.user.locale);
          if(context.user.name)
            message = message.replace('{{name}}', context.user.name);
          else 
            message = message.replace('{{name}}', '');
          context.chatInterface.toUser(context.user, message);
        }),
        always: '#sevamenu'
      },

          locale: {
            id: 'locale',
            initial: 'question',
            states: {
              question: {
                onEntry: assign((context, event) => {
                  context.chatInterface.toUser(context.user, dialog.get_message(messages.locale.question, context.user.locale));
                }),
                on: {
                  USER_MESSAGE: 'process'
                }
              },
              process: {
                onEntry: assign((context, event) => {
                  context.user.locale  = dialog.get_intention(grammer.locale.question, event, true);
                  if (context.user.locale === dialog.INTENTION_UNKOWN) {
                    context.user.locale = 'en_IN';
                    context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.proceeding, context.user.locale));      
                  }
                }),
                always: '#welcome'
              }
            }
          },
          oldWelcome: {
            id: 'oldWelcome',
            onEntry: assign( (context, event, meta) => {
              let hello = dialog.get_message(messages.welcome.hello, context.user.locale)(context.user.name); 
              let welcome = dialog.get_message(messages.welcome.welcome, context.user.locale); 
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
                    context.chatInterface.toUser(context.user, dialog.get_message(messages.sevamenu.question, context.user.locale));
                }),
                on: {
                    USER_MESSAGE: 'process'
                }
              },
              process: {
                onEntry: assign((context, event) => {
                  context.intention = dialog.get_intention(grammer.menu.question, event, true)
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
                  context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.retry, context.user.locale));
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
        always: 'start',
        // type: 'final', //Make it a final state so session manager kills this machine and creates a new one when user types again
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
  locale : {
    question: {
      en_IN: "Please choose your preferred language\n1.English\n2. हिंदी",
      hi_IN: "कृपया अपनी पसंदीदा भाषा चुनें\n1.English\n2. हिंदी"
    }
  },
  welcome: {
    en_IN: 'Hi {{name}}, \nWelcome to mSeva Punjab 🙏. Now you can File a Complaint and track it’s status, you can also Pay your bills through WhatsApp.\nAt any stage type and send “mseva” to go to the main menu options.',
    hi_IN: 'नमस्ते {{name}}\nmSeva पंजाब में आपका स्वागत🙏🏻 है। अब आप WhatsApp द्वारा कई सुविधाओं का लाभ ले सकते है जैसे शिकायत दर्ज करना, बिल का भुगतान करना।\nकिसी भी पड़ाव से main मेन्यू में वापस आने के लिए mSeva टाईप कर और भेजे।'
  },
  sevamenu: {
    question: {
      en_IN : 'Please type\n\n1 for Complaints\n2 for Bills\n3 for Receipts.\n\n5 to Change Language',
      hi_IN: 'कृप्या टाइप करे\n\n1 शिकायतों के लिए\n2 बिलों के लिए\n3 रसीदों के लिए\n\n5 भाषा बदलने के लिए'
    }
  },
  onboardingName: {
    en_IN: 'Before moving further, please share your name to make your experience more personalized.\nElse if you don\'t want to share your name, type and send "*No*".'
  },
  onboardingThankYou: {
    en_IN: 'Thank you so much {{name}} for the details, we are happy to serve you.'
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
