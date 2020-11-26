const { assign } = require('xstate');
const { billService } = require('./service/service-loader');
const dialog = require('./util/dialog');


const bills = {
  id: 'bills',
  initial: 'start',
  states: {
    start: {
      onEntry: assign((context, event) => {
        context.bills = {};
      }),
      invoke: {
        id: 'fetchBillsForUser',
        src: (context) => billService.fetchBillsForUser(context.user),
        onDone: [
          {
            target: 'personalBills',
            cond: (context, event) => {
              return event.data.pendingBills;
            },
            actions: assign((context, event) => {
              context.bills.pendingBills = event.data.pendingBills;
            })
          },
          {
            target: 'noBills',
            actions: assign((context, event) => {
              context.totalBills = event.data.totalBills;
            })
          }
        ],
        onError: {
          actions: assign((context, event) => {
            let message = 'Sorry. Some error occurred on server';
            context.chatInterface.toUser(context.user, message);
          })
        }
      }
    },
    personalBills: {
      id: 'personalBills',
      onEntry: assign((context, event) => {
        let message = dialog.get_message(messages.personalBills, context.user.locale);
        context.chatInterface.toUser(context.user, message);
      }),
      always: 'searchBillInitiate'
    },
    searchBillInitiate: {
      id: 'searchBillInitiate',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.searchBillInitiate.question, context.user.locale);
            context.chatInterface.toUser(context.user, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let messageText = event.message.input;
            let parsed = parseInt(event.message.input.trim())
            let isValid = parsed === 1;
            context.message = {
              isValid: isValid,
              messageContent: event.message.input
            };
          }),
          always: [
            {
              target: 'error',
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: '#billServices'
            }
          ]
        },
        error: {
          onEntry: assign( (context, event) => {
            let message = 'Sorry, I didn\'t understand';
            context.chatInterface.toUser(context.user, message);
          }),
          always : 'question'
        }
      }
    },
    noBills: {
      id: 'noBills',
      onEntry: assign( (context, event) => {
        if(context.totalBills === 0) {
          let message = dialog.get_message(messages.noBills.notLinked, context.user.locale);
          context.chatInterface.toUser(context.user, message);
        } else {
          let message = dialog.get_message(messages.noBills.noPending, context.user.locale);
          context.chatInterface.toUser(context.user, message);
        }
      }),
      always: 'billServices'
    },
    billServices: {
      id: 'billServices',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { services, messageBundle } = billService.getSupportedServicesAndMessageBundle();
            let preamble = dialog.get_message(messages.billServices.question.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
            context.grammer = grammer;
            context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
          }),
          on: {
            USER_MESSAGE: 'process'
          }    
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          always: [
            {
              target: 'error',
              cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
            },
            {
              target: '#searchParamOptions',
              actions: assign((context, event) => {
                context.slots.bills['service'] = context.intention;
              })
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            let message = 'Sorry, I didn\'t understand. Could please try again entering a number for the given options.';
            context.chatInterface.toUser(context.user, message);
          }),
          always: 'question'
        }
      }
    },
    searchParamOptions: {
      id: 'searchParamOptions',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { searchOptions, messageBundle } = billService.getSearchOptionsAndMessageBundleForService(context.slots.bills.service);
            let preamble = dialog.get_message(messages.searchParamOptions.question.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(searchOptions, messageBundle, context.user.locale);
            context.grammer = grammer;
            context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
          }),
          on: {
            USER_MESSAGE: 'process'
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          always: [
            {
              target: 'error',
              cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
            },
            {
              target: '#paramInput',
              actions: assign((context, event) => {
                context.slots.bills.searchParamOption = context.intention;
              })
            }  
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            let message = 'Sorry, I didn\'t understand. Could please try again entering a number for the given options.';
            context.chatInterface.toUser(context.user, message);
          }),
          always: 'question'
        }
      }
    },
    paramInput: {
      id: 'paramInput',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { option, example } = billService.getOptionAndExampleMessageBundle(context.slots.bills.service, context.slots.bills.searchParamOption);
            let message = dialog.get_message(messages.paramInput.question, context.user.locale);
            let optionMessage = dialog.get_message(option, context.user.locale);
            let exampleMessage = dialog.get_message(example, context.user.locale);
            message = message.replace('{{option}}', optionMessage);
            message = message.replace('{{example}}', exampleMessage);
            context.chatInterface.toUser(context.user, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let paramInput = event.message.input;
            let slots = context.slots.bills;
            context.isValid = billService.validateParamInput(slots.service, slots.searchParamOption, paramInput);
            if(context.isValid) {
              context.slots.bills.paramInput = paramInput;
            }
          }),
          always: [
            {
              target: '#listOfBills',
              cond: (context, event) => context.isValid
            },
            {
              target: 're_enter'
            }
          ]
        },
        re_enter: {
          onEntry: assign((context, event) => {
            let { option, example } = billService.getOptionAndExampleMessageBundle(context.slots.bills.service, context.slots.bills.searchParamOption);
            let message = dialog.get_message(messages.paramInput.re_enter, context.user.locale);
            let optionMessage = dialog.get_message(option, context.user.locale);
            message = message.replace('{{option}}', optionMessage);
            context.chatInterface.toUser(context.user, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        }
      }
    },
    listOfBills: {
      id: 'listOfBills',
      initial: 'fetch',
      states: {
        fetch: {
          invoke: {
            id: 'fetchBillsForParam',
            src: (context, event) => {
              let slots = context.slots.bills;
              return billService.fetchBillsForParam(context.user, slots.service, slots.searchParamOptions, slots.paramInput);
            },
            onDone: [
              {
                cond: (context, event) => event.data.pendingBills,
                actions: assign((context, event) => {
                  let message = 'Your Water 🚰 and Sewerage bill against consumer number WS123456 for property in Azad Nagar, Amritsar for the period Apr-June 2020 is Rs. 630. \n\nPay before 25th July 2020 to avoid late payment charges. \n\nPayment Link: www.mseva.gov.in/cpay/WSbill/WS123456';
                  context.chatInterface.toUser(context.user, message);
                }),
                target: '#searchBillInitiate'
              },
              {
                actions: assign((context, event) => {
                  let message = 'The ' + context.bills.slots.searchParamOption + ': ' + context.bills.slots.paramInput + ' is not found in our records. Please Check the details you have provided once again.';
                  context.chatInterface.toUser(context.user, message);
                }),
                target: '#searchBillInitiate'
              }
            ]
          }
        },

      },
    }
  }
};

let messages = {
  personalBills: {
    en_IN: 'Two bills found against your number:\n1. Water & Sewerage I Rs. 630 I Due on 25/06/20\nPayment Link: www.mseva.gov.in/cpay/WSbill/WS123456\n\n2. Property Tax I Rs. 1200 I Due on 30/09/20\nPayment Link: www.mseva.gov.in/cpay/tax/PT123456'
  },
  noBills: {
    notLinked: {
      en_IN: 'Sorry, your mobile number is not linked to any service. Contact your ULB to link it. You can avail service by searching your account information as given below:'
    },
    noPending: {
      en_IN: 'There are no pending bills against your account. You can still search the bills as given below'
    }
  },
  searchBillInitiate: {
    question: {
      en_IN: 'Please type and send ‘1’ to Search and Pay for other bills or fees which are not linked with your mobile number. \nOr \'mseva\' to Go ⬅️ Back to the main menu.'
    }
  },
  billServices: {
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below to search and pay:'
      }
    }
  },
  searchParamOptions: {
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      }
    }
  },
  paramInput: {
    question: {
      en_IN: 'Please Enter {{option}} to view the bill. {{example}}\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.'
    },
    re_enter: {
      en_IN: 'Sorry, the value you have provided is incorrect.\nPlease re-enter the {{option}} again to fetch the bills.\n\nOr Type and send \'mseva\' to Go ⬅️ Back to main menu.'
    }
  },
  listOfBills: {
    en_IN: ''
  }
}


module.exports = bills;